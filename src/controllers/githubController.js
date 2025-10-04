// src/controllers/authController.js
const axios = require('axios');
const GithubIntegration = require('../models/githubIntegration');

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Step 1: redirect user to GitHub OAuth page
exports.redirectToGithub = (req, res) => {
  const redirect_uri = encodeURIComponent('http://localhost:3000/auth/github/callback');
  const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=repo,user`;
  res.redirect(url);
};

// Step 2: handle GitHub callback
exports.githubCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token, scope, token_type } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` }
    });

    const { id: githubId, login } = userResponse.data;

    // Upsert integration in MongoDB
    await GithubIntegration.findOneAndUpdate(
      { githubId },
      { githubId, login, access_token, scope, token_type, connectedAt: new Date(), userProfile: userResponse.data },
      { upsert: true, new: true }
    );

    res.send('✅ GitHub integration successful!');
  } catch (err) {
    console.error(err);
    res.status(500).send('GitHub OAuth failed');
  }
};

// Get integration status
exports.getStatus = async (req, res) => {
  try {
    const integration = await GithubIntegration.findOne();
    if (!integration) return res.json({ connected: false, connectedAt: null, user: null });
    res.json({ connected: true, connectedAt: integration.connectedAt, user: integration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

// Remove integration
exports.removeIntegration = async (req, res) => {
  try {
    await GithubIntegration.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove integration' });
  }
};

// Resync integration
exports.resyncIntegration = async (req, res) => {
  try {
    const integration = await GithubIntegration.findOne();
    if (!integration) return res.status(400).json({ error: 'No integration found' });

    const token = integration.access_token;

    // Example: fetch orgs, could extend to repos/pulls/issues
    const orgsRes = await axios.get('https://api.github.com/user/orgs', {
      headers: { Authorization: `token ${token}` }
    });

    // Store orgs in DB if desired, or just confirm fetch
    // await OrgModel.insertMany(orgsRes.data);

    res.json({ success: true, orgsFetched: orgsRes.data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Resync failed' });
  }
};