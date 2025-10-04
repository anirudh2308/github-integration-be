const mongoose = require('mongoose');

const pullSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  org: { type: String },
  repo: { type: String },
  number: { type: Number },
  title: { type: String },
  user: { type: Object },
  state: { type: String },
  raw: { type: Object }
});

module.exports = mongoose.model('Pull', pullSchema);
