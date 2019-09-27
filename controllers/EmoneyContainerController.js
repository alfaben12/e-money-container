const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');
const request = require('request')
const Op = require('sequelize').Op;
const sequelize = require('sequelize');

module.exports = {
	processSetupPaymentGatewayContainer: async function(req, res) {
		/* PARAMETER ZSequelize */
		let accountid = req.payload.accountid;

		/* FETCH ZSequelize */
		let account_result = await AccountHelper.getAccount(accountid);
        
        let payment_gateway_containerid = req.body.payment_gateway_containerid;
        let payment_gateway_account_apikey = req.body.payment_gateway_account_apikey;

		/* PARAMETER ZSequelize */
		let validation_field = ['accountid', 'api_key', 'balance'];
		let validation_where = {
			[Op.and]: [{accountid: accountid}, {api_key: payment_gateway_account_apikey}, {payment_gateway_name: payment_gateway_containerid}]
		};

		let validation_orderBy = [['accountid', 'DESC']];
		let validation_groupBy = false;
		let validation_model = 'ApiPaymentGatewayAccountModel';

		/* FETCH ZSequelize */
		let validation_accountData = await ZSequelize.fetch(false, validation_field, validation_where, validation_orderBy, validation_groupBy, validation_model);

		if (validation_accountData.dataValues == null) {
			return res.status(400).json({
				result : false,
				data:{
					code: 400,
					message: "Failed account can't integrated or third-party not found."
				},
			});
		}
		let balance = parseInt(validation_accountData.dataValues.balance);

		let value = {
            accountid: accountid,
            payment_gateway_containerid: payment_gateway_containerid,
            payment_gateway_account_apikey: payment_gateway_account_apikey,
            balance: balance
		};
		
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
		/* PARAMETER ZSequelize  */
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
					let account_balance = parseInt(account_result.dataValues.balance, 10);
					let account_saving_balance = parseInt(account_result.dataValues.saving_balance, 10);

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
							let balance = parseInt(container.dataValues.balance, 10);

							/* TRANSACTION */
							/* PARAMETER VALIDATION */
							let validationField = [
								[sequelize.fn('IFNULL', (sequelize.fn('sum', sequelize.col('nominal'))), 0), 'transaction_total']
							];
							let validationWhere = {
								accountid: accountid,
								is_transferred: 1,
								[Op.not]: [{to_payment_gateway_name: 'SAVING'}]
							};

							let validationOrderBy = false;
							let validationGroupBy = false;
							let validationModel = 'AccountPaymentHistoryModel';

							/* FETCH Duplicate Data */
							let validationTransaction = await ZSequelize.fetch(true, validationField, validationWhere, validationOrderBy, validationGroupBy, validationModel);
							let data = {
								'transaction_total': validationTransaction.dataValues
							};

							let cartTotal = data.transaction_total;
							let transaction_total = parseInt(cartTotal[0].dataValues.transaction_total, 10);
							/* END TRANSACTION */

							/* GET ACC RESULT LIMIT TRANSACTION */
							let account_result = await AccountHelper.getAccount(accountid);
							let account_limit_transaction = parseInt(account_result.dataValues.account_role.transaction_limit, 10);
							transaction_total = transaction_total + nominal;
							
							/* END GET ACC RESULT LIMIT TRANSACTION */

							let is_transferred = 0;
							if (account_limit_transaction < transaction_total) {
								// return res.status(400).json({
								// 	result : account_result.result,
								// 	data:{
								// 		code: 400,
								// 		message: "Your account can't received because limit transaction."
								// 	},
								// });
								is_transferred = 0;
							}else{
								is_transferred = 1;
							}

							let insert = {
								accountid: accountid,
								from_payment_gateway_name: from_payment_gateway_name,
								to_payment_gateway_name: to_payment_gateway_name,
								nominal: nominal,
								uuid: uuid,
								is_transferred: is_transferred
							};

							let result_insert = await ZSequelize.insertValues(insert, "AccountPaymentHistoryModel");

							let container_message = "CONTAINER";
							if (is_transferred == 1) {
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
								container_message = "CONTAINER";
							}else{
								container_message = "TEMP CONTAINER";
							}

							let result_container_condition = true;

							/* FETCTH RESULT & CONDITION & RESPONSE */
							if (result_container_condition) {
								return res.status(200).json({
									result : result_container_condition,
									data:{
										code: 200,
										message: "Success move balance to "+ container_message
									}
								});
							}else{
								return res.status(404).json({
									result : false,
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
						let balance = parseInt(container.dataValues.balance, 10);

						/* TRANSACTION */
						/* PARAMETER VALIDATION */
						let validationField = [
							[sequelize.fn('IFNULL', (sequelize.fn('sum', sequelize.col('nominal'))), 0), 'transaction_total']
						];
						let validationWhere = {
							accountid: accountid,
							is_transferred: 1,
							[Op.not]: [{to_payment_gateway_name: 'SAVING'}]
						};

						let validationOrderBy = false;
						let validationGroupBy = false;
						let validationModel = 'AccountPaymentHistoryModel';

						/* FETCH Duplicate Data */
						let validationTransaction = await ZSequelize.fetch(true, validationField, validationWhere, validationOrderBy, validationGroupBy, validationModel);
						let data = {
							'transaction_total': validationTransaction.dataValues
						};

						let cartTotal = data.transaction_total;
						let transaction_total = parseInt(cartTotal[0].dataValues.transaction_total, 10);
						/* END TRANSACTION */

						/* GET ACC RESULT LIMIT TRANSACTION */
						let account_result = await AccountHelper.getAccount(accountid);
						let account_limit_transaction = parseInt(account_result.dataValues.account_role.transaction_limit, 10);
						transaction_total = transaction_total + nominal;
						/* END GET ACC RESULT LIMIT TRANSACTION */

						let is_transferred = 0;
						if (account_limit_transaction < transaction_total) {
							// return res.status(400).json({
							// 	result : account_result.result,
							// 	data:{
							// 		code: 400,
							// 		message: "Your account can't received because limit transaction."
							// 	},
							// });
							is_transferred = 0;
						}else{
							is_transferred = 1;
						}

						let insert = {
							accountid: accountid,
							from_payment_gateway_name: from_payment_gateway_name,
							to_payment_gateway_name: to_payment_gateway_name,
							nominal: nominal,
							uuid: uuid,
							is_transferred: is_transferred
						};

						let result_insert = await ZSequelize.insertValues(insert, "AccountPaymentHistoryModel");

						let container_message = "CONTAINER";
						if (is_transferred == 1) {
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
							container_message = "CONTAINER";
						}else{
							container_message = "TEMP CONTAINER";
						}

						let result_container_condition = true;

						/* FETCTH RESULT & CONDITION & RESPONSE */
						if (result_container_condition) {
							return res.status(200).json({
								result : result_container_condition,
								data:{
									code: 200,
									message: "Success move balance to "+ container_message
								}
							});
						}else{
							return res.status(404).json({
								result : false,
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
	},
	processTransferPendingPayment: async function(req, res) {
		let nominal = parseInt(req.body.nominal, 10);
		let paymenthistoryid = req.body.paymenthistoryid;
		let accountid = req.payload.accountid;

		/* TRANSACTION */
		/* PARAMETER VALIDATION */
		let validationField = [
			[sequelize.fn('IFNULL', (sequelize.fn('sum', sequelize.col('nominal'))), 0), 'transaction_total']
		];
		let validationWhere = {
			accountid: accountid,
			is_transferred: 1,
			[Op.not]: [{to_payment_gateway_name: 'SAVING'}]
		};

		let validationOrderBy = false;
		let validationGroupBy = false;
		let validationModel = 'AccountPaymentHistoryModel';

		/* FETCH Duplicate Data */
		let validationTransaction = await ZSequelize.fetch(true, validationField, validationWhere, validationOrderBy, validationGroupBy, validationModel);
		let data = {
			'transaction_total': validationTransaction.dataValues
		};

		let cartTotal = data.transaction_total;
		let transaction_total = parseInt(cartTotal[0].dataValues.transaction_total, 10);
		/* END TRANSACTION */

		/* GET ACC RESULT LIMIT TRANSACTION */
		let account_result = await AccountHelper.getAccount(accountid);
		let account_limit_transaction = parseInt(account_result.dataValues.account_role.transaction_limit, 10);
		transaction_total = transaction_total + nominal;
		/* END GET ACC RESULT LIMIT TRANSACTION */

		if (account_limit_transaction < transaction_total) {
			return res.status(400).json({
				result : account_result.result,
				data:{
					code: 400,
					message: "Your account can't received because limit transaction."
				},
			});
		}

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
		let payment_gateway_account_apikey = container.dataValues.payment_gateway_account_apikey;
		let balance = parseInt(container.dataValues.balance, 0);

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

		/* UPDATE HISTORY */
		let update_history = {
			is_transferred: 1
		};

		let where_history = {
			id: paymenthistoryid
		};

		let result_api_container_account = await ZSequelize.updateValues(update_history, where_history, "AccountPaymentHistoryModel");
		
		/* FETCTH RESULT & CONDITION & RESPONSE */
		if (result_api_container_account.result) {
			return res.status(200).json({
				result : result_api_container_account.result,
				data:{
					code: 200,
					message: "Success move balance to CONTAINER"
				}
			});
		}else{
			return res.status(404).json({
				result : false,
				data:{
					code: 404,
					message: "Data not found."
				}
			});
		}
	}
}