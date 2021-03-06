const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const AccountPaymentHistory = sequelize.define(
	'account_payment_history',
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		accountid: {
			type: Sequelize.INTEGER
		},
		from_accountid: {
			type: Sequelize.INTEGER
		},
		uuid: {
			type: Sequelize.TEXT
        },
		from_payment_gateway_name: {
			type: Sequelize.TEXT
		},
        to_payment_gateway_name: {
			type: Sequelize.TEXT
        },
        nominal: {
            type: Sequelize.INTEGER
		},
		charge: {
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
		},
		is_transferred : {
			type: Sequelize.INTEGER
		}
	},
	{
		timestamps: process.env.TIMESTAMPS, // true = ketambahan 2 kolom create_at & update_at (AUTO) klo false tidak ketambahan
		freezeTableName: true // true = nama table asli , false = nama table ketambahan 's' diakhir
	}
);

module.exports = AccountPaymentHistory;
