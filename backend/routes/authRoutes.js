const express = require('express');
const router = express.Router();
const { registerLecturer, loginUser } = require('../controllers/authController');

router.post('/register', registerLecturer); // Only lecturers can register
router.post('/login', loginUser);          // All users login here

module.exports = router;
