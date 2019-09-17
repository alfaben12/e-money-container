const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');

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
	}
}