const Joi = require('joi');

exports.actionSchema = Joi.object({
  invoice: Joi.string().required(),
  type: Joi.string().valid('call', 'email', 'visit').required(),
  note: Joi.string().allow('', null)
});
