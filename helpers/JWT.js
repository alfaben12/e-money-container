const jwt = require('jsonwebtoken');
const moment = require('moment');

exports.JWTsign = function(accountid) {
	return new Promise((resolve, reject) => {
		jwt.sign(
			{
				accountid: accountid,
				generate_at: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
			},
			'ZPay',
			function(err, token) {
				resolve(token);
				reject('Error');
			}
		);
	});
};

exports.JWTverify = function(req, res, next) {
	const bearerHeader = req.headers.authorization;
	const token = bearerHeader ? bearerHeader.split(" ")[1] : undefined
	
	if (token) {
		jwt.verify(token, 'ZPay', function(err, payload) {
			if (err) {
				res.status(401).json({
					result: false,
					data:{
						code: 401,
						message: 'Invalid Signature.'
					}
				});
			} else {
				req.payload = payload;
				next();
			}
		});
	} else {
		res.status(401).json({
			result: false,
			data:{
				code: 401,
				message: 'Invalid Signature.'
			}
		});
	}
};