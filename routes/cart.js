var express = require("express");
var router = express.Router();
import cartController from "../controllers/cart";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
// router.get("/", VerifyToken, VerifyRole([]), cartController.getCart);
router.get("/", VerifyToken, cartController.getCart);

router.post("/:account_id", VerifyToken, cartController.addCartItem);

router.delete("/", VerifyToken, cartController.removeCartItem);

router.get("/:account_id", VerifyToken, cartController.getUserCart);

router.post("/:cart_item", VerifyToken, cartController.updateCartItems);

router.get(
  "/:account_id/orders-summary",
  VerifyToken,
  cartController.getOrdersSummary
);
router.put("/:account_id/close-bill", VerifyToken, cartController.updateBill);

module.exports = router;
