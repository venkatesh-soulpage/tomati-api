var express = require('express');
var router = express.Router();
import productsController from '../controllers/products';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of venues */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    productsController.getProducts
);

/* GET - Get a list of venues */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    productsController.createProduct
);

module.exports = router;