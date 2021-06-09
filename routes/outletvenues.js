var express = require("express");
var router = express.Router();
import venuesController from "../controllers/outletvenues";
import menueController from "../controllers/outletvenue_menu";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.get(
  "/",
  // VerifyToken,
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

router.get(
  "/:outlet_venue_id/menu",
  // VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  menueController.getVenueMenu
);

router.post(
  "/:outlet_venue_id/menu/create-product",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  menueController.createVenueMenuProduct
);

router.put(
  "/:outlet_venue_id/menu/:venue_menu_id",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  menueController.updateVenueMenuProduct
);

router.delete(
  "/:outlet_venue_id/menu/:venue_menu_id",
  VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  menueController.deleteVenueMenuProduct
);

router.get(
  "/:outlet_venue_id/menu/:venue_menu_id",
  // VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  menueController.getVenueMenuProduct
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

router.post("/:venue_id/search", venuesController.searchVenues);

router.post("/:venue_id/search/count", venuesController.searchVenues);

router.post(
  "/distance",
  // VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  venuesController.getVenuesDistance
);
module.exports = router;
