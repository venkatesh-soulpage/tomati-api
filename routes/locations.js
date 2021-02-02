var express = require("express");
var router = express.Router();
import locationsController from "../controllers/locations";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of venues */
router.get(
  "/",
  // VerifyToken,
  // VerifyRole([
  //     {scope: 'ADMIN', role: 'ADMIN'},
  //     {scope: 'REGION', role: 'OWNER'},
  //     {scope: 'REGION', role: 'MANAGER'},
  //     {scope: 'BRAND', role: 'OWNER'},
  //     {scope: 'BRAND', role: 'MANAGER'},
  // ]),
  locationsController.getLocations
);

/* GET - Get a list of venues */
router.get(
  "/:location_id/children",
  VerifyToken,
  VerifyRole([
    { scope: "ADMIN", role: "ADMIN" },
    { scope: "REGION", role: "OWNER" },
    { scope: "REGION", role: "MANAGER" },
    { scope: "BRAND", role: "OWNER" },
    { scope: "BRAND", role: "MANAGER" },
  ]),
  locationsController.getChildrenLocations
);

/* POST - Create a location */
router.post(
  "/",
  VerifyToken,
  VerifyRole([{ scope: "ADMIN", role: "ADMIN" }]),
  locationsController.createLocation
);

/* Update - Updatee a location rate */
router.put(
  "/:location_id/rate",
  VerifyToken,
  VerifyRole([{ scope: "ADMIN", role: "ADMIN" }]),
  locationsController.updateCurrencyRate
);

module.exports = router;
