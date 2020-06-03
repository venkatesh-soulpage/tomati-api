var express = require('express');
var router = express.Router();
import accountsController from '../controllers/accounts';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of brands */
router.get(
    '/me', 
    VerifyToken, 
    VerifyRole(['GUEST', 'AGENCY', 'BRAND'], ['OWNER', 'MANAGER', 'STAFF','REGULAR', 'VIP', 'VVIP']),
    accountsController.getUser
);

module.exports = router;