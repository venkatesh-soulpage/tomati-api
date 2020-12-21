var express = require("express");
var router = express.Router();
import accountsController from "../controllers/accounts";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of brands */
router.get(
  "/me",
  VerifyToken,
  VerifyRole([
    { scope: "ADMIN", role: "ADMIN" },
    { scope: "REGION", role: "OWNER" },
    { scope: "REGION", role: "MANAGER" },
    { scope: "BRAND", role: "OWNER" },
    { scope: "BRAND", role: "MANAGER" },
    { scope: "BRAND", role: "WAREHOUSE_MANAGER" },
    { scope: "AGENCY", role: "OWNER" },
    { scope: "AGENCY", role: "MANAGER" },
    { scope: "AGENCY", role: "STAFF" },
    { scope: "GUEST", role: "REGULAR" },
    { scope: "GUEST", role: "VIP" },
    { scope: "GUEST", role: "VVIP" },
    { scope: "OUTLET", role: "MANAGER" },
    { scope: "OUTLET", role: "WAITER" },
  ]),
  accountsController.getUser
);

module.exports = router;
