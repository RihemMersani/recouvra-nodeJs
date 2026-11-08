const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roles = ['agent', 'manager', 'admin'];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: roles, default: 'agent' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// CORRECTION ICI : On retire "next" et on utilise async/await directement
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = {
  User: mongoose.model('User', UserSchema),
  roles,
};