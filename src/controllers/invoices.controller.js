const Invoice = require('../models/invoice.model');

exports.create = async (req, res, next) => {
  try {
    const inv = await Invoice.create(req.body);
    inv.recalculateStatus();
    await inv.save();
    res.status(201).json(inv);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const items = await Invoice.find().populate('client');
    res.json(items);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Invoice.findById(req.params.id).populate('client');
    if (!item) return next(new (require('../utils/apiError'))(404, 'Invoice not found'));
    res.json(item);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Invoice.findById(req.params.id);
    if (!item) return next(new (require('../utils/apiError'))(404, 'Invoice not found'));
    Object.assign(item, req.body);
    item.recalculateStatus();
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};
