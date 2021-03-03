var express = require("express");
var router = express.Router();
import accountController from "../controllers/accounts";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET Confirm the user */
router.get("/confirmation/:token", accountController.confirmation);

/* POST Create new user. */
router.post("/signup", accountController.signup);

/* POST Verify Email/Phone */
router.post("/verify", accountController.verifyEmailOrPhone);

/* POST Create new user. */
router.post("/outlet-signup", accountController.outletSignup);

/* POST Create new user. */
router.post(
  "/outlet-venue/:venue_id/waiter-signup",
  accountController.waiterSignup
);

/* POST Create new user. */
router.post(
  "/outlet-event/:event_id/waiter-signup",
  accountController.waiterSignup
);

/* POST Create new client */
router.post("/organization-signup", accountController.organizationSignup);

/* POST Create new client */
router.post("/client-signup", accountController.clientSignup);

/* POST Create new agency */
router.post("/agency-signup", accountController.agencySignup);

/* POST Guest signup */
router.post("/guest-signup", accountController.guestSignup);

/* POST Login the user. */
router.post("/login", accountController.login);

/* POST Resend the verification email */
router.post("/resend-verification", accountController.resendToken);

/* POST Outlet Manager invitation */
router.post("/invite-outlet-manager", accountController.inviteOutletManager);
router.post("/invite-outlet-waiter", accountController.inviteOutletWaiter);

/* POST Resend the verification email */
router.post(
  "/resend-invitation",
  VerifyToken,
  VerifyRole([
    { scope: "ADMIN", role: "ADMIN" },
    { scope: "REGION", role: "OWNER" },
    { scope: "BRAND", role: "OWNER" },
    { scope: "AGENCY", role: "OWNER" },
  ]),
  accountController.resendInvitation
);

/* POST Refresh a token */
router.post("/refresh-token", accountController.refreshToken);

/* POST Resend the verification email */
router.post("/forgot", accountController.forgot);

/* POST Resend the verification email */
router.post("/tomati-forgot", accountController.tomatiforgot);

/* POST Reset Password */
router.post("/reset-profile", VerifyToken, accountController.updateProfile);

/* POST Facebook OAuth */
router.post("/facebook-oauth", accountController.authWithFacebook);

// Tomati Routes

/* POST Reset Password */
router.post("/reset", accountController.reset);

/* Verify Email and Password */
router.post("/verify-credentials", accountController.verifyCredentals);

/* Tomati User Signup */
router.post("/user-signup", accountController.userSignup);

/* Tomati User Update Subscription */
router.post(
  "/update-subscription-status",
  accountController.updateSubscription
);

/* Get All Users */
router.get("/get-all-users", VerifyToken, accountController.getAllUsers);

/* POST Resend the verification email */
router.post("/tomati-forgot", accountController.tomatiforgot);

router.post("/invite-collaborator", accountController.invitecollaborator);
module.exports = router;
