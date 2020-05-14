var express = require('express');
var router = express.Router();
import VerifyToken from '../utils/verification'
import VerifyAdmin from '../utils/verification_admin'
import VerifyRole from '../utils/verification_role'

import verificationController from '../controllers/verifications';

/* POST Facebook OAuth */
router.post(
    '/upload-verification/:verification_type',
    VerifyToken, 
    VerifyRole(['GUEST'], ['REGULAR', 'VIP', 'VVIP']),
    verificationController.uploadVerificationProcess
);

module.exports = router;