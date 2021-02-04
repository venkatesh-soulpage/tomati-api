var express = require('express');
var router = express.Router();
import productsController from '../controllers/products';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get products list */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    productsController.getProducts
);

/* GET - Get new client products */
router.get(
    '/client-products', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'REGION', role: 'MANAGER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    productsController.getClientProducts
);

/* POST - Create a new product */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    productsController.createProduct
);

/* PUT - Update a product information */
router.put(
    '/:product_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    productsController.updateProduct
);

module.exports = router;