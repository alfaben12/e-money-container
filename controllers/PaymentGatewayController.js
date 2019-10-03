const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');
const Op = require('sequelize').Op;

module.exports = {
	processGetPaymentGateway: async function(req, res) {
		/* PARAMETER ZSequelize */
		let field = ['id', 'name', 'payment_gateway_name', 'api_key', 'balance', 'createdAt', 'updatedAt'];
		let where = false;
		let orderBy = [['name', 'ASC']];
		let groupBy = false;
		let model = 'PaymentGatewayModel';

		/* FETCH ZSequelize */
		let result = await ZSequelize.fetch(true, field, where, orderBy, groupBy, model);

        /* FETCTH RESULT & CONDITION & RESPONSE */
		if (result.dataValues != null) {
            return res.status(200).json({
				result : result.result,
				data:{
					code: 200,
					message: "Success get data.",
					data: result.dataValues
				},
            });
		}else{
			return res.status(404).json({
				result : result.result,
				data:{
					code: 404,
					message: "Data not found."
				},
			});
		}
	},

	processGetPaymentGatewayContainer: async function(req, res) {
		/* PARAMETER ZSequelize */
		let field = ['id', 'name', 'image', 'position', 'createdAt', 'updatedAt'];
		let where = false;
		let orderBy = [['name', 'ASC']];
		let groupBy = false;
		let model = 'PaymentGatewayContainerModel';

		/* FETCH ZSequelize */
		let result = await ZSequelize.fetch(true, field, where, orderBy, groupBy, model);

        /* FETCTH RESULT & CONDITION & RESPONSE */
		if (result.dataValues != null) {
            return res.status(200).json({
				result : result.result,
				data:{
					code: 200,
					message: "Success get data.",
					data: result.dataValues
				},
            });
		}else{
			return res.status(404).json({
				result : result.result,
				data:{
					code: 404,
					message: "Data not found."
				},
			});
		}
	},

	processAddPaymentApi: async function(req, res) {
		/* POST BODY */
		let accountid = req.payload.accountid;
		let payment_gateway_typeid = 1;
		let name = req.body.name;
		let payment_gateway_name = req.body.payment_gateway_name;
		let api_key = req.body.api_key;
		let balance = req.body.balance;

		/* PARAMETER ZSequelize */
		let validation_field = ['accountid'];
		let validation_where = {
			[Op.and]: [{accountid: accountid}, {payment_gateway_name: payment_gateway_name}, {api_key: api_key}]
		};

		let validation_orderBy = false;
		let validation_groupBy = false;
		let validation_model = 'ApiPaymentGatewayAccountModel';

		/* FETCH ZSequelize */
		let validation_accountData = await ZSequelize.fetch(false, validation_field, validation_where, validation_orderBy, validation_groupBy, validation_model);

		if (validation_accountData.dataValues != null) {
			return res.status(409).json({
				result : false,
				data:{
					code: 409,
					message: "Failed payment gateway already registered."
				},
			});
		}

		/* PARAMETER ZSequelize VOUCHER  */
		let acc_value = {
			accountid: accountid,
			payment_gateway_typeid: payment_gateway_typeid,
			name: name,
			payment_gateway_name: payment_gateway_name,
			api_key: api_key,
			balance: balance
		};

		/* INSERT ZSequelize VOUCHER */
		let acc_result = await ZSequelize.insertValues(acc_value, "ApiPaymentGatewayAccountModel");
	
		 /* FETCTH RESULT & CONDITION & RESPONSE */
		 if (acc_result.result) {
			return res.status(201).json({
				result : acc_result.result,
				data: {
					code: 201,
					message: "Success create account.",
					datas: acc_result.record
				}
			});
		}else{
			return res.status(404).json({
				result : acc_result.result,
				data:{
					code: 404,
					message: "Failed create account."
				},
			});
		}
	}
}