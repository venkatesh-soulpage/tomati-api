var express = require('express');
var router = express.Router();
import eventsController from '../controllers/event';
import pdfController from '../controllers/pdf';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.getEvents
);

/* GET - Get a list of client organizations */
router.get(
    '/organization', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},   
    ]),
    eventsController.getOrganizationEvents
);

/* GET - Get a list of client */
router.get(
    '/client', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},    
        {scope: 'BRAND', role: 'MANAGER'},   
    ]),
    eventsController.getClientEvents
);

/* PATCH - Update a field of an event */
router.patch(
    '/:event_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.updateEventField
);

/* GET - Get event pdf report */
router.get(
    '/:event_id/report', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
    ]),
    pdfController.eventReport
);

/* GET - Get a list of client organizations */
router.get(
    '/my-events', 
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    eventsController.getGuestEvents
);

/* GET - Get a list of client organizations */
router.get(
    '/:event_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    eventsController.getEvent
);


/* POST - Invite a new user*/
router.post(
    '/invite-guest', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.inviteGuest
);

/* GET - Get token for an event*/
router.get(
    '/:event_id/get-token', 
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    eventsController.getCheckinToken
);

/* GET - Get token for an event*/
router.post(
    '/check-in/:token', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
    ]),
    eventsController.checkInGuest
);

/* GET - Get token for an event*/
router.post(
    '/check-out/:token', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'STAFF'},
    ]),
    eventsController.checkOutGuest
);

/* POST - Redeem a code to get event*/
router.post(
    '/redeem-code', 
    VerifyToken, 
    VerifyRole([
        {scope: 'GUEST', role: 'REGULAR'},
        {scope: 'GUEST', role: 'VIP'},
        {scope: 'GUEST', role: 'VVIP'},
    ]),
    eventsController.redeemCode
);

// EVENT PRODUCTS

// POST - Add a new product to the menu
router.post(
    '/:event_id/add-product',
    VerifyToken,
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},

    ]),
    eventsController.addEventProduct
)

// POST - Add a new product to the menu
router.delete(
    '/:event_id/delete-product/:event_product_id',
    VerifyToken,
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.removeEventProduct
)

// EVENT GUESTS

/* POST - Invite a new user*/
router.post(
    '/:event_guest_id/resend-email', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.resendEmail
);

/* DELETE - Delete a user guest*/
router.delete(
    '/:event_guest_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.revokeEventGuest
);

// Stats
router.get(
    '/:event_id/stats',
    VerifyToken,
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    eventsController.getEventStats
)


module.exports = router;