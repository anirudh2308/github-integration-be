const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema(
	{
		sha: { type: String, required: true, unique: true },
		org: { type: String },
		repo: { type: String },
		message: { type: String },
		author_name: { type: String },
		author_email: { type: String },
		committer_name: { type: String },
		committer_email: { type: String },
		url: { type: String },
		date: { type: Date },
	},
	{ versionKey: false }
);

module.exports = mongoose.model("Commit", commitSchema);
