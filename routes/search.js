var express = require("express");
var router = express.Router();
import SearchController from "../controllers/search";
import VerifyToken from "../utils/verification";

/* GET - Get a list of client organizations */
router.post("/", SearchController.search);

module.exports = router;
