const ZSequelize = require('../libraries/ZSequelize');
const JWTAuth = require('../helpers/JWT');
const AccountHelper = require('../helpers/AccountHelper');
const amqp = require('amqplib') 

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
			
			amqp.connect('amqp://localhost')
			.then(conn => {
				return conn.createChannel().then(ch => {
					const q = 'login:'+ accountData.dataValues.id    // Nama antrian adalah 'hello'
					const msg = 'We detected your account login in different device.'    // Isi pesan yang dikirim ke RabbitMQ
					
					const ok = ch.assertQueue(q, { durable: false })    // Membuat antrian 'hello'
					return ok.then(() => {
						ch.sendToQueue(q, Buffer.from(msg))     // Mengirim pesan ke RabbitMQ
						console.log('- Sent', msg)
						return ch.close()
					})
				}).finally(() => conn.close())
			}).catch(console.warn)
			
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