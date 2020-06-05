var express = require('express');
var router = express.Router();
import eventsController from '../controllers/event';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.getEvents
);

/* PATCH - Update a field of an event */
router.patch(
    '/:event_id', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.updateEventField
);

/* GET - Get a list of client organizations */
router.get(
    '/my-events', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    eventsController.getGuestEvents
);

/* GET - Get a list of client organizations */
router.get(
    '/:event_id', 
    VerifyToken, 
    VerifyRole(['AGENCY', 'GUEST'], ['OWNER','MANAGER', 'REGULAR', 'VIP', 'VVIP']),
    eventsController.getEvent
);


/* POST - Invite a new user*/
router.post(
    '/invite-guest', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.inviteGuest
);

/* GET - Get token for an event*/
router.get(
    '/:event_id/get-token', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    eventsController.getCheckinToken
);

/* GET - Get token for an event*/
router.post(
    '/check-in/:token', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER', 'STAFF']),
    eventsController.checkInGuest
);

/* GET - Get token for an event*/
router.post(
    '/check-out/:token', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER', 'STAFF']),
    eventsController.checkOutGuest
);

/* POST - Redeem a code to get event*/
router.post(
    '/redeem-code', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    eventsController.redeemCode
);

// EVENT PRODUCTS

// POST - Add a new product to the menu
router.post(
    '/:event_id/add-product',
    VerifyToken,
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    eventsController.addEventProduct
)

// POST - Add a new product to the menu
router.delete(
    '/:event_id/delete-product/:event_product_id',
    VerifyToken,
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    eventsController.removeEventProduct
)

// EVENT GUESTS

/* POST - Invite a new user*/
router.post(
    '/:event_guest_id/resend-email', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.resendEmail
);

/* DELETE - Delete a user guest*/
router.delete(
    '/:event_guest_id', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.revokeEventGuest
);

// Stats
router.get(
    '/:event_id/stats',
    VerifyToken,
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.getEventStats
)


module.exports = router;