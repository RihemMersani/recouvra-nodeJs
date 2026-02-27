const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  type: { type: String, enum: ['call','email','visit'], required: true },
  note: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Action', ActionSchema);
