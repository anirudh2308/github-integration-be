const express = require("express");
const router = express.Router();
const githubController = require("../controllers/githubController");

// OAuth & integration
router.get("/connect", githubController.redirectToGithub);
router.get("/callback", githubController.githubCallback);
router.get("/status", githubController.getStatus);
router.delete("/remove", githubController.removeIntegration);
router.post("/resync", githubController.resyncIntegration);

module.exports = router;
