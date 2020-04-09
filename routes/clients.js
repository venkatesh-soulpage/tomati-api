var express = require('express');
var router = express.Router();
import clientController from '../controllers/clients';
import VerifyToken from '../utils/verification'
import VerifyAdmin from '../utils/verification_admin'

/* GET - Get a list of client organizations */
router.get('/', VerifyToken, VerifyAdmin, clientController.getClients);

/* POST - Create a new client organization and invite a new client */
router.post('/invite', VerifyToken, VerifyAdmin, clientController.inviteClient);


module.exports = router;