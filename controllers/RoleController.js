const ZSequelize = require('../libraries/ZSequelize');

module.exports = {
	processGetRoleAccount: async function(req, res){
		/* PARAMETER ZSequelize */
		let field = ['id', 'name', 'transaction_limit', 'price_sell'];
		let where = false;
		let orderBy = [['id', 'ASC']];
		let groupBy = false;
		let model = 'AccountRoleModel';
		
		/* FETCH ZSequelize */
		let roleData = await ZSequelize.fetch(true, field, where, orderBy, groupBy, model);

		/* SET RESPONSE */
		return res.status(200).json({
			result: roleData.result,
			data : {
				code: 200,
				message: "Successfull get role.",
				datas: roleData.dataValues
			}
		});
	}
}