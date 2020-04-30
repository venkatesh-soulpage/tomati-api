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

// POST - Get a list of briefs for the client
router.post(
    '/:requisition_id/add-order', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.createRequisitionOrder
);


// POST - Get a list of briefs for the client
router.delete(
    '/:requisition_id/delete-order/:requisition_order_id', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.deleteRequisitionOrder
);

module.exports = router;