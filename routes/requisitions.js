var express = require('express');
var router = express.Router();
import requisitionController from '../controllers/requisition';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of requisitions
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    requisitionController.getRequisitions
);

// POST - Create a new requisition
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.createRequisition
);

// PUT - Update the requisition status
router.put(
    '/:requisition_id/update-status', 
    VerifyToken, 
    VerifyRole(['BRAND','AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.updateRequisitionStatus
);

// PUT - Reject Requisition
router.put(
    '/:requisition_id/reject', 
    VerifyToken, 
    VerifyRole(['BRAND','AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.rejectRequisition
);

// POST - Add a requisition order
router.post(
    '/:requisition_id/add-order', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.createRequisitionOrder
);


// DELETE - Delete a requisition order
router.delete(
    '/:requisition_id/delete-order/:requisition_order_id', 
    VerifyToken, 
    VerifyRole(['AGENCY'], ['OWNER', 'MANAGER']),
    requisitionController.deleteRequisitionOrder
);

// POST - Record and mark the requisition as delivered
router.post(
    '/:requisition_id/deliver-orders', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    requisitionController.deliverRequisitionOrders
)

// POST - Add a requisition delivery and requisition delivery products
router.post(
    '/:requisition_id/add-delivery', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'WAREHOUSE_MANAGER']),
    requisitionController.createRequisitionDelivery
)

// PUT - Update a requisition delivery
router.put(
    '/:requisition_id/update-delivery/:requisition_delivery_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'WAREHOUSE_MANAGER']),
    requisitionController.updateRequisitionDelivery
)

module.exports = router;