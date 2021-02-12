var express = require("express");
var router = express.Router();

import subscriptionController from "../controllers/subscription";

/* GET - Get a list of brands */
router.get("/", subscriptionController.getSubscriptions);

router.post("/", subscriptionController.createSubscription);

module.exports = router;
