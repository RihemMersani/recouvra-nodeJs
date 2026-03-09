const Joi = require('joi');

exports.invoiceSchema = Joi.object({
  client: Joi.string().required(),
  reference: Joi.string().required(),
  amount: Joi.number().positive().required(),
  dueDate: Joi.date().optional()
});
