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