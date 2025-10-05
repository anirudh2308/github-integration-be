const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  org: { type: String },
  repo: { type: String },
  number: { type: Number },
  title: { type: String },
  user_id: { type: Number },
  user_login: { type: String },
  state: { type: String }
}, { versionKey: false });

module.exports = mongoose.model('Issue', issueSchema);
