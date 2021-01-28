var express = require("express");
var router = express.Router();
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

import tomatiRegistrationsController from "../controllers/tempTomatiRegistrations";

router.post("/register", tomatiRegistrationsController.postRegistrations);
router.put(
  "/:registered_id/approve",
  tomatiRegistrationsController.approveRegistration
);

module.exports = router;
