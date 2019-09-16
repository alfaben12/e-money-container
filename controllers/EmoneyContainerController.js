const AccountHelper = require('../helpers/AccountHelper');
const ZSequelize = require('../libraries/ZSequelize');

module.exports = {
	processSetupPaymentGatewayContainer: async function(req, res) {
		/* PARAMETER ZSequelize VOUCHER  */
		let accountid = req.payload.accountid;

		/* FETCH ZSequelize VOUCHER */
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
	}
}