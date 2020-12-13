var express = require("express");
var router = express.Router();
import eventsController from "../controllers/outletevents";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.get(
  "/",
  VerifyToken,
  VerifyRole([
    { scope: "OUTLET", role: "MANAGER" },
    { scope: "OUTLET", role: "OWNER" },
  ]),
  eventsController.getEvents
);

router.post(
  "/",
  VerifyToken,
  VerifyRole([
    { scope: "OUTLET", role: "MANAGER" },
    { scope: "OUTLET", role: "OWNER" },
  ]),
  eventsController.createEvent
);

router.post(
  "/:outlet_event_id/menu",
  VerifyToken,
  VerifyRole([
    { scope: "OUTLET", role: "MANAGER" },
    { scope: "OUTLET", role: "OWNER" },
  ]),
  eventsController.createEventMenu
);

router.get(
  "/:outlet_event_id",
  // VerifyToken,
  // VerifyRole([
  //   { scope: "OUTLET", role: "MANAGER" },
  //   { scope: "OUTLET", role: "OWNER" },
  // ]),
  eventsController.getEvent
);

// /* PATCH - Update a field of an event */
// router.patch(
//   "/:event_id",
//   VerifyToken,
//   VerifyRole([{ scope: "OUTLET", role: "MANAGER" }]),
//   eventsController.updateEventField
// );

// /* POST - Invite a new user*/
// router.post(
//   "/invite-guest",
//   VerifyToken,
//   VerifyRole([{ scope: "OUTLET", role: "MANAGER" }]),
//   eventsController.inviteGuest
// );

// // POST - Add a new product to the menu
// router.delete(
//   "/:event_id/delete-product/:event_product_id",
//   VerifyToken,
//   VerifyRole([{ scope: "OUTLET", role: "MANAGER" }]),
//   eventsController.removeEventProduct
// );

module.exports = router;
