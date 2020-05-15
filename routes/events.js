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

/* GET - Get a list of client organizations */
router.get(
    '/my-events', 
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    eventsController.getGuestEvents
);

/* POST - Invite a new user*/
router.post(
    '/invite-guest', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.inviteGuest
);

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

module.exports = router;