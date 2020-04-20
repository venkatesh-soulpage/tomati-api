var express = require('express');
var router = express.Router();
import roleController from '../controllers/role';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND', 'AGENCY'], ['ADMIN','OWNER','MANAGER']),
    roleController.getRoles
);

module.exports = router;