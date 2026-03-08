const Invoice = require('../models/invoice.model');

exports.overview = async (req, res, next) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const agg = await Invoice.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalPaid: { $sum: '$paid' } } }
    ]);
    const totals = agg[0] || { totalAmount: 0, totalPaid: 0 };
    const overdue = await Invoice.countDocuments({ status: 'overdue' });
    res.json({ totalInvoices, totalAmount: totals.totalAmount, totalPaid: totals.totalPaid, totalDue: totals.totalAmount - totals.totalPaid, overdue });
  } catch (err) { next(err); }
};
