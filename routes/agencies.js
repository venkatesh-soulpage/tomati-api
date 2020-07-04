var express = require('express');
var router = express.Router();
import agencyController from '../controllers/agency';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    agencyController.getAgencies
);

/* GET - Get a sla for an agency */
router.get(
    '/:agency_id/sla', 
    agencyController.getAgencySla
);

/* POST - Create a new client organization and invite a new client */
router.post(
    '/invite',
    VerifyToken,
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
    ]),
    agencyController.inviteAgency
);

/* POST - Invite new collaborator */
router.post(
    '/invite-collaborator',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    agencyController.inviteCollaborator
);

/* POST - Invite new collaborator */
router.delete(
    '/revoke-collaborator/:collaborator_invitation_id',
    VerifyToken,
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    agencyController.revokeCollaboratorInvite
);


module.exports = router;