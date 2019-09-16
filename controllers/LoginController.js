const ZSequelize = require('../libraries/ZSequelize');
const JWTAuth = require('../helpers/JWT');
const AccountHelper = require('../helpers/AccountHelper');

module.exports = {
    processAccountLogin: async function(req, res) {
		/* POST BODY */
		let username = req.body.username;
		let password = req.body.password;

		/* PARAMETER ZSequelize */
		let field = ['id', 'username', 'full_name', 'email'];
		let where = {
			username: username,
			password: password
		  	};
		let orderBy = [['id', 'DESC']];
		let groupBy = false;
		let model = 'AccountModel';

		/* FETCH ZSequelize */
		let accountData = await ZSequelize.fetch(false, field, where, orderBy, groupBy, model);

		/* FETCTH RESULT & CONDITION & RESPONSE */
		if (accountData.result) {
			let accountid = accountData.dataValues.id;
			let helperAccountData = await AccountHelper.getAccount(accountid);

			let jwtToken = await JWTAuth.JWTsign(accountid);
		
			/* SET RESPONSE */
			return res.status(200).json({
				result: accountData.result,
				data : {
					code: 200,
					message: "Successfull login.",
					datas:{
						accountData: helperAccountData.dataValues,
						jwtTokenData: jwtToken
					}
				}
			});
		}else{
			return res.status(404).json({
				result : accountData.result,
				data:{
					code: 404,
					message: "Data does not exist ."
				},
			});
		}
	},

	processGetAccountLogin: async function(req, res){
		/* PARAMETER ZSequelize */
		let field = ['id', 'full_name', 'email', 'username', 'password', 'createdAt'];
		let where = false;
		let orderBy = false;
		let groupBy = false;
		let model = 'AccountModel'
		let joins = [
			[
				{
					'fromModel' : 'AccountModel',
					'fromKey' : 'roleid',
					'bridgeType' : 'belongsTo',
					'toModel' : 'AccountRoleModel',
					'toKey' : 'id',
					'attributes' : ['id', 'name'],
					'required': true
				}
			]
		];
		let account = await ZSequelize.fetchJoins(true, field, where, orderBy, groupBy, model, joins);

		/* SET RESPONSE */
		return res.status(200).json({
			result: account.result,
			data : {
				code: 200,
				message: "Successfull fetch data.",
				datas: account.dataValues
			}
		});
	}
}