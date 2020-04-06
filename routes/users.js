var express = require('express');
var router = express.Router();

// User Controller
import userController from '../controllers/users';

// Verification
import VerifyToken from '../utils/verification';

/* GET - Get user information */
router.get('/me', VerifyToken, userController.getProfile);


/* PATCH - Update user information */
// router.patch('/me', VerifyToken, userController.updateProfile);

module.exports = router;