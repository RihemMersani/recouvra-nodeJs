const Client = require('../models/client.model');

exports.create = async (req, res, next) => {
  try {
    const doc = await Client.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const items = await Client.find();
    res.json(items);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Client.findById(req.params.id);
    if (!item) return next(new (require('../utils/apiError'))(404, 'Client not found'));
    res.json(item);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return next(new (require('../utils/apiError'))(404, 'Client not found'));
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};
