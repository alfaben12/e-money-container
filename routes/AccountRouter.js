const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/AccountController');
const JWT = require('../helpers/JWT');

router.get(
	'/',
	JWT.JWTverify,
	AccountController.processFetchAccountDatas
);

router.get(
	'/:code',
	AccountController.processFetchAccountDatasByCode
);

module.exports = router;
