var express = require("express");
var router = express.Router();
import VerifyToken from "../utils/verification";
import VerifyAdmin from "../utils/verification_admin";
import VerifyRole from "../utils/verification_role";

import verificationController from "../controllers/verifications";

/* GET - Check account*/
router.get(
  "/",
  VerifyToken,
  VerifyRole([{ scope: "ADMIN", role: "ADMIN" }]),
  verificationController.getVerifications
);

/* GET - Check verification status */
router.get(
  "/check-status",
  VerifyToken,
  VerifyRole([
    { scope: "GUEST", role: "REGULAR" },
    { scope: "GUEST", role: "VIP" },
    { scope: "GUEST", role: "VVIP" },
  ]),
  verificationController.checkVerificationStatus
);

/* POST - Submit a verification document */
router.post(
  "/upload-verification/:verification_type",
  VerifyToken,
  VerifyRole([
    { scope: "GUEST", role: "REGULAR" },
    { scope: "GUEST", role: "VIP" },
    { scope: "GUEST", role: "VVIP" },
  ]),
  verificationController.uploadVerificationProcess
);

/* POST Submit Verification */
router.post(
  "/submit",
  VerifyToken,
  VerifyRole([
    { scope: "GUEST", role: "REGULAR" },
    { scope: "GUEST", role: "VIP" },
    { scope: "GUEST", role: "VVIP" },
  ]),
  verificationController.submitVerification
);

/* PUT - Update verification status */
router.put(
  "/:verification_account_id/update-status",
  VerifyToken,
  VerifyRole([{ scope: "ADMIN", role: "ADMIN" }]),
  verificationController.updateVerificationStatus
);

/* GET - GET Verification Logs */
router.get(
  "/organization-logs/:regional_organization_id",
  VerifyToken,
  VerifyRole([
    { scope: "REGION", role: "OWNER" },
    { scope: "REGION", role: "MANAGER" },
  ]),
  verificationController.getOrganizationVerificationLogs
);

/* GET - GET Verification Logs */
router.get(
  "/client-logs/:client_id",
  VerifyToken,
  VerifyRole([
    { scope: "REGION", role: "OWNER" },
    { scope: "REGION", role: "MANAGER" },
    { scope: "CLIENT", role: "OWNER" },
    { scope: "CLIENT", role: "MANAGER" },
  ]),
  verificationController.getClientVerificationLogs
);

/* SMS */

/* POST - Submit a verification sms */
router.post(
  "/sms/get-code",
  // VerifyToken,
  verificationController.getVerificationSMS
);

/* POST - Submit a verification sms */
router.post(
  "/sms/check-code",
  VerifyToken,
  verificationController.checkVerificationSMS
);

/* POST - Submit a verification sms */
router.post(
  "/email/get-code",
  // VerifyToken,
  verificationController.getVerificationEMAIL
);

/* POST - Submit a verification sms */
router.post(
  "/email/check-code",
  // VerifyToken,
  verificationController.checkVerificationEMAIL
);

module.exports = router;
