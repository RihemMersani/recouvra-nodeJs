const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
