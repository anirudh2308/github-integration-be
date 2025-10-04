const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

router.get('/github/connect', githubController.redirectToGithub);
router.get('/github/callback', githubController.githubCallback);

router.get('/github/status', githubController.getStatus);
router.post('/github/resync', githubController.resyncIntegration);
router.delete('/github/remove', githubController.removeIntegration);

module.exports = router;
