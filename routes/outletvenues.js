var express = require("express");
var router = express.Router();
import venuesController from "../controllers/outletvenues";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.get(
  "/",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.getVenues
);

router.post(
  "/user-venues",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.getUserVenues
);

router.get(
  "/:outlet_venue_id",
  // VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  //   { Scope: "GUEST", role: "REGULAR" },
  // ]),
  venuesController.getVenue
);

router.put(
  "/:outlet_venue_id",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.updateVenue
);

router.delete(
  "/:outlet_venue_id",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.deleteVenue
);

router.post(
  "/",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.createVenue
);

router.post(
  "/:outlet_venue_id/menu",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.createVenueMenu
);

router.put(
  "/:venue_id/inactivate_menu",
  VerifyToken,
  venuesController.inactivateMenu
);

router.post(
  "/update_menu_status",
  VerifyToken,
  venuesController.updateMenuStatusByPlan
);

router.get("/:searchCategory/:searchTerm", venuesController.searchVenues);

module.exports = router;
