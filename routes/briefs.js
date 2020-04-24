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

/* POST - Create a new brief */
router.post(
    '/:brief_id/add-event', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.addBriefEvent
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


module.exports = router;