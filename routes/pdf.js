var express = require('express');
var router = express.Router();
import pdfController from '../controllers/pdf';
import VerifyToken from '../utils/verification'
import VerifyAdmin from '../utils/verification_admin'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/:requisition_id', 
    VerifyToken,
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    pdfController.getRequisitionApprovalPdf
);


module.exports = router;