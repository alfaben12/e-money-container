const express = require('express')
const app = express();
const con = require('./config/db.js');
const dotenv = require('dotenv');
const cors = require('cors');
const AccountRouter = require('./routes/AccountRouter');
const LoginRouter = require('./routes/LoginRouter');
const RegisterRouter = require('./routes/RegisterRouter');
const RoleRouter = require('./routes/RoleRouter');
const EmoneyContainerRouter = require('./routes/EmoneyContainerRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow request
app.use(cors());
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	// allow preflight
	if (req.method === 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
});


app.get('/', (req, res) => res.send('Hello INVFEST 4.0 2019!'))
app.use('/accounts', AccountRouter);
app.use('/logins', LoginRouter);
app.use('/registers', RegisterRouter);
app.use('/roles', RoleRouter);
app.use('/emoneycontainers', EmoneyContainerRouter);

app.listen(process.env.RUN_PORT, () => console.log(`Example app listening on port ` + process.env.RUN_PORT));