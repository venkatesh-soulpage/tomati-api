var express = require('express');
var router = express.Router();
import VerifyToken from '../utils/verification'
import VerifyAdmin from '../utils/verification_admin'
import VerifyRole from '../utils/verification_role'

import verificationController from '../controllers/verifications';

/* GET - Check account*/
router.get(
    '/',
    VerifyToken, 
    VerifyRole(['ADMIN'], ['ADMIN']),
    verificationController.getVerifications
)

/* GET - Check verification status */
router.get(
    '/check-status',
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    verificationController.checkVerificationStatus
);

/* POST - Submit a verification document */
router.post(
    '/upload-verification/:verification_type',
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    verificationController.uploadVerificationProcess
);

/* POST Submit Verification */
router.post(
    '/submit',
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    verificationController.submitVerification
);

/* PUT - Update verification status */
router.put(
    '/:verification_account_id/update-status',
    VerifyToken, 
    VerifyRole(['ADMIN'], ['ADMIN']),
    verificationController.updateVerificationStatus
);

module.exports = router;