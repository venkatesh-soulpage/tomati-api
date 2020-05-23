var express = require('express');
var router = express.Router();
import brandsController from '../controllers/brands';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of brands */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND', 'AGENCY'], ['ADMIN','OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    brandsController.getBrands
);

/* GET - Get a list of client organizations */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    brandsController.createBrand
);


module.exports = router;