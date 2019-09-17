const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');
const request = require('request')

module.exports = {
	processSetupPaymentGatewayContainer: async function(req, res) {
		/* PARAMETER ZSequelize */
		let accountid = req.payload.accountid;

		/* FETCH ZSequelize */
		let account_result = await AccountHelper.getAccount(accountid);
        
        let payment_gateway_containerid = req.body.payment_gateway_containerid;
        let payment_gateway_account_apikey = req.body.payment_gateway_account_apikey;
        let balance = req.body.balance;

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
		let from_payment_gateway_name = req.body.payment_gateway_name;
		let nominal = parseInt(req.body.nominal, 10);
		let uuid = req.body.uuid;
		let accountid = req.body.accountid;

		  var post_data = 'nominal='+ nominal +'&payment_gateway_name='+ from_payment_gateway_name +"&uuid="+ uuid,
		  headers = {
			  host: 'bank.kutjur.com',
			  method: 'POST',
			  path: '/index.php/apis/mutations',
			  headers: {
				  'Content-Length': Buffer.byteLength(post_data)
			  }
		  };
	  
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
						message: "Success move balance."
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
		});
	}	
}