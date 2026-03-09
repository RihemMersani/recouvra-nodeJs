const Joi = require('joi');

exports.paymentSchema = Joi.object({
  invoice: Joi.string().required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('manual','card','bank').default('manual')
});
