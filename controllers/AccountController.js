const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');
const Op = require('sequelize').Op;
const redis = require('redis');
module.exports = {
	processFetchAccountDatas: async function(req, res) {
		/* PARAMETER ZSequelize  */
		let accountid = req.payload.accountid;

		 // create and connect redis client to local instance.
		 const client = redis.createClient(6379)
  
		 // echo redis errors to the console
		 client.on('error', (err) => {
			 console.log("Error " + err)
		 });

		/* FETCH ZSequelize */
		let account_result = await AccountHelper.getAccount(accountid);
		
		/* FETCTH RESULT & CONDITION & RESPONSE */
		if (account_result.result) {
			// Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
            client.setex('ZPAY:account:'+account_result.dataValues.id, 3600, JSON.stringify(account_result.dataValues));
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
		let field = ['id', 'code', 'full_name'];
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
	},

	processSetupBalanceSaving: async function(req, res) {
		/* PARAMETER ZSequelize  */
		let accountid = req.payload.accountid;
		let balance_saving = parseInt(req.body.balance_saving, 10);

		/* GET ACC RESTULT BALANCE & SAVING */
		let account_result = await AccountHelper.getAccount(accountid);
		let account_saving_balance = parseInt(account_result.dataValues.saving_balance, 10);
		let account_balance = parseInt(account_result.dataValues.balance, 10);

		if (balance_saving < account_balance) {
			return res.status(400).json({
				result : account_result.result,
				data:{
					code: 400,
					message: "Saving balance should than current balance."
				},
			});
		}
		
		/* PARAMETER ZSequelize VOUCHER  */
		let value = {
			saving_balance: balance_saving
		};

		let where = {
			id: accountid
		};

		/* UPDATE ZSequelize VOUCHER */
		let account_insert = await ZSequelize.updateValues(value, where, "AccountModel");
		
		/* FETCTH RESULT & CONDITION & RESPONSE */
		if (account_insert.result) {
			return res.status(200).json({
				result : account_insert.result,
				data: {
					code: 200,
					message: "Success setup saving."
				}
			});
		}else{
			return res.status(404).json({
				result : account_insert.result,
				data:{
					code: 404,
					message: "Data does not exist ."
				},
			});
		}
	},

	processUpdateAccount: async function(req, res) {
		/* PARAMETER ZSequelize  */
		let accountid = req.payload.accountid;
		/* POST BODY */

        let acc_username = req.body.username;
        let acc_password = req.body.password;
        let acc_full_name = req.body.full_name;
        let acc_email = req.body.email;
        let acc_address = req.body.address;

		// /* PARAMETER ZSequelize */
		// let validation_field = ['id', 'username', 'full_name', 'email'];
		// let validation_where = {
		// 	[Op.or]: [{username: acc_username}, {email: acc_email}]
		// };

		// let validation_orderBy = [['id', 'DESC']];
		// let validation_groupBy = false;
		// let validation_model = 'AccountModel';

		// /* FETCH ZSequelize */
		// let validation_accountData = await ZSequelize.fetch(false, validation_field, validation_where, validation_orderBy, validation_groupBy, validation_model);

		// if (validation_accountData.dataValues != null) {
		// 	return res.status(409).json({
		// 		result : false,
		// 		data:{
		// 			code: 409,
		// 			message: "Failed account already registered."
		// 		},
		// 	});
		// }
		
		/* PARAMETER ZSequelize VOUCHER  */
		let value = {
            username: acc_username,
            password: acc_password,
            full_name: acc_full_name,
            email: acc_email,
            address: acc_address
		};

		let where = {
			id: accountid
		};

		/* UPDATE ZSequelize VOUCHER */
		let account_update = await ZSequelize.updateValues(value, where, "AccountModel");
		
		/* FETCTH RESULT & CONDITION & RESPONSE */
		if (account_update.result) {
			return res.status(200).json({
				result : account_update.result,
				data: {
					code: 200,
					message: "Success update account."
				}
			});
		}else{
			return res.status(404).json({
				result : account_update.result,
				data:{
					code: 404,
					message: "Data does not exist ."
				},
			});
		}
	},
}