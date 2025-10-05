require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
const GithubIntegration = require("./models/githubIntegration");

// Routes
const githubRoutes = require("./routes/github");
const entityRoutes = require("./routes/entity");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use("/auth/github", githubRoutes);
app.use("/api/entity", entityRoutes);

// Test route
app.get("/test-model", async (req, res) => {
	try {
		const count = await GithubIntegration.countDocuments();
		res.json({ count });
	} catch (err) {
		res.status(500).json({ error: "Error fetching count" });
	}
});

// MongoDB connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("✅ MongoDB connected"))
	.catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
