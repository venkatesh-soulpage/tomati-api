var express = require('express');
var router = express.Router();
import clientController from '../controllers/clients';
import VerifyToken from '../utils/verification'
import VerifyAdmin from '../utils/verification_admin'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    clientController.getClients
);

/* POST - Create a new client organization and invite a new client */
router.post(
    '/invite', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
    ]),
    clientController.inviteClient
);

/* POST - Invite new collaborator */
router.post(
    '/invite-collaborator',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'},
    ]),
    clientController.inviteCollaborator
);

/* POST - Invite new collaborator */
router.delete(
    '/revoke-collaborator/:collaborator_invitation_id',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'}
    ]),
    clientController.revokeCollaboratorInvite
);


/* POST - Invite new collaborator */
router.put(
    '/:client_id/upload-logo',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'}
    ]),
    clientController.uploadLogo
);

/* POST - Invite new collaborator */
router.post(
    '/:client_id/add-location',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
    ]),
    clientController.addLocation
);

/* PUT - Update a client SLA */
router.put(
    '/:client_id/update-sla',
    VerifyToken,
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
    ]),
    clientController.editSla
);


module.exports = router;