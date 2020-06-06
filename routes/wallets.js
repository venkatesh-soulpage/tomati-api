var express = require('express');
var router = express.Router();
import walletController from '../controllers/wallets';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* POST - Create a new order with products */
router.post(
    '/:wallet_id/add-order', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    walletController.createOrder
);


// Handle Purchases

/* POST - Add credits if the paypal payment was successfull */
router.post(
    '/:wallet_id/add-credits/paypal',
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    walletController.addCreditsWithPaypal
)

/* POST - Add credits if the paypal payment was successfull */
router.post(
    '/:wallet_id/add-credits/qr',
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    walletController.addCreditsWithQR
)

/* PUT - Approve order  */
router.put(
    '/wallet-purchase/approve/:code',
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER', 'STAFF']),
    walletController.approveCreditsWithQR
)

/* PUT - Approve order  */
router.get(
    '/wallet-purchase/:code',
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER', 'STAFF']),
    walletController.getWalletPurchase
)

/* POST - Create a new order with products */
router.get(
    '/orders/:order_identifier', // Not the same as order_id
    VerifyToken, 
    VerifyRole(['GUEST', 'AGENCY'], ['REGULAR', 'VIP', 'VVIP', 'OWNER', 'MANAGER', 'STAFF']),
    walletController.getOrder
);

/* PUT - Create a new order with products */
router.put(
    '/orders/:order_id/cancel', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    walletController.cancelOrder
)
;
/* PUT - Create a new order with products */
router.put(
    '/orders/:order_identifier/scan', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER', 'STAFF']),
    walletController.scanOrder
);


module.exports = router;