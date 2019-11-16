const express = require('express');
const router = express.Router();
const PaymentHistoryController = require('../controllers/PaymentHistoryController');
const JWT = require('../helpers/JWT');
const Redis = require('../middlewares/Redis');

router.get(
    '/',
    JWT.JWTverify,
	Redis.cacheHistory,
	PaymentHistoryController.processGetPaymentHistory
);

module.exports = router;
