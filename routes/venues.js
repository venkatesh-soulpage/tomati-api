var express = require('express');
var router = express.Router();
import venueController from '../controllers/venue';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of client organizations */
router.get(
    '/:client_id', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    venueController.getVenuesByClient
);

/* GET - Get a list of client organizations */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    venueController.createVenue
);

/* DELETE - Delete a venue */
router.delete(
    '/:venue_id', 
    VerifyToken, 
    VerifyRole(['ADMIN', 'BRAND'], ['ADMIN','OWNER', 'MANAGER']),
    venueController.deleteVenue
);


module.exports = router;