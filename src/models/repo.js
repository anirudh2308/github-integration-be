const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
	{
		id: { type: Number, required: true, unique: true },
		name: { type: String },
		full_name: { type: String },
		org: { type: String },
		private: { type: Boolean },
		url: { type: String },
	},
	{ versionKey: false }
);

module.exports = mongoose.model("Repo", repoSchema);
