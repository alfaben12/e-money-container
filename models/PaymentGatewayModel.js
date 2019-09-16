const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const PaymentGateway = sequelize.define(
	'payment_gateway',
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		payment_gateway_typeid: {
			type: Sequelize.INTEGER
		},
		name: {
			type: Sequelize.STRING(255)
        },
        payment_gateway_name: {
			type: Sequelize.STRING(255)
		},
		api_key: {
			type: Sequelize.TEXT
		},
		balance: {
			type: Sequelize.INTEGER
		},
		createdAt: {
			type: 'TIMESTAMP',
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		},
		updatedAt: {
			type: 'TIMESTAMP',
			defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			allowNull: false
		}
	},
	{
		timestamps: process.env.TIMESTAMPS, // true = ketambahan 2 kolom create_at & update_at (AUTO) klo false tidak ketambahan
		freezeTableName: true // true = nama table asli , false = nama table ketambahan 's' diakhir
	}
);

module.exports = PaymentGateway;
