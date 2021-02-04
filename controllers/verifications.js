import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import async from "async";
import fetch from "node-fetch";
import queryString from "query-string";
import AWS from "aws-sdk";
import twilio from "twilio";
import moment from "moment";

const twilio_client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Inititialize AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: process.env.BUCKETEER_AWS_REGION,
});

const getVerifications = async (req, res, next) => {
  try {
    const accounts = await models.Account.query()
      .withGraphFetched("[verifications]")
      .where("age_verification_status", "SUBMITTED")
      .orderBy("created_at", "desc");

    return res.status(200).send(accounts);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const checkVerificationStatus = async (req, res, next) => {
  try {
    const { account_id } = req;

    const account = await models.Account.query().findById(account_id);

    if (account.age_verification_status === "SUBMITTED") {
      return res
        .status(200)
        .json(
          "Your account is under revision. If it isn`t verified before 24 hours. Please contact support@boozeboss.co"
        );
    }

    if (account.age_verification_status === "REJECTED") {
      return res
        .status(200)
        .json(
          "Your account was rejected. If you feel this is an error please contact support@boozeboss.co"
        );
    }

    if (account.age_verification_status === "APPROVED") {
      return res.status(200).json("Account already approved. Redirecting");
    }

    // If it isn't approved just return
    return res.status(200).send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Verification
const uploadVerificationProcess = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { verification_type } = req.params;

    const { file } = req.files;

    const key = `public/verification/${account_id}/${verification_type}/${file.name}`;

    let params = {
      Key: key,
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Body: file.data,
    };

    await s3.putObject(params, async (err, data) => {
      if (err) {
        console.log(err, err.stack).send();
        return res.status(400).json("Upload failed").send();
      } else {
        await models.VerificationAttachment.query().insert({
          account_id,
          url: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
          file_name: file.name,
          file_type: file.mimetype,
          verification_type,
        });

        return res
          .status(200)
          .json("Verification successfully uploaded")
          .send();
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const submitVerification = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { age_verification_status } = req.body;

    await models.Account.query()
      .update({
        age_verification_status,
      })
      .where("id", account_id);

    return res
      .status(200)
      .json(
        "Submission successfully submitted. We will notify you once your account is approved"
      )
      .send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// Update verification status to 'APPROVED' or 'REJECTED'
const updateVerificationStatus = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { verification_account_id } = req.params;
    const { age_verification_status } = req.body;

    if (age_verification_status === "APPROVED") {
      // Delete verification files
      const account = await models.Account.query()
        .findById(verification_account_id)
        .withGraphFetched("[verifications]");

      // If the account already has an event count the first code redemeed event to the verification limit logic
      const event_guest = await models.EventGuest.query()
        .withGraphFetched(
          `[
                                event.[
                                    brief_event.[
                                        brief.[
                                            client.[
                                                organization
                                            ]
                                        ]
                                    ]
                                ]
                            ]`
        )
        .where({ account_id: verification_account_id })
        .first();

      // Verify the client limit
      if (event_guest.event.brief_event.brief.client) {
        const verification_client = await models.Client.query()
          .withGraphFetched(
            `[
                                    verification_logs
                                ]`
          )
          .where({ id: event_guest.event.brief_event.brief.client.id })
          .first();

        if (!verification_client)
          return res
            .status(400)
            .json("Can't validate client identity limit")
            .send();
        if (
          verification_client.identity_verifications_limit <=
          verification_client.verification_logs.length + 1
        )
          return res
            .status(400)
            .json("Maximum verifications reached for this client")
            .send();
      }

      // Check verification limits
      if (event_guest.event.brief_event.brief.client.regional_organization_id) {
        // Check verifications
        const organization = await models.RegionalOrganization.query()
          .withGraphFetched(
            `[
                                verification_logs,
                                clients.[
                                    verification_logs
                                ]
                            ]`
          )
          .where({
            id:
              event_guest.event.brief_event.brief.client
                .regional_organization_id,
          })
          .first();

        // Verify the organization limit
        if (
          organization.identity_verifications_limit <=
          organization.verification_logs.length + 1
        )
          return res
            .status(400)
            .json("Maximum verifications reached for this organization")
            .send();
      }

      // Add verification log depending on the account
      if (event_guest) {
        await models.VerificationLog.query().insert({
          verified_by: account_id,
          account_id: verification_account_id,
          client_id: event_guest.event.brief_event.brief.client.id,
          regional_organization_id:
            event_guest.event.brief_event.brief.client.regional_organization_id,
        });
      }

      // Update user account
      await models.Account.query()
        .update({
          is_age_verified: true,
          age_verified_at: new Date(),
          age_verification_status,
        })
        .where("id", verification_account_id);

      // Create Wallet
      await models.Wallet.query().insert({
        account_id: verification_account_id,
      });

      for (const verification of account.verifications) {
        // Delete file by file
        const key = `public/verification/${verification_account_id}/${verification.verification_type}/${verification.file_name}`;

        s3.deleteObject(
          {
            Key: key,
            Bucket: process.env.BUCKETEER_BUCKET_NAME,
          },
          async (err, data) => {
            if (err)
              return res.status(400).json("Unable to remove attachment").send();

            // Delete all the user files
            await models.VerificationAttachment.query()
              .delete()
              .where("id", verification.id);
          }
        );
      }

      return res.status(200).json("Profile successfully approved").send();
    } else if (age_verification_status === "REJECTED") {
      // Update user account
      await models.Account.query()
        .update({
          age_verification_status,
        })
        .where("id", verification_account_id);

      // Delete verification files
      const account = await models.Account.query()
        .findById(verification_account_id)
        .withGraphFetched("[verifications]");

      for (const verification of account.verifications) {
        // Delete file by file
        const key = `public/verification/${verification_account_id}/${verification.verification_type}/${verification.file_name}`;

        s3.deleteObject(
          {
            Key: key,
            Bucket: process.env.BUCKETEER_BUCKET_NAME,
          },
          async (err, data) => {
            if (err)
              return res.status(400).json("Unable to remove attachment").send();

            // Delete all the user files
            await models.VerificationAttachment.query()
              .delete()
              .where("id", verification.id);
          }
        );
      }

      return res.status(200).json("Profile successfully rejected").send();
    } else {
      return res.status(400).json().send("Invalid status");
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// SMS Verifications
const getVerificationSMS = async (req, res, next) => {
  try {
    const { phone_number } = req.body;

    const verification = await twilio_client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: `+${phone_number}`, channel: "sms" })
      .then((verification) => verification);

    if (verification.status === "pending") {
      return res.status(200).json("SMS successful").send();
    } else {
      return res.status(400).json("Error sending to this number").send();
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const checkVerificationSMS = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { code, phone_number } = req.body;

    const verification = await twilio_client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: `+${phone_number}`, code })
      .then((verification_check) => verification_check);

    if (verification && verification.status === "approved") {
      await models.Account.query()
        .update({ is_phone_number_verified: true })
        .where("id", account_id);

      return res.status(200).json("Success!").send();
    } else {
      return res.status(400).json("Invalid code").send();
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// EMAIL Verifications
const getVerificationEMAIL = async (req, res, next) => {
  try {
    const { email } = req.body;

    const verification = await twilio_client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: `${email}`, channel: "email" })
      .then((verification) => verification);

    if (verification.status === "pending") {
      return res.status(200).json("EMAIL successful").send();
    } else {
      return res.status(400).json("Error sending to this email").send();
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const checkVerificationEMAIL = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { code, email } = req.body;

    const verification = await twilio_client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: `${email}`, code })
      .then((verification_check) => verification_check);

    if (verification && verification.status === "approved") {
      return res.status(200).json("Success!").send();
    } else {
      return res.status(400).json("Invalid code").send();
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// Get organization verification csv
const getOrganizationVerificationLogs = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { regional_organization_id } = req.params;

    const verification_logs = await models.VerificationLog.query()
      .withGraphFetched(
        `[
                    account.[
                        events_guest.[
                            event.[
                                brief_event.[
                                    brief.[
                                        client
                                    ]
                                ]
                            ]
                        ]
                    ]
                    verified_by_account,
                ]`
      )
      .where({
        regional_organization_id,
      })
      .orderBy("created_at", "asc");

    const records = [];
    verification_logs.map((verification_log, index) => {
      records.push({
        index: index + 1,
        account_name: `${verification_log.account.first_name} ${verification_log.account.last_name}`,
        account_email: `${verification_log.account.email}`,
        team:
          verification_log.account.events_guest.length > 0
            ? verification_log.account.events_guest[0].event.brief_event.brief
                .client.name
            : "-",
        event:
          verification_log.account.events_guest.length > 0
            ? verification_log.account.events_guest[0].event.brief_event.name
            : "-",
        verified_at: moment(verification_log.created_at).format(
          "DD/MM/YYYY LT"
        ),
      });
    });

    return res.status(200).send(records);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// Get client verification csv
const getClientVerificationLogs = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { client_id } = req.params;

    const verification_logs = await models.VerificationLog.query()
      .withGraphFetched(
        `[
                    account.[
                        events_guest.[
                            event.[
                                brief_event
                            ]
                        ]
                    ]
                    verified_by_account,
                ]`
      )
      .where({
        client_id,
      })
      .orderBy("created_at", "asc");

    const records = [];
    verification_logs.map((verification_log, index) => {
      records.push({
        index: index + 1,
        account_name: `${verification_log.account.first_name} ${verification_log.account.last_name}`,
        account_email: `${verification_log.account.email}`,
        event:
          verification_log.account.events_guest.length > 0
            ? verification_log.account.events_guest[0].event.brief_event.name
            : "-",
        verified_at: moment(verification_log.created_at).format(
          "DD/MM/YYYY LT"
        ),
      });
    });

    return res.status(200).send(records);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const verificationController = {
  // Verification
  getVerifications,
  checkVerificationStatus,
  uploadVerificationProcess,
  submitVerification,
  updateVerificationStatus,
  getOrganizationVerificationLogs,
  getClientVerificationLogs,
  // SMS verifications
  getVerificationSMS,
  checkVerificationSMS,
  // Email verifications
  getVerificationEMAIL,
  checkVerificationEMAIL,
};

export default verificationController;
