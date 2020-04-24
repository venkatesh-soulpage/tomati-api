var express = require('express');
var router = express.Router();
import warehousesController from '../controllers/warehouses';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    warehousesController.getWarehouses
);

/* POST - Create a new warehouse */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    warehousesController.createWarehouse
);

/* POST - Create or update a stock inventory */
router.post(
    '/:warehouse_id/add-stock', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'WAREHOUS_MANAGER']),
    warehousesController.createWarehouseStock
);


module.exports = router;