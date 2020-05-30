var express = require('express');
var router = express.Router();
import walletController from '../controllers/wallets';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* POST - Create a new order with products */
router.post(
    '/add-order', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    walletController.createOrder
);

module.exports = router;