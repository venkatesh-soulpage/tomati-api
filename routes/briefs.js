var express = require('express');
var router = express.Router();
import briefController from '../controllers/brief';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of briefs for the client
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    briefController.getBriefs
);


/* POST - Create a new brief */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.createBrief
);

/* DELETE - Delete a brief  */
router.delete(
    '/:brief_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.deleteBrief
);

/* POST - Create a brief event*/
router.post(
    '/:brief_id/add-event', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.addBriefEvent
);

/* Update - Update a brief event*/
router.put(
    '/:brief_id/update-event/:brief_event_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.updateBriefEvent
);

/* Delete - Delete a brief event*/
router.delete(
    '/:brief_id/delete-event/:brief_event_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.deleteBriefEvent
);

/* POST - Create a new brief */
router.post(
    '/:brief_id/add-brand', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.addBriefBrand
);

/* DELETE - Delete a brief product*/
router.delete(
    '/:brief_id/delete-brand/:brief_brand_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.deleteBriefBrand
);

/* PUT - Update brief status*/
router.put(
    '/:brief_id/update-status', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.updateBriefStatus
);

/* POST - Upload attachment */
router.post(
    '/:brief_id/upload-attachment', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.uploadBriefAttachment
);

/* DELETE - Delete attachment */
router.delete(
    '/:brief_id/delete-attachment/:brief_attachment_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    briefController.deleteBriefAttachment
);

/* GET - Testing hello sign */
router.get(
    '/hellosign', 
    briefController.getHelloSignUrl
);


module.exports = router;