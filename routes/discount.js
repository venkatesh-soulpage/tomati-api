var express = require("express");
var router = express.Router();
import { verify } from "jsonwebtoken";
import discountController from "../controllers/discount";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.get("/", discountController.getDiscounts);
router.post("/post-discount", VerifyToken, discountController.postDiscounts);
router.post("/discount-value", discountController.getDiscount);

module.exports = router;
