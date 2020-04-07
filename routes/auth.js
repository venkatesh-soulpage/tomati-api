var express = require('express');
var router = express.Router();
import userController from '../controllers/accounts';

/* GET Confirm the user */
router.get('/confirmation/:token', userController.confirmation);

/* POST Create new user. */
router.post('/signup', userController.signup);

/* POST Login the user. */
router.post('/login', userController.login);

/* POST Resend the verification email */
router.post('/resend-verification', userController.resendToken);

/* POST Resend the verification email */
router.post('/forgot', userController.forgot);

/* POST Reset Password */
router.post('/reset', userController.reset);


module.exports = router;