var express = require('express');
var router = express.Router();
import analyticsController from '../controllers/analytics';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken,
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
        {scope: 'BRAND', role: 'OWNER'},
    ]),
    analyticsController.getOrganizationAnalytics
);

/* GET - Get client analytics */
router.get(
    '/client', 
    VerifyToken,
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    analyticsController.getClientAnalytics
);

module.exports = router;