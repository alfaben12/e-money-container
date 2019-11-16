const express = require('express')
const app = express();
const con = require('./config/db.js');
const dotenv = require('dotenv');
const cors = require('cors');
const amqp = require('amqplib') 
const AccountRouter = require('./routes/AccountRouter');
const LoginRouter = require('./routes/LoginRouter');
const RegisterRouter = require('./routes/RegisterRouter');
const RoleRouter = require('./routes/RoleRouter');
const EmoneyContainerRouter = require('./routes/EmoneyContainerRouter');
const PaymentGatewayRouter = require('./routes/PaymentGatewayRouter');
const PaymentHistoryRouter = require('./routes/PaymentHistoryRouter');

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


app.use('/mq/producer', function(req, res){
    amqp.connect('amqp://localhost')
    .then(conn => {
        return conn.createChannel().then(ch => {
            const q = 'thariq'     // Nama antrian adalah 'hello'
            const msg = 'Hello thariq!'    // Isi pesan yang dikirim ke RabbitMQ
            
            const ok = ch.assertQueue(q, { durable: false })    // Membuat antrian 'hello'
            return ok.then(() => {
                ch.sendToQueue(q, Buffer.from(msg))     // Mengirim pesan ke RabbitMQ
                console.log('- Sent', msg)
                return ch.close()
            })
        }).finally(() => conn.close())
    }).catch(console.warn)
});

app.use('/logins/notif', function(req, res){
    amqp.connect('amqp://localhost')
    .then(conn=> {
        return conn.createChannel().then(ch => {
            const ok = ch.assertQueue('login:1', { durable: false })      // Deklarasi antrian
            ok.then(() => {
                /* Menangkap pesan yang dikirimkan oleh RabbitMQ */
                return ch.consume('login:1', msg => console.log('- Received', msg.content.toString()), { noAck: true })
            })
            .then(() => {
                console.log('* Waiting for messages. Ctrl+C to exit')
            })
        })
    }).catch(console.warn)
});

app.get('/', (req, res) => res.send('Hello INVFEST 4.0 2019!'))
app.use('/accounts', AccountRouter);
app.use('/logins', LoginRouter);
app.use('/registers', RegisterRouter);
app.use('/roles', RoleRouter);
app.use('/emoneycontainers', EmoneyContainerRouter);
app.use('/paymentgateways', PaymentGatewayRouter);
app.use('/paymenthistorys', PaymentHistoryRouter);

app.listen(process.env.RUN_PORT, () => console.log(`Example app listening on port ` + process.env.RUN_PORT));