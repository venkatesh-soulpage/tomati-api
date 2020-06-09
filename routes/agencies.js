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

/* GET - Get a sla for an agency */
router.get(
    '/:agency_id/sla', 
    agencyController.getAgencySla
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
    VerifyRole(['ADMIN', 'AGENCY'], ['ADMIN', 'OWNER', 'MANAGER']),
    agencyController.inviteCollaborator
);

/* POST - Invite new collaborator */
router.delete(
    '/revoke-collaborator/:collaborator_invitation_id',
    VerifyToken,
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    agencyController.revokeCollaboratorInvite
);


module.exports = router;