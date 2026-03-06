const paymentsService = require('../services/payments.service');

exports.create = async (req, res, next) => {
  try {
    const { invoice: invoiceId, amount, method } = req.body;
    const recordedBy = req.user && req.user.sub;
    const result = await paymentsService.createPayment({ invoiceId, amount, method, recordedBy });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const items = await require('../models/payment.model').find().populate('invoice');
    res.json(items);
  } catch (err) { next(err); }
};
