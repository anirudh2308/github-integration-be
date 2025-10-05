// src/routes/entity.js
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');

router.get('/:entity', entityController.getEntityData);

module.exports = router;