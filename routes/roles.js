var express = require('express');
var router = express.Router();
import roleController from '../controllers/role';
import VerifyToken from '../utils/verification'

/* GET - Get a list of client organizations */
router.get(
    '/', 
    VerifyToken, 
    roleController.getRoles
);


module.exports = router;