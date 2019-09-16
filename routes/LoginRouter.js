const express = require('express');
const router = express.Router();
const LoginController = require('../controllers/LoginController');

router.post(
	'/',
	LoginController.processAccountLogin
);

router.get(
	'/accounts/',
	LoginController.processGetAccountLogin
);

module.exports = router;
