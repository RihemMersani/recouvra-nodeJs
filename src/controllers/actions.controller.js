const Action = require('../models/action.model');

exports.create = async (req, res, next) => {
  try {
    const doc = await Action.create(Object.assign({}, req.body, { performedBy: req.user && req.user.sub }));
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const items = await Action.find().populate('invoice');
    res.json(items);
  } catch (err) { next(err); }
};
