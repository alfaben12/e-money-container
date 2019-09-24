const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const Account = sequelize.define(
	'account',
	{
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		balance: {
			type: Sequelize.INTEGER
		},
		saving_balance: {
			type: Sequelize.INTEGER
		},
		roleid: {
			type: Sequelize.INTEGER
		},
		username: {
			type: Sequelize.STRING(255)
		},
		code: {
			type: Sequelize.STRING(100)
		},
		password: {
			type: Sequelize.TEXT
		},
		full_name: {
			type: Sequelize.STRING(255)
		},
		email: {
			type: Sequelize.STRING(255)
		},
		address: {
			type: Sequelize.TEXT
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

module.exports = Account;
