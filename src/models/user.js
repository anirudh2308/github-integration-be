const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  login: { type: String },
  org: { type: String },
  url: { type: String },
  type: { type: String }
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
