const mongoose = require('mongoose');
const { Schema } = mongoose;

const GithubIntegrationSchema = new Schema({
  githubId: { type: Number, required: true, unique: true }, // GitHub user ID
  login: { type: String },                                   // GitHub username
  access_token: { type: String, required: true },           // OAuth token
  scope: { type: String },
  token_type: { type: String },
  connectedAt: { type: Date, default: Date.now },           // When integration was done
  userProfile: { type: Schema.Types.Mixed },               // Store full GitHub profile if needed
  orgsSyncedAt: { type: Date }                              // Optional: track last sync
}, { strict: false });

module.exports = mongoose.model(
  'GithubIntegration',
  GithubIntegrationSchema,
  'github-integration'  // collection name in MongoDB
);
