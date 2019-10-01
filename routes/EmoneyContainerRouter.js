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


router.post(
    '/transfer',
    JWT.JWTverify,
    EmoneyContainerController.processTransferPendingPayment
)

router.get(
    '/integrations',
    JWT.JWTverify,
    EmoneyContainerController.processFetchPaymentThirdParty
)

router.get(
    '/debugme',
    JWT.JWTverify,
    EmoneyContainerController.debugMe
)

router.post(
    '/updatebalanceapis',
    JWT.JWTverify,
    EmoneyContainerController.processUpdateBalanceApi
)


module.exports = router;
