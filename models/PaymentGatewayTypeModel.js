const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const PaymentGatewayType = sequelize.define(
	'payment_gateway_type',
	{
		id: {
			type: Sequelize.INTEGER(10).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: Sequelize.TEXT,
			allowNull: true
		},
		createdAt: {
			type: Sequelize.DATE,
			allowNull: true
		},
		updatedAt: {
			type: Sequelize.DATE,
			allowNull: true
		}
	},
	{
		timestamps: process.env.TIMESTAMPS, // true = ketambahan 2 kolom create_at & update_at (AUTO) klo false tidak ketambahan
		freezeTableName: true // true = nama table asli , false = nama table ketambahan 's' diakhir
	}
	);
	
	module.exports = PaymentGatewayType;