var express = require('express');
var router = express.Router();
import walletController from '../controllers/wallets';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* POST - Create a new order with products */
router.post(
    '/:wallet_id/add-order', 
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    walletController.createOrder
);


// Handle Purchases

/* POST - Add credits if the paypal payment was successfull */
router.post(
    '/:wallet_id/add-credits/paypal',
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    walletController.addCreditsWithPaypal
)

/* POST - Add credits if the paypal payment was successfull */
router.post(
    '/:wallet_id/add-credits/qr',
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    walletController.addCreditsWithQR
)

/* PUT - Approve order  */
router.put(
    '/wallet-purchase/approve/:code',
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
    ]),
    walletController.approveCreditsWithQR
)

/* PUT - Approve order  */
router.get(
    '/wallet-purchase/:code',
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
    ]),
    walletController.getWalletPurchase
)

/* POST - Create a new order with products */
router.get(
    '/orders/:order_identifier', // Not the same as order_id
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    walletController.getOrder
);

/* PUT - Create a new order with products */
router.put(
    '/orders/:order_id/cancel', 
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    walletController.cancelOrder
)
;
/* PUT - Create a new order with products */
router.put(
    '/orders/:order_identifier/scan', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
    ]),
    walletController.scanOrder
);


module.exports = router;