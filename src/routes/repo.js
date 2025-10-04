const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

router.get('/orgs', repoController.getOrgs);
router.get('/orgs/:org/repos', repoController.getOrgRepos);
router.get('/repos/:org/:repo/commits', repoController.getRepoCommits);
router.get('/repos/:org/:repo/pulls', repoController.getRepoPulls);
router.get('/repos/:org/:repo/issues', repoController.getRepoIssues);

module.exports = router;