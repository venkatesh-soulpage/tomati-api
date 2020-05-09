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

/* POST - Invite a new user*/
router.post(
    '/invite-guest', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER','MANAGER']),
    eventsController.inviteGuest
);

module.exports = router;