var express = require("express");
var router = express.Router();
import paymentController from "../controllers/payment";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.post("/", paymentController.makePayment);

module.exports = router;
