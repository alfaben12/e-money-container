const express = require('express');
const router = express.Router();
const PaymentHistoryController = require('../controllers/PaymentHistoryController');
const JWT = require('../helpers/JWT');

router.get(
    '/',
    JWT.JWTverify,
	PaymentHistoryController.processGetPaymentHistory
);

module.exports = router;
