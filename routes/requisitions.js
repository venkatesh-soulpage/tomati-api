var express = require('express');
var router = express.Router();
import requisitionController from '../controllers/requisition';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of briefs for the client
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.getRequisitions
);

// POST - Get a list of briefs for the client
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.createRequisition
);

module.exports = router;