require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const GithubIntegration = require("./models/githubIntegration");

const githubRoutes = require("./routes/github");
const entityRoutes = require("./routes/entity");
const globalSearchRoutes = require("./routes/globalSearch");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use("/auth/github", githubRoutes);
app.use("/api/entity", entityRoutes);
app.use("/api/globalSearch", globalSearchRoutes);

app.get("/test-model", async (req, res) => {
	try {
		const count = await GithubIntegration.countDocuments();
		res.json({ count });
	} catch (err) {
		res.status(500).json({ error: "Error fetching count" });
	}
});

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("✅ MongoDB connected"))
	.catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
