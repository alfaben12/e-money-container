const express = require('express');
const router = express.Router();
const PaymentGatewayController = require('../controllers/PaymentGatewayController');
const JWT = require('../helpers/JWT');

router.get(
    '/',
	PaymentGatewayController.processGetPaymentGateway
);

router.get(
    '/containers/',
	PaymentGatewayController.processGetPaymentGatewayContainer
);

module.exports = router;
