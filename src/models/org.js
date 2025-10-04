const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  login: { type: String },
  url: { type: String },
  description: { type: String },
  type: { type: String },
  raw: { type: Object } // Store full API response if needed
});

module.exports = mongoose.model('Org', orgSchema);
