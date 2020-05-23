var express = require('express');
var router = express.Router();
import productsController from '../controllers/products';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get products list */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    productsController.getProducts
);

/* GET - Get new client products */
router.get(
    '/client-products', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    productsController.getClientProducts
);

/* POST - Create a new product */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    productsController.createProduct
);

/* PUT - Update a product information */
router.put(
    '/:product_id', 
    VerifyToken, 
    VerifyRole(['BRAND', 'AGENCY'], ['OWNER', 'MANAGER', 'WAREHOUSE_MANAGER']),
    productsController.updateProduct
);

module.exports = router;