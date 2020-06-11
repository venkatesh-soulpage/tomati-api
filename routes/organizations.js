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
    ]),
    organizationsController.getOrganizations,
);

/* GET - Get a list of regional organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGIONAL', role: 'OWNER'},
    ]),
    organizationsController.getOrganizations,
);

module.exports = router;