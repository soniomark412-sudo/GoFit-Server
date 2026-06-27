// src/routes/auth.js
const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login } = require('../controllers/auth.controllers');

// Connect routes to controller functions
router.post('/register', register);
router.post('/login', login);

module.exports = router;