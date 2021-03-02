var express = require('express');
var router = express.Router();
import brandsController from '../controllers/brands';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of brands */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
        {scope: 'BRAND', role: 'WAREHOUSE_MANAGER'},
        {scope: 'AGENCY', role: 'OWNER'},
        {scope: 'AGENCY', role: 'MANAGER'},
    ]),
    brandsController.getBrands
);

/* POST - Create a list of client brands */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    brandsController.createBrand
);

/* PUT - Update an existing brand */
router.put(
    '/:brand_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'REGION', role: 'OWNER'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    brandsController.updateBrand
);


module.exports = router;