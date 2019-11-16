const redis = require('redis');

exports.cacheAccount = function(req, res, next) {
    /* PARAMETER ZSequelize  */
    let accountid = req.payload.accountid;
    // create and connect redis client to local instance.
    const client = redis.createClient(6379)
    const REDIS_KEY = 'ZPAY:account:'+accountid;
    
    // echo redis errors to the console
    client.on('error', (err) => {
        console.log("Error " + err)
    });
    
    // Try fetching the result from Redis first in case we have it cached
    return client.get(REDIS_KEY, (err, data) => {
        
        // If that key exists in Redis store
        if (data) {
            
            return res.status(200).json({
				result : 'cache',
				data: {
					code: 200,
					message: "Success fetch data.",
					datas: JSON.parse(data)
				}
			});
            
        } else { // Key does not exist in Redis store
            next();
        }
    });
};

exports.cacheHistory = function(req, res, next) {
    /* PARAMETER ZSequelize  */
    let accountid = req.payload.accountid;
    // create and connect redis client to local instance.
    const client = redis.createClient(6379)
    const REDIS_KEY = 'ZPAY:history:'+accountid;
    // echo redis errors to the console
    client.on('error', (err) => {
        console.log("Error " + err)
    });
    
    // Try fetching the result from Redis first in case we have it cached
    return client.get(REDIS_KEY, (err, data) => {
        
        // If that key exists in Redis store
        if (data) {
            
            return res.status(200).json({
				result : 'cache',
				data: {
					code: 200,
					message: "Success fetch data.",
					datas: JSON.parse(data)
				}
			});
            
        } else { // Key does not exist in Redis store
            next();
        }
    });
};