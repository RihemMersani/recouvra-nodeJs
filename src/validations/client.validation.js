const Joi = require('joi');

exports.clientSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  company: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});
