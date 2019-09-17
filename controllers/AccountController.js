const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');

module.exports = {
	processFetchAccountDatas: async function(req, res) {
		/* PARAMETER ZSequelize VOUCHER  */
		let accountid = req.payload.accountid;

		/* FETCH ZSequelize VOUCHER */
		let account_result = await AccountHelper.getAccount(accountid);
		
		/* FETCTH RESULT & CONDITION & RESPONSE */
		if (account_result.result) {
			return res.status(200).json({
				result : account_result.result,
				data: {
					code: 200,
					message: "Success fetch data.",
					datas: account_result.dataValues
				}
			});
		}else{
			return res.status(404).json({
				result : account_result.result,
				data:{
					code: 404,
					message: "Data does not exist ."
				},
			});
		}
	},

	processFetchAccountDatasByCode: async function(req, res) {
		/* PARAMETER ZSequelize VOUCHER  */
		let code = req.params.code;
		/* PARAMETER ZSequelize */
		let field = ['id', 'code'];
		let where = {
			code: code
		};
		let orderBy = false;
		let groupBy = false;
		let model = 'AccountModel';

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