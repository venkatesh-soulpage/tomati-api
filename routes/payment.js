var express = require("express");
var router = express.Router();
import paymentController from "../controllers/payment";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

//Tomati Controllers

/* GET - Get a list of client organizations */
router.post("/", paymentController.makePayment);
router.post("/update-subsciption", paymentController.updateSubscription);
router.post(
  "/retrive-subscription",
  VerifyToken,
  paymentController.retriveSubscriptionById
);
router.post("/get-coupon", paymentController.retriveCoupon);

router.post(
  "/get-subscription-details",
  paymentController.getSubscriptionDetails
);
router.post(
  "/upgrade-subscription",
  paymentController.updateSubscriptionThroughCheckout
);

router.post("/update-chargebee-email", paymentController.updateCustomerEmail);
module.exports = router;
