var express = require('express');
var router = express.Router();
import briefController from '../controllers/brief';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

// GET - Get a list of client organizations 
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.getBriefs
);


/* GET - Get a list of client organizations */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    briefController.createBrief
);


module.exports = router;