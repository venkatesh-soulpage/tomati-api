var express = require('express');
var router = express.Router();
import briefController from '../controllers/brief';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of briefs for the client
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER']),
    briefController.getBriefs
);


/* POST - Create a new brief */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.createBrief
);

/* DELETE - Delete a brief  */
router.delete(
    '/:brief_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.deleteBrief
);

/* POST - Create a brief event*/
router.post(
    '/:brief_id/add-event', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.addBriefEvent
);

/* Update - Update a brief event*/
router.put(
    '/:brief_id/update-event/:brief_event_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.updateBriefEvent
);

/* Delete - Delete a brief event*/
router.delete(
    '/:brief_id/delete-event/:brief_event_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.deleteBriefEvent
);

/* POST - Create a new brief */
router.post(
    '/:brief_id/add-product', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.addBriefProduct
);

/* DELETE - Delete a brief product*/
router.delete(
    '/:brief_id/delete-product/:brief_product_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.deleteBriefProduct
);

/* PUT - Update brief status*/
router.put(
    '/:brief_id/update-status', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.updateBriefStatus
);

/* POST - Upload attachment */
router.post(
    '/:brief_id/upload-attachment', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.uploadBriefAttachment
);

/* DELETE - Delete attachment */
router.delete(
    '/:brief_id/delete-attachment/:brief_attachment_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.deleteBriefAttachment
);


module.exports = router;