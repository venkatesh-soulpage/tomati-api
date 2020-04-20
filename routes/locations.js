var express = require('express');
var router = express.Router();
import locationsController from '../controllers/locations';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of venues */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN'], ['ADMIN']),
    locationsController.getLocations
);

/* POST - Create a location */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN'], ['ADMIN']),
    locationsController.createLocation
);


module.exports = router;