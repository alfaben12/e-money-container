const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');
const request = require('request')
const Op = require('sequelize').Op;

module.exports = {
	processSetupPaymentGatewayContainer: async function(req, res) {
		/* PARAMETER ZSequelize */
		let accountid = req.payload.accountid;

		/* FETCH ZSequelize */
		let account_result = await AccountHelper.getAccount(accountid);
        
        let payment_gateway_containerid = req.body.payment_gateway_containerid;
        let payment_gateway_account_apikey = req.body.payment_gateway_account_apikey;
        let balance = req.body.balance;

		/* PARAMETER ZSequelize */
		let validation_field = ['accountid', 'api_key', 'balance'];
		let validation_where = {
			[Op.and]: [{accountid: accountid}, {api_key: payment_gateway_account_apikey}]
		};

		let validation_orderBy = [['accountid', 'DESC']];
		let validation_groupBy = false;
		let validation_model = 'ApiPaymentGatewayAccountModel';

		/* FETCH ZSequelize */
		let validation_accountData = await ZSequelize.fetch(false, validation_field, validation_where, validation_orderBy, validation_groupBy, validation_model);

		let value = {
            accountid: accountid,
            payment_gateway_containerid: payment_gateway_containerid,
            payment_gateway_account_apikey: payment_gateway_account_apikey,
            balance: validation_accountData.dataValues.balance
		};

		if (validation_accountData.dataValues == null) {
			return res.status(400).json({
				result : false,
				data:{
					code: 400,
					message: "Failed account can't integrated or third-party not found."
				},
			});
		}

        /* FETCTH RESULT & CONDITION & RESPONSE */
		if (account_result.dataValues.account_payment_container != null) {
            /* UPDATE */
            let where = {
                accountid: accountid
            };

		    let result = await ZSequelize.updateValues(value, where, "AccountPaymentContainerModel");

            return res.status(200).json({
				result : account_result.result,
				data:{
					code: 200,
					message: "Data success updated."
				},
            });
		}else{
		    let result = await ZSequelize.insertValues(value, "AccountPaymentContainerModel");

			return res.status(201).json({
				result : account_result.result,
				data:{
					code: 201,
					message: "Data success created."
				},
			});
		}
	},

	processMoveToContainer: async function(req, res) {
		let from_payment_gateway_name = req.body.payment_gateway_name;
		let nominal = parseInt(req.body.nominal, 10);
		let uuid = req.body.uuid;
		let accountid = req.body.accountid;

		let mutation_flag = false;
		request.post('http://bank.kutjur.com/index.php/apis/mutations', {
			form: {
				nominal: nominal,
				payment_gateway_name: from_payment_gateway_name
			}
		}, async function(error, response) {
			mutation_flag = JSON.parse(response.body);
			mutation_flag = mutation_flag.result;
			if (mutation_flag == false) {
				return res.status(200).json({
					result : mutation_flag,
					data:{
						code: 404,
						message: "Mutation not found."
					}
			    });
			}else{
				request.post('http://bank.kutjur.com/index.php/apis/update_mutation', {
					form: {
						uuid: uuid
					}
				}, async function(error1, response1) {
					mutation_update_flag = JSON.parse(response1.body);
					mutation_update_flag = mutation_update_flag.result;

					if (mutation_update_flag == false) {
						return res.status(200).json({
							result : mutation_update_flag,
							data:{
								code: 500,
								message: "Server error."
							}
						});
					}

					/* GET ACC RESTULT BALANCE & SAVING */
					let account_result = await AccountHelper.getAccount(accountid);
					let account_balance = account_result.dataValues.balance;
					let account_saving_balance = account_result.dataValues.saving_balance;

					if (account_saving_balance != 0) {
						if (account_balance < account_saving_balance) {
							let update = {
								balance: account_balance + nominal
							};
	
							/* UPDATE */
							let where_account = {
								id: accountid
							};
							let result_account = await ZSequelize.updateValues(update, where_account, "AccountModel");
							let to_payment_gateway_name = "SAVING";
							let balance = account_balance;
							
							let insert = {
								accountid: accountid,
								from_payment_gateway_name: from_payment_gateway_name,
								to_payment_gateway_name: to_payment_gateway_name,
								nominal: nominal,
								uuid: uuid,
								is_transferred: 1
							};
							
							let result_insert = await ZSequelize.insertValues(insert, "AccountPaymentHistoryModel");
	
							/* FETCTH RESULT & CONDITION & RESPONSE */
							if (result_insert.result) {
								return res.status(200).json({
									result : result_insert.result,
									data:{
										code: 200,
										message: "Success move balance to SAVING."
									}
								});
							}else{
								return res.status(404).json({
									result : result_insert.result,
									data:{
										code: 404,
										message: "Data not found."
									}
								});
							}
						}else{
							/* FETCH ZSequelize */
							let field = ['id', 'payment_gateway_containerid', 'payment_gateway_account_apikey', 'balance'];
							let where = {
								accountid: accountid
							};
							let orderBy = false;
							let groupBy = false;
							let model = 'AccountPaymentContainerModel'
							let joins = [
								[
									{
										'fromModel' : 'AccountPaymentContainerModel',
										'fromKey' : 'payment_gateway_containerid',
										'bridgeType' : 'belongsTo',
										'toModel' : 'PaymentGatewayContainerModel',
										'toKey' : 'id',
										'attributes' : ['id', 'name'],
										'required' : true
									}
								]
							];

							let container = await ZSequelize.fetchJoins(false, field, where, orderBy, groupBy, model, joins);
							let to_payment_gateway_name = container.dataValues.payment_gateway_container.name;
							let payment_gateway_account_apikey = container.dataValues.payment_gateway_account_apikey;
							let balance = container.dataValues.balance;

							let insert = {
								accountid: accountid,
								from_payment_gateway_name: from_payment_gateway_name,
								to_payment_gateway_name: to_payment_gateway_name,
								nominal: nominal,
								uuid: uuid,
								is_transferred: 1
							};

							let result_insert = await ZSequelize.insertValues(insert, "AccountPaymentHistoryModel");

							let update = {
								balance: balance + nominal
							};

							/* UPDATE */
							let where_container_account = {
								accountid: accountid
							};

							/* UPDATE */
							let where_container = {
								api_key: payment_gateway_account_apikey
							};

							let result_container_account = await ZSequelize.updateValues(update, where_container_account, "AccountPaymentContainerModel");
							let result_container = await ZSequelize.updateValues(update, where_container, "ApiPaymentGatewayAccountModel");

							/* FETCTH RESULT & CONDITION & RESPONSE */
							if (result_container.result) {
								return res.status(200).json({
									result : result_container.result,
									data:{
										code: 200,
										message: "Success move balance to CONTAINER."
									}
								});
							}else{
								return res.status(404).json({
									result : result_container.result,
									data:{
										code: 404,
										message: "Data not found."
									}
								});
							}
						}
					}else{
						/* FETCH ZSequelize */
						let field = ['id', 'payment_gateway_containerid', 'payment_gateway_account_apikey', 'balance'];
						let where = {
							accountid: accountid
						};
						let orderBy = false;
						let groupBy = false;
						let model = 'AccountPaymentContainerModel'
						let joins = [
							[
								{
									'fromModel' : 'AccountPaymentContainerModel',
									'fromKey' : 'payment_gateway_containerid',
									'bridgeType' : 'belongsTo',
									'toModel' : 'PaymentGatewayContainerModel',
									'toKey' : 'id',
									'attributes' : ['id', 'name'],
									'required' : true
								}
							]
						];

						let container = await ZSequelize.fetchJoins(false, field, where, orderBy, groupBy, model, joins);
						let to_payment_gateway_name = container.dataValues.payment_gateway_container.name;
						let payment_gateway_account_apikey = container.dataValues.payment_gateway_account_apikey;
						let balance = container.dataValues.balance;

						let insert = {
							accountid: accountid,
							from_payment_gateway_name: from_payment_gateway_name,
							to_payment_gateway_name: to_payment_gateway_name,
							nominal: nominal,
							uuid: uuid,
							is_transferred: 1
						};

						let result_insert = await ZSequelize.insertValues(insert, "AccountPaymentHistoryModel");

						let update = {
							balance: balance + nominal
						};

						/* UPDATE */
						let where_container_account = {
							accountid: accountid
						};

						/* UPDATE */
						let where_container = {
							api_key: payment_gateway_account_apikey
						};

						let result_container_account = await ZSequelize.updateValues(update, where_container_account, "AccountPaymentContainerModel");
						let result_container = await ZSequelize.updateValues(update, where_container, "ApiPaymentGatewayAccountModel");

						/* FETCTH RESULT & CONDITION & RESPONSE */
						if (result_container.result) {
							return res.status(200).json({
								result : result_container.result,
								data:{
									code: 200,
									message: "Success move balance to CONTAINER."
								}
							});
						}else{
							return res.status(404).json({
								result : result_container.result,
								data:{
									code: 404,
									message: "Data not found."
								}
							});
						}
					}
				});
			}
		});
	}	
}