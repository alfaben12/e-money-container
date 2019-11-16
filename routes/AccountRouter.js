const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/AccountController');
const JWT = require('../helpers/JWT');
const Redis = require('../middlewares/Redis');

router.get(
	'/',
	JWT.JWTverify,
	Redis.cacheAccount,
	AccountController.processFetchAccountDatas
);

router.get(
	'/:code',
	AccountController.processFetchAccountDatasByCode
);

router.put(
	'/savings',
	JWT.JWTverify,
	AccountController.processSetupBalanceSaving
);

router.put(
	'/',
	JWT.JWTverify,
	AccountController.processUpdateAccount
);

module.exports = router;
