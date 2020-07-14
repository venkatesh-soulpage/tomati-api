var express = require('express');
var router = express.Router();
import requisitionController from '../controllers/requisition';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of requisitions
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.getRequisitions
);

// POST - Create a new requisition
router.post(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.createRequisition
);

// PUT - Update the requisition status
router.put(
    '/:requisition_id/update-status', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.updateRequisitionStatus
);

// PUT - Reject Requisition
router.put(
    '/:requisition_id/reject', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.rejectRequisition
);

// POST - Add a requisition order
router.post(
    '/:requisition_id/add-order', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.createRequisitionOrder
);


// DELETE - Delete a requisition order
router.delete(
    '/:requisition_id/delete-order/:requisition_order_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.deleteRequisitionOrder
);

// POST - Record and mark the requisition as delivered
router.post(
    '/:requisition_id/deliver-orders', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
    ]),
    requisitionController.deliverRequisitionOrders
)

// POST - Add a requisition delivery and requisition delivery products
router.post(
    '/:requisition_id/add-delivery', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
    ]),
    requisitionController.createRequisitionDelivery
)

// PUT - Update a requisition delivery
router.put(
    '/:requisition_id/update-delivery/:requisition_delivery_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.updateRequisitionDelivery
)

// POST - Request HelloSign document
router.get(
    '/:requisition_id/get-signature', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.getHellosignSignature
)

// POST - Request HelloSign document
router.post(
    '/:requisition_id/request-signature', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    requisitionController.requestHelloSignSignature
)

module.exports = router;