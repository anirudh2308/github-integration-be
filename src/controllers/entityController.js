// src/controllers/entityController.js
const Org = require("../models/org");
const Repo = require("../models/repo");
const Commit = require("../models/commit");
const Pull = require("../models/pull");
const Issue = require("../models/issue");
const User = require("../models/user");

// Map entity name → Mongoose model
const entityMap = {
	orgs: Org,
	repos: Repo,
	commits: Commit,
	pulls: Pull,
	issues: Issue,
	users: User,
};

exports.getEntityData = async (req, res) => {
	try {
		const { entity } = req.params;
		const {
			page = 1,
			limit = 50,
			sortField = "id",
			sortOrder = "asc",
			search = "",
			filters = "{}", // AG Grid sends this as JSON string
		} = req.query;

		const Model = entityMap[entity.toLowerCase()];
		if (!Model) return res.status(400).json({ error: "Unknown entity type" });

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
		const cleanedSearch = search.trim();
		const parsedFilters = JSON.parse(filters);

		// --- Build global search filter ---
		const paths = Object.keys(Model.schema.paths).filter(
			(key) => !["_id", "__v"].includes(key)
		);
		const searchFilter = cleanedSearch
			? {
					$or: paths.flatMap((key) => {
						const fieldType = Model.schema.paths[key].instance;
						if (fieldType === "String")
							return [{ [key]: { $regex: cleanedSearch, $options: "i" } }];
						if (fieldType === "Number")
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
						if (fieldType === "Date")
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
						return [];
					}),
			  }
			: {};

		// --- Build per-column filter ---
		const columnFilter = {};
		for (const key in parsedFilters) {
			const f = parsedFilters[key];
			if (!f || f.filter === null || f.filter === undefined) continue;

			const fieldType = Model.schema.paths[key]?.instance;
			if (!fieldType) continue;

			if (fieldType === "String") {
				columnFilter[key] = { $regex: f.filter, $options: "i" };
			} else if (fieldType === "Number") {
				if (f.type === "equals") columnFilter[key] = Number(f.filter);
				else if (f.type === "lessThan")
					columnFilter[key] = { $lt: Number(f.filter) };
				else if (f.type === "greaterThan")
					columnFilter[key] = { $gt: Number(f.filter) };
				// Add more AG Grid number filter types as needed
			} else if (fieldType === "Date") {
				const dateVal = new Date(f.filter);
				if (!isNaN(dateVal.getTime())) {
					if (f.type === "equals") columnFilter[key] = dateVal;
					else if (f.type === "lessThan") columnFilter[key] = { $lt: dateVal };
					else if (f.type === "greaterThan")
						columnFilter[key] = { $gt: dateVal };
				}
			}
		}

		// --- Combine search + column filters ---
		const finalQuery =
			Object.keys(searchFilter).length > 0
				? Object.keys(columnFilter).length > 0
					? { $and: [searchFilter, columnFilter] }
					: searchFilter
				: columnFilter;

		const [total, data] = await Promise.all([
			Model.countDocuments(finalQuery),
			Model.find(finalQuery).sort(sort).skip(skip).limit(parseInt(limit)),
		]);

		res.json({
			entity,
			total,
			page: parseInt(page),
			limit: parseInt(limit),
			data,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch entity data" });
	}
};
