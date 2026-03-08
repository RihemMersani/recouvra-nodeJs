const Invoice = require('../models/invoice.model');
const ApiError = require('../utils/apiError');

async function createInvoice(data) {
  const inv = await Invoice.create(data);
  inv.recalculateStatus();
  await inv.save();
  return inv;
}

async function getInvoiceById(id) {
  const inv = await Invoice.findById(id).populate('client');
  if (!inv) throw new ApiError(404, 'Invoice not found');
  return inv;
}

module.exports = { createInvoice, getInvoiceById };
