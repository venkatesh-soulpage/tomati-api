var express = require("express");
var router = express.Router();
import orderInfoController from "../controllers/order_info";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

router.post("/post-order-info", VerifyToken, orderInfoController.postOrderInfo);
router.post(
  "/getwaiterorderInfo",
  VerifyToken,
  orderInfoController.getOrderInfo
);

module.exports = router;
