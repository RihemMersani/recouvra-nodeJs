const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const Client = require('../models/client.model');
const Invoice = require('../models/invoice.model');
const Payment = require('../models/payment.model');
const paymentsService = require('../services/payments.service');

const router = express.Router();
const cookieName = 'recouvra_token';
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
};

function requirePageAuth(req, res, next) {
  const token = req.cookies && req.cookies[cookieName];
  if (!token) return res.redirect('/login');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
  } catch (err) {
    res.clearCookie(cookieName, cookieOptions);
    return res.redirect('/login');
  }

  User.findById(payload.sub).select('-password')
    .then((user) => {
      if (!user || user.isActive === false) {
        res.clearCookie(cookieName, cookieOptions);
        return res.redirect('/login');
      }
      req.user = { sub: user._id.toString(), role: user.role, ...user.toObject() };
      next();
    })
    .catch(next);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Sign in',
    user: null,
    error: req.query.error || null
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).render('auth/login', {
        title: 'Sign in',
        user: null,
        error: 'Enter your email address and password.'
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)) || user.isActive === false) {
      return res.status(401).render('auth/login', {
        title: 'Sign in',
        user: null,
        error: 'The email or password you entered is incorrect.'
      });
    }

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    res.cookie(cookieName, token, cookieOptions);
    return res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie(cookieName, cookieOptions);
  res.redirect('/login');
});

router.get('/dashboard', requirePageAuth, async (req, res, next) => {
  try {
    const user = req.user;
    const isAdmin = user.role === 'admin' || user.role === 'manager';
    const isClient = user.role === 'client';
    let clients = [];
    let invoices = [];
    let payments = [];
    let users = [];
    let stats;
    const recentSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (isAdmin) {
      const [clientCount, recentPaymentCount, invoiceTotals, recentPayments] = await Promise.all([
        Client.countDocuments(),
        Payment.countDocuments({ createdAt: { $gte: recentSince } }),
        Invoice.aggregate([
          { $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalPaid: { $sum: '$paid' }
          } }
        ]),
        Payment.find().sort({ createdAt: -1 }).limit(8)
          .populate({ path: 'invoice', populate: { path: 'client', select: 'name company' } })
      ]);
      users = await User.find().select('name email role isActive createdAt').sort({ createdAt: -1 });
      clients = await Client.find().populate('assignedAgent', 'name').sort({ createdAt: -1 });
      const totals = invoiceTotals[0] || { totalAmount: 0, totalPaid: 0 };
      payments = recentPayments;
      stats = {
        clients: clientCount,
        debt: Math.max(totals.totalAmount - totals.totalPaid, 0),
        payments: recentPaymentCount
      };
    } else if (isClient) {
      const client = user.client ? await Client.findById(user.client) : null;
      clients = client ? [client] : [];
      invoices = client
        ? await Invoice.find({ client: client._id }).sort({ createdAt: -1 })
        : [];
      const invoiceIds = invoices.map((invoice) => invoice._id);
      payments = invoiceIds.length
        ? await Payment.find({ invoice: { $in: invoiceIds } }).sort({ createdAt: -1 }).populate('invoice')
        : [];
      stats = {
        clients: client ? 1 : 0,
        debt: invoices.reduce((sum, invoice) => sum + Math.max(invoice.amount - invoice.paid, 0), 0),
        payments: payments.filter((payment) => payment.createdAt >= recentSince).length
      };
    } else {
      clients = await Client.find({ assignedAgent: user._id }).sort({ createdAt: -1 });
      const clientIds = clients.map((client) => client._id);
      invoices = clientIds.length
        ? await Invoice.find({ client: { $in: clientIds } }).populate('client').sort({ createdAt: -1 })
        : [];
      const invoiceIds = invoices.map((invoice) => invoice._id);
      payments = invoiceIds.length
        ? await Payment.find({ invoice: { $in: invoiceIds } }).sort({ createdAt: -1 }).populate('invoice')
        : [];
      stats = {
        clients: clients.length,
        debt: invoices.reduce((sum, invoice) => sum + Math.max(invoice.amount - invoice.paid, 0), 0),
        payments: payments.filter((payment) => payment.createdAt >= recentSince).length
      };
    }

    return res.render('dashboard/index', {
      title: 'Dashboard',
      user,
      isAdmin,
      isClient,
      clients,
      invoices,
      payments,
      users,
      stats,
      formatCurrency,
      notice: req.query.notice || null
    });
  } catch (err) {
    next(err);
  }
});

router.post('/dashboard/payments', requirePageAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'agent' && req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).send('You are not allowed to record payments.');
    }

    const { invoice: invoiceId, amount, method } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).send('Invoice not found.');

    if (req.user.role === 'agent') {
      const assignment = await Client.exists({ _id: invoice.client, assignedAgent: req.user._id });
      if (!assignment) return res.status(403).send('This invoice is not assigned to you.');
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).send('Enter a valid payment amount.');
    }
    if (!['manual', 'card', 'bank'].includes(method)) {
      return res.status(400).send('Select a valid payment method.');
    }

    await paymentsService.createPayment({
      invoiceId,
      amount: numericAmount,
      method,
      recordedBy: req.user.sub
    });
    return res.redirect('/dashboard?notice=payment-recorded');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
