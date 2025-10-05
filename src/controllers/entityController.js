// src/controllers/entityController.js
const Org = require('../models/org');
const Repo = require('../models/repo');
const Commit = require('../models/commit');
const Pull = require('../models/pull');
const Issue = require('../models/issue');
const User = require('../models/user');

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
    const { entity } = req.params; // e.g., 'commits'
    const { page = 1, limit = 50, sortField = 'id', sortOrder = 'asc', search = '' } = req.query;

    const Model = entityMap[entity.toLowerCase()];
    if (!Model) return res.status(400).json({ error: 'Unknown entity type' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    // Build search filter
    const searchFilter = search
      ? {
          $or: Object.keys(Model.schema.paths)
            .filter(key => ['String', 'Number'].includes(Model.schema.paths[key].instance))
            .map(key => ({ [key]: { $regex: search, $options: 'i' } })),
        }
      : {};

    const [total, data] = await Promise.all([
      Model.countDocuments(searchFilter),
      Model.find(searchFilter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
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
    res.status(500).json({ error: 'Failed to fetch entity data' });
  }
};
