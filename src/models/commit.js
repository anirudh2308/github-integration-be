const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  sha: { type: String, required: true, unique: true },
  org: { type: String },
  repo: { type: String },
  message: { type: String },
  author: { type: Object },
  committer: { type: Object },
  raw: { type: Object }
});

module.exports = mongoose.model('Commit', commitSchema);
