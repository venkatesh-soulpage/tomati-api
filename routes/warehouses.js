var express = require('express');
var router = express.Router();
import warehousesController from '../controllers/warehouses';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    warehousesController.createWarehouse
);


module.exports = router;