const express = require('express');
const router = express.Router();
const EmoneyContainerController = require('../controllers/EmoneyContainerController');
const JWT = require('../helpers/JWT');

router.post(
    '/',
	JWT.JWTverify,
	EmoneyContainerController.processSetupPaymentGatewayContainer
);

router.post(
    '/move/',
	EmoneyContainerController.processMoveToContainer
);

module.exports = router;
