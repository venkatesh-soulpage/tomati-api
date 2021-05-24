var express = require("express");
var router = express.Router();
import menueController from "../controllers/outletvenue_menu";

/* GET - Get a list of client organizations */
router.get("/:venue_id", menueController.getvenuemenu);

router.post("/:venue_id/create-product", menueController.createproduct);

router.put("/:venue_menu_id/update-product", menueController.updateproduct);

module.exports = router;
