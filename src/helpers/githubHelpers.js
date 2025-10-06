const axios = require("axios");
const GithubIntegration = require("../models/githubIntegration");

async function fetchAllPages(url, token) {
	let results = [];
	let page = 1;
	while (true) {
		const res = await axios.get(`${url}?per_page=100&page=${page}`, {
			headers: { Authorization: `token ${token}` },
		});
		if (!res.data || res.data.length === 0) break;
		results.push(...res.data);
		page++;
	}
	return results;
}

async function getAccessToken() {
	const integration = await GithubIntegration.findOne();
	if (!integration) throw new Error("No GitHub integration found");
	return integration.access_token;
}

module.exports = { fetchAllPages, getAccessToken };
