const ZSequelize = require('../libraries/ZSequelize');
const Op = require('sequelize').Op;

module.exports = {
    processAccountRegister: async function(req, res) {
		/* POST BODY */
		let acc_roleid = 2;
        let acc_username = req.body.username;
        let acc_password = req.body.password;
        let acc_full_name = req.body.full_name;
        let acc_email = req.body.email;
        let acc_address = req.body.address;

		/* PARAMETER ZSequelize */
		let validation_field = ['id', 'username', 'full_name', 'email'];
		let validation_where = {
			[Op.or]: [{username: acc_username}, {email: acc_email}]
		};

		let validation_orderBy = [['id', 'DESC']];
		let validation_groupBy = false;
		let validation_model = 'AccountModel';

		/* FETCH ZSequelize */
		let validation_accountData = await ZSequelize.fetch(false, validation_field, validation_where, validation_orderBy, validation_groupBy, validation_model);

		if (validation_accountData.dataValues != null) {
			return res.status(409).json({
				result : false,
				data:{
					code: 409,
					message: "Failed account already registered."
				},
			});
		}

		var code           = '';
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < 5; i++ ) {
			code += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		/* PARAMETER ZSequelize VOUCHER  */
		let acc_value = {
			roleid: acc_roleid,
			code: code,
            username: acc_username,
            password: acc_password,
            full_name: acc_full_name,
            email: acc_email,
            address: acc_address
		};

		/* INSERT ZSequelize VOUCHER */
		let acc_result = await ZSequelize.insertValues(acc_value, "AccountModel");
	
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
	},
}