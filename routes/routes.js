const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getUserInfo } = require('../controllers/dashboard');

//Dashboard
router.get('/dashboard', verifyToken, getUserInfo)

module.exports = router;