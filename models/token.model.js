const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
  token: { type: String, required: true },
  createAt: { type: Date, required: true, default: Date.now, expires: 3600 },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Token', tokenSchema);