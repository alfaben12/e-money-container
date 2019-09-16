const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const JWT = require('../helpers/JWT');

router.get(
	'/',
	RoleController.processGetRoleAccount
);

module.exports = router;
