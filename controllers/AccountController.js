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

	processFetchAccountDataParking: async function(req, res) {
		/* PARAMETER ZSequelize VOUCHER  */
		let accountid = req.params.accountid;

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

	processModifyAccount: async function(req, res) {
		/* PARAMS */
		let accountid = req.payload.accountid;

		/* POST BODY */
        let acc_username = req.body.username;
        let acc_password = req.body.password;
        let acc_full_name = req.body.full_name;
        let acc_email = req.body.email;
        let acc_address = req.body.address;

		/* PARAMETER ZSequelize VOUCHER  */
		let acc_value = {
            username: acc_username,
            password: acc_password,
            full_name: acc_full_name,
            email: acc_email,
            address: acc_address
		};

		let acc_where = {
			id: accountid
		};

		/* UPDATE ZSequelize VOUCHER */
		let acc_result = await ZSequelize.updateValues(acc_value, acc_where, "AccountModel");
	
		 /* FETCTH RESULT & CONDITION & RESPONSE */
		if (acc_result.result) {
			return res.status(200).json({
				result : acc_result.result,
				data: {
					code: 200,
					message: "Success modify data."
				}
			});
		}else{
			return res.status(404).json({
				result : acc_result.result,
				data: {
					code: 404,
					message: "Account does not exist."
				},
			});
		}
	},
}