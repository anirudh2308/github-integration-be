const Org = require("../models/org");
const Repo = require("../models/repo");
const Commit = require("../models/commit");
const Pull = require("../models/pull");
const Issue = require("../models/issue");
const User = require("../models/user");

const entityMap = {
	orgs: Org,
	repos: Repo,
	commits: Commit,
	pulls: Pull,
	issues: Issue,
	users: User,
};

exports.fetchAllCollections = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 50,
			sortField = "id",
			sortOrder = "asc",
			search = "",
		} = req.query;

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
		const cleanedSearch = search.trim();

		const results = {};

		await Promise.all(
			Object.entries(entityMap).map(async ([entity, Model]) => {
				const paths = Object.keys(Model.schema.paths).filter(
					(key) => !["_id", "__v"].includes(key)
				);

				const searchFilter = {
					$or: paths.flatMap((key) => {
						const fieldType = Model.schema.paths[key].instance;

						if (fieldType === "String") {
							return [{ [key]: { $regex: cleanedSearch, $options: "i" } }];
						}

						if (fieldType === "Number") {
							return [
								{
									$expr: {
										$regexMatch: {
											input: { $toString: `$${key}` },
											regex: cleanedSearch,
											options: "i",
										},
									},
								},
							];
						}

						if (fieldType === "Date") {
							return [
								{
									$expr: {
										$regexMatch: {
											input: {
												$dateToString: { format: "%Y-%m-%d", date: `$${key}` },
											},
											regex: cleanedSearch,
											options: "i",
										},
									},
								},
							];
						}

						return [];
					}),
				};

				const [total, data] = await Promise.all([
					Model.countDocuments(searchFilter),
					Model.find(searchFilter).sort(sort).skip(skip).limit(parseInt(limit)),
				]);

				results[entity] = { total, data };
			})
		);

		res.json({
			global: true,
			search: cleanedSearch,
			results,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch global entity data" });
	}
};
