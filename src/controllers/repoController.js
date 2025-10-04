// src/controllers/githubController.js
const axios = require('axios');
const GithubIntegration = require('../models/githubIntegration');

// Helper to get access token
async function getAccessToken() {
  const integration = await GithubIntegration.findOne();
  if (!integration) throw new Error('No GitHub integration found');
  return integration.access_token;
}

// Get organizations
exports.getOrgs = async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get('https://api.github.com/user/orgs', {
      headers: { Authorization: `token ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch orgs');
  }
};

// Get repos for an org
exports.getOrgRepos = async (req, res) => {
  try {
    const token = await getAccessToken();
    const { org } = req.params;
    const response = await axios.get(`https://api.github.com/orgs/${org}/repos`, {
      headers: { Authorization: `token ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch repos');
  }
};

// Get commits for a repo
exports.getRepoCommits = async (req, res) => {
  try {
    const token = await getAccessToken();
    const { org, repo } = req.params;
    const response = await axios.get(`https://api.github.com/repos/${org}/${repo}/commits`, {
      headers: { Authorization: `token ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch commits');
  }
};

// Get pull requests for a repo
exports.getRepoPulls = async (req, res) => {
  try {
    const token = await getAccessToken();
    const { org, repo } = req.params;
    const response = await axios.get(`https://api.github.com/repos/${org}/${repo}/pulls`, {
      headers: { Authorization: `token ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch pulls');
  }
};

// Get issues for a repo
exports.getRepoIssues = async (req, res) => {
  try {
    const token = await getAccessToken();
    const { org, repo } = req.params;
    const response = await axios.get(`https://api.github.com/repos/${org}/${repo}/issues`, {
      headers: { Authorization: `token ${token}` }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch issues');
  }
};
