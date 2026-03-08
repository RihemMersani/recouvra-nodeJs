const mongoose = require('mongoose');
const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');
const ApiError = require('../utils/apiError');

async function createPayment({ invoiceId, amount, method, recordedBy }) {
  if (!invoiceId) throw new ApiError(400, 'invoice is required');
  if (!amount || amount <= 0) throw new ApiError(400, 'amount must be > 0');

  // Support both transactional and non-transactional environments.
  const useTransactions = process.env.USE_TRANSACTIONS === 'true';

  if (useTransactions) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const invoice = await Invoice.findById(invoiceId).session(session);
      if (!invoice) throw new ApiError(404, 'Invoice not found');
      const remaining = (invoice.amount || 0) - (invoice.paid || 0);
      if (amount > remaining) {
        throw new ApiError(400, 'Payment amount exceeds outstanding invoice balance');
      }
      const payment = (await Payment.create([{ invoice: invoiceId, amount, method, recordedBy }], { session }))[0];
      invoice.paid = (invoice.paid || 0) + amount;
      invoice.recalculateStatus();
      await invoice.save({ session });
      await session.commitTransaction();
      session.endSession();
      return { payment, invoice };
    } catch (err) {
      try { await session.abortTransaction(); } catch (e) { /* ignore */ }
      session.endSession();
      throw err;
    }
  }

  // Non-transactional / test fallback
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  const remaining = (invoice.amount || 0) - (invoice.paid || 0);
  if (amount > remaining) throw new ApiError(400, 'Payment amount exceeds outstanding invoice balance');
  const payment = await Payment.create({ invoice: invoiceId, amount, method, recordedBy });
  invoice.paid = (invoice.paid || 0) + amount;
  invoice.recalculateStatus();
  await invoice.save();
  return { payment, invoice };
}

module.exports = { createPayment };
