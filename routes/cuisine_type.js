var express = require("express");
var router = express.Router();
import CuisineTypeController from "../controllers/cuisine_type";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

//Tomati Controllers

router.post(
  "/create-cuisine",
  VerifyToken,
  CuisineTypeController.createCuisineType
);
router.get("/", CuisineTypeController.getCuisineTypes);
router.delete(
  "/:cuisine_id",
  VerifyToken,
  CuisineTypeController.deleteCuisineType
);

router.put(
  "/:cuisine_id",
  VerifyToken,
  CuisineTypeController.updateCuisineType
);
module.exports = router;
