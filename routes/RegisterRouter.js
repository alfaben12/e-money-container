const express = require('express');
const router = express.Router();
const RegisterController = require('../controllers/RegisterController');

router.post(
	'/',
	RegisterController.processAccountRegister
);

module.exports = router;
