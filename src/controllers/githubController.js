const {
	fetchAllPages,
	getAccessToken,
} = require("../helpers/githubHelpers.js");

const axios = require("axios");
const GithubIntegration = require("../models/githubIntegration");
const Org = require("../models/org");
const Repo = require("../models/repo");
const Commit = require("../models/commit");
const Pull = require("../models/pull");
const Issue = require("../models/issue");
const User = require("../models/user");

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// 1️⃣ Redirect user to GitHub OAuth
exports.redirectToGithub = (req, res) => {
	const redirect_uri = encodeURIComponent(
		"http://localhost:3000/auth/github/callback"
	);
	const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=repo,user,read:org,read:user`;
	res.redirect(url);
};

// 2️⃣ Handle GitHub OAuth callback
exports.githubCallback = async (req, res) => {
	const code = req.query.code;
	if (!code) return res.status(400).send("No code provided");

	try {
		const tokenResponse = await axios.post(
			"https://github.com/login/oauth/access_token",
			{ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code },
			{ headers: { Accept: "application/json" } }
		);

		const { access_token, scope, token_type } = tokenResponse.data;

		const userResponse = await axios.get("https://api.github.com/user", {
			headers: { Authorization: `token ${access_token}` },
		});

		const { id: githubId, login } = userResponse.data;

		await GithubIntegration.findOneAndUpdate(
			{ githubId },
			{
				githubId,
				login,
				access_token,
				scope,
				token_type,
				connectedAt: new Date(),
				userProfile: userResponse.data,
			},
			{ upsert: true, new: true }
		);

		res.send("✅ GitHub integration successful!");
	} catch (err) {
		console.error(err);
		res.status(500).send("GitHub OAuth failed");
	}
};

// 3️⃣ Get integration status
exports.getStatus = async (req, res) => {
	try {
		const integration = await GithubIntegration.findOne();
		if (!integration)
			return res.json({ connected: false, connectedAt: null, user: null });
		res.json({
			connected: true,
			connectedAt: integration.connectedAt,
			user: integration,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch status" });
	}
};

// 4️⃣ Remove integration + all GitHub data
exports.removeIntegration = async (req, res) => {
	try {
		await GithubIntegration.deleteMany({});
		await Org.deleteMany({});
		await Repo.deleteMany({});
		await Commit.deleteMany({});
		await Pull.deleteMany({});
		await Issue.deleteMany({});
		await User.deleteMany({});
		res.json({ success: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to remove integration" });
	}
};

// 5️⃣ Resync integration: fetch orgs, repos, commits, pulls, issues, users
exports.resyncIntegration = async (req, res) => {
	try {
		const token = await getAccessToken();

		// Fetch orgs
		const orgs = await fetchAllPages("https://api.github.com/user/orgs", token);

		// Clear old data
		await Org.deleteMany({});
		await Repo.deleteMany({});
		await Commit.deleteMany({});
		await Pull.deleteMany({});
		await Issue.deleteMany({});
		await User.deleteMany({});

		// Save orgs
		await Org.insertMany(
			orgs.map((o) => ({
				id: o.id,
				login: o.login,
				url: o.url,
				description: o.description,
				type: o.type,
			}))
		);

		for (const org of orgs) {
			// Fetch all repos for org
			const repos = await fetchAllPages(
				`https://api.github.com/orgs/${org.login}/repos`,
				token
			);
			await Repo.insertMany(
				repos.map((r) => ({
					id: r.id,
					name: r.name,
					full_name: r.full_name,
					org: org.login,
					private: r.private,
					url: r.url,
				}))
			);

			for (const repo of repos) {
				// Commits
				const commits = await fetchAllPages(
					`https://api.github.com/repos/${org.login}/${repo.name}/commits`,
					token
				);
				await Commit.insertMany(
					commits.map((c) => ({
						sha: c.sha,
						org: org.login,
						repo: repo.name,
						message: c.commit.message,
						author_name: c.commit.author.name,
						author_email: c.commit.author.email,
						committer_name: c.commit.committer.name,
						committer_email: c.commit.committer.email,
						url: c.html_url,
						date: c.commit.author.date,
					}))
				);

				// Pulls
				const pulls = await fetchAllPages(
					`https://api.github.com/repos/${org.login}/${repo.name}/pulls`,
					token
				);
				await Pull.insertMany(
					pulls.map((p) => ({
						id: p.id,
						org: org.login,
						repo: repo.name,
						number: p.number,
						title: p.title,
						user_id: p.user.id,
						user_login: p.user.login,
						state: p.state,
					}))
				);

				// Issues
				const issues = await fetchAllPages(
					`https://api.github.com/repos/${org.login}/${repo.name}/issues`,
					token
				);
				await Issue.insertMany(
					issues.map((i) => ({
						id: i.id,
						org: org.login,
						repo: repo.name,
						number: i.number,
						title: i.title,
						user_id: p.user.id,
						user_login: p.user.login,
						state: i.state,
					}))
				);
			}

			// Users in org
			try {
				const users = await fetchAllPages(
					`https://api.github.com/orgs/${org.login}/members`,
					token
				);
				await User.insertMany(
					users.map((u) => ({
						id: u.id,
						login: u.login,
						org: org.login,
						url: u.url,
						type: u.type,
					}))
				);
			} catch (err) {
				console.warn(
					`Failed to fetch members for org ${org.login}: ${err.message}`
				);
			}
		}

		res.json({ success: true, orgsFetched: orgs.length });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Resync failed" });
	}
};
