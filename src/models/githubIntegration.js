const mongoose = require("mongoose");
const { Schema } = mongoose;

const GithubIntegrationSchema = new Schema(
	{
		githubId: { type: Number, required: true, unique: true },
		login: { type: String },
		access_token: { type: String, required: true },
		scope: { type: String },
		token_type: { type: String },
		connectedAt: { type: Date, default: Date.now },
		userProfile: { type: Schema.Types.Mixed },
		orgsSyncedAt: { type: Date },
	},
	{ strict: false }
);

module.exports = mongoose.model(
	"GithubIntegration",
	GithubIntegrationSchema,
	"github-integration"
);
