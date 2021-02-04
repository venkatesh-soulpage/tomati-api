var express = require("express");
var router = express.Router();
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

import statisticsController from "../controllers/statistics";

router.get("/", statisticsController.getCounInfo);

module.exports = router;
