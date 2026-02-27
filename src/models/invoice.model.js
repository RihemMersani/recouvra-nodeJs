const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  reference: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','partially_paid','paid','overdue'], default: 'pending' },
  dueDate: { type: Date }
}, { timestamps: true });

// Helper to update status based on paid/amount/dueDate
InvoiceSchema.methods.recalculateStatus = function () {
  if (this.paid >= this.amount) {
    this.status = 'paid';
  } else if (this.paid > 0) {
    this.status = 'partially_paid';
  } else if (this.dueDate && this.dueDate < new Date()) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
};

module.exports = mongoose.model('Invoice', InvoiceSchema);
