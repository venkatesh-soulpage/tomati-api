var express = require('express');
var router = express.Router();
import venueController from '../controllers/venue';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Get a list of venues */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    venueController.getVenues
);

/* GET - Get a list of client organizations */
router.get(
    '/:client_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    venueController.getVenuesByClient
);

/* GET - Get a list of client organizations */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    venueController.createVenue
);

/* DELETE - Delete a venue */
router.delete(
    '/:venue_id', 
    VerifyToken, 
    VerifyRole([
        {scope: 'ADMIN', role: 'ADMIN'},
        {scope: 'BRAND', role: 'OWNER'},
        {scope: 'BRAND', role: 'MANAGER'},
    ]),
    venueController.deleteVenue
);


module.exports = router;