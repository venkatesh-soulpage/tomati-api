var express = require("express");
var router = express.Router();
import planController from "../controllers/plans";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.get("/", planController.getplans);
router.post("/post-plans", planController.postPlans);

module.exports = router;
