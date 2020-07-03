var express = require('express');
var router = express.Router();
import organizationsController from '../controllers/regional_organizations';
import VerifyToken from '../utils/verification'
import VerifyAdmin from '../utils/verification_admin'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of regional organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
    ]),
    organizationsController.getOrganizations,
);


/* GET - Get a list of regional organizations */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
    ]),
    organizationsController.inviteOrganization,
);

/* POST - Invite new collaborator */
router.post(
    '/invite-collaborator', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
    ]),
    organizationsController.inviteCollaborator,
);


/* POST - Invite new collaborator */
router.delete(
    '/revoke-collaborator/:collaborator_invitation_id',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'}
    ]),
    organizationsController.revokeCollaboratorInvite
);


/* PUT - Change primary location */
router.put(
    '/:regional_organization_id/locations/select-primary', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
    ]),
    organizationsController.changePrimaryLocation,
);

/* PATCH - Change primary location */
router.patch(
    '/:regional_organization_id/update-sla', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
    ]),
    organizationsController.editSla,
);

module.exports = router;