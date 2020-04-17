var express = require('express');
var router = express.Router();
import briefController from '../controllers/brief';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of briefs for the client
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
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
    '/:brief_id/addBriefEvent', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.addBriefEvent
);


module.exports = router;