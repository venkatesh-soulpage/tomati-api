var express = require("express");
var router = express.Router();
import cartController from "../controllers/cart";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
// router.get("/", VerifyToken, VerifyRole([]), cartController.getCart);
router.get(
  "/",
  VerifyToken,
  VerifyRole([{ scope: "GUEST", role: "REGULAR" }]),
  cartController.getCart
);

router.post(
  "/",
  VerifyToken,
  VerifyRole([{ scope: "GUEST", role: "REGULAR" }]),
  cartController.addCartItem
);

router.delete(
  "/",
  VerifyToken,
  VerifyRole([{ scope: "GUEST", role: "REGULAR" }]),
  cartController.removeCartItem
);

module.exports = router;
