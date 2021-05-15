var express = require("express");
var router = express.Router();
import menueController from "../controllers/outletvenue_menu";

/* GET - Get a list of client organizations */
router.get("/:venue_id", menueController.getvenuemenu);

module.exports = router;
