var express = require('express');
var router = express.Router();
import agencyController from '../controllers/agency';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND', 'AGENCY'], ['ADMIN','OWNER','MANAGER']),
    agencyController.getAgencies
);

/* POST - Create a new client organization and invite a new client */
router.post(
    '/invite',
    VerifyToken,
    VerifyRole('BRAND', ['OWNER']),
    agencyController.inviteAgency
);

/* POST - Invite new collaborator */
router.post(
    '/invite-collaborator',
    VerifyToken,
    VerifyRole(['ADMIN', 'AGENCY'], ['ADMIN', 'MANAGER']),
    agencyController.inviteCollaborator
);


module.exports = router;