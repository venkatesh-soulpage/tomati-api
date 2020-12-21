import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import async from "async";
import fetch from "node-fetch";
import queryString from "query-string";
import moment from "moment";

import {
  sendConfirmationEmail,
  sendFotgotPasswordEmail,
  organizationInviteEmail,
  clientInviteEmail,
  agencyInviteEmail,
  outletInviteEmail,
} from "./mailling";

// GET - Get user profile
const getUser = async (req, res, next) => {
  try {
    const { account_id } = req;

    const account = await models.Account.query()
      .withGraphFetched(
        `[
                        wallet, 
                        location,
                    ]`
      )
      .findById(account_id);

    if (!account) return res.status(400).json("Invalid account").send();

    return res.status(200).send(account);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const verifyEmailOrPhone = async (req, res, next) => {
  const { email, phone_number } = req.body;
  if (email) {
    try {
      // Check if the account doesn't exist
      const account = await models.Account.query()
        .where("email", email)
        .first();

      if (!account) return res.status(404).json("Email Doesn't Exist").send();
      // Search for Region Owner Role
      const role = await models.Role.query()
        .where("scope", "GUEST")
        .where("name", "REGULAR")
        .first();

      const jwt_token = await jwt.sign(
        {
          id: account.id,
          email: account.email,
          scope: role.scope,
          role: role.name,
        },
        process.env.SECRET_KEY,
        { expiresIn: "3h" }
      );

      return res.status(201).json({ jwt_token }).send();
    } catch (e) {
      return res.status(500).json(JSON.stringify(e)).send();
    }
  } else if (phone_number) {
    try {
      // Check if the account doesn't exist
      const account = await models.Account.query()
        .where("phone_number", phone_number)
        .first();

      console.log(account);
      if (!account)
        return res.status(404).json("Phone Number Doesn't Exist").send();

      // Search for Region Owner Role
      const role = await models.Role.query()
        .where("scope", "GUEST")
        .where("name", "REGULAR")
        .first();

      const jwt_token = await jwt.sign(
        {
          id: account.id,
          email: account.email,
          scope: role.scope,
          role: role.name,
        },
        process.env.SECRET_KEY,
        { expiresIn: "3h" }
      );

      return res.status(201).json({ jwt_token }).send();
    } catch (e) {
      return res.status(500).json(JSON.stringify(e)).send();
    }
  }
};

// POST - Signup
const signup = async (req, res, next) => {
  const { email, password, first_name, last_name } = req.body;

  try {
    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json({ msg: "This email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Add new account
    const new_account = await models.Account.query().insert({
      email,
      first_name,
      last_name,
      password_hash,
      is_admin: false,
      is_email_verified: false,
      is_age_verified: false,
    });

    // Create new token
    const new_token = await models.Token.query().insert({
      email: new_account.email,
      token: crypto.randomBytes(16).toString("hex"),
    });

    // Send signup email
    await sendConfirmationEmail(new_account, new_token);

    // Return the account
    return res.status(201).json({ new_account, new_token }).send();
  } catch (e) {
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Outlet Signup
const outletSignup = async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      gender,
      date_of_birth,
      token,
    } = req.body;

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json("This email already exists");

    // Validate expiration time on cient invitation
    const invitation = await models.CollaboratorInvitation.query()
      .where("email", email)
      .orderBy("created_at", "DESC")
      .first();

    if (new Date(invitation.expiration_date).getTime() <= new Date().getTime())
      return res.status(400).json("Invitation already expired").send();

    // Validate the token signature
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Check if the token sent is on the database
    const tokens = await models.Token.query()
      .where("token", token)
      .where("email", email);

    // If there aren't tokens return error
    if (!tokens || tokens.length < 1)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate a refresh token
    const refresh_token = await crypto.randomBytes(16).toString("hex");

    // Add new account
    const new_account = await models.Account.query().insert({
      email,
      first_name,
      last_name,
      phone_number,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: true,
      refresh_token,
      gender,
      date_of_birth,
    });

    // Add a new wallet for the organization collaborator
    await models.Wallet.query().insert({
      account_id: new_account.id,
    });

    // Search for Region Owner Role
    const role = await models.Role.query()
      .where("scope", "OUTLET")
      .where("name", "MANAGER")
      .first();

    // Add a client collaborator
    await models.Collaborator.query().insert({
      role_id: role.id,
      account_id: new_account.id,
    });

    // Generate the login token
    const jwt_token = await jwt.sign(
      {
        id: new_account.id,
        email: new_account.email,
        scope: role.scope,
        role: role.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Send signup email
    // await sendConfirmationEmail(new_account, new_token);

    // Return the account
    return res.status(201).json({ token: jwt_token, refresh_token }).send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const waiterSignup = async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      gender,
      date_of_birth,
    } = req.body;

    const { venue_id, event_id } = req.params;

    if (!email || !password || !first_name || !last_name)
      return res.status(400).json("Missing required fields");

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json("This email already exists");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate a refresh token
    const refresh_token = await crypto.randomBytes(16).toString("hex");

    // Add new account
    const new_account = await models.Account.query().insert({
      email,
      first_name,
      last_name,
      phone_number,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: true,
      refresh_token,
      gender,
      date_of_birth,
    });

    // Add a new wallet for the organization collaborator
    await models.Wallet.query().insert({
      account_id: new_account.id,
    });

    // Search for Region Owner Role
    const role = await models.Role.query()
      .where("scope", "OUTLET")
      .where("name", "WAITER")
      .first();

    // Add a client collaborator
    await models.Collaborator.query().insert({
      role_id: role.id,
      account_id: new_account.id,
    });

    if (venue_id) {
      await models.OutletWaiter.query().insert({
        account_id: new_account.id,
        outletvenue_id: venue_id,
      });
    } else if (event_id) {
      await models.OutletWaiter.query().insert({
        account_id: new_account.id,
        outletevent_id: event_id,
      });
    }

    // Generate the login token
    const jwt_token = await jwt.sign(
      {
        id: new_account.id,
        email: new_account.email,
        scope: role.scope,
        role: role.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Send signup email
    // await sendConfirmationEmail(new_account, new_token);

    // Return the account
    return res.status(201).json({ token: jwt_token, refresh_token }).send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// Invite Manager

// POST - Organization Signup
const organizationSignup = async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone_number,
      gender,
      date_of_birth,
      location_id,
      token,
    } = req.body;

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json({ msg: "This email already exists" });

    // Validate expiration time on cient invitation
    const invitation = await models.CollaboratorInvitation.query()
      .where("email", email)
      .orderBy("created_at", "DESC")
      .first();

    if (new Date(invitation.expiration_date).getTime() <= new Date().getTime())
      return res.status(400).json("Invitation already expired").send();

    // Validate the token signature
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Check if the token sent is on the database
    const tokens = await models.Token.query()
      .where("token", token)
      .where("email", email);

    // If there aren't tokens return error
    if (!tokens || tokens.length < 1)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate a refresh token
    const refresh_token = await crypto.randomBytes(16).toString("hex");

    // Find the organization primary location
    const organization = await models.RegionalOrganization.query()
      .withGraphFetched(
        `[
                            locations
                        ]`
      )
      .findById(decoded.regional_organization_id);

    const primary_location = organization.locations.find(
      (location) => location.is_primary_location
    );

    // Add new account
    const new_account = await models.Account.query().insert({
      email,
      first_name,
      last_name,
      phone_number,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: true,
      refresh_token,
      gender,
      date_of_birth,
      location_id: decoded.location_id || primary_location.location_id,
    });

    // Add a new wallet for the organization collaborator
    await models.Wallet.query().insert({
      account_id: new_account.id,
    });

    // Delete confirmation token
    await models.Token.query()
      .delete()
      .where("token", token)
      .where("email", email);

    // Search for Region Owner Role
    const role = await models.Role.query()
      .where("scope", decoded.scope)
      .where("name", decoded.name)
      .first();

    // Add a client collaborator
    await models.Collaborator.query().insert({
      role_id: role.id,
      account_id: new_account.id,
      regional_organization_id: Number(decoded.regional_organization_id),
    });

    // Update the collaborator invites table
    await models.CollaboratorInvitation.query()
      .patch({ status: "SIGNED" })
      .where("email", email);

    // Generate the login token
    const jwt_token = await jwt.sign(
      {
        id: new_account.id,
        email: new_account.email,
        scope: role.scope,
        role: role.name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Send signup email
    // await sendConfirmationEmail(new_account, new_token);

    // Return the account
    return res.status(201).json({ token: jwt_token, refresh_token }).send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Invite a new regional organization
const inviteOutletManager = async (req, res, next) => {
  try {
    /* Todo add client organization logic */
    const { owner_email, display_name, custom_message } = req.body;

    // Validate that the client hasn't been registered on the platform
    const client_account = await models.Account.query()
      .where("email", owner_email)
      .first();
    if (client_account)
      return res
        .status(400)
        .json("An account already exists with this email address")
        .send();

    // Create new token to validate owner email
    const role = await models.Role.query()
      .where("scope", "OUTLET")
      .where("name", "MANAGER")
      .first();

    // Sign jwt
    const token = await jwt.sign(
      {
        role_id: role.id,
        scope: role.scope,
        name: role.name,
      },
      process.env.SECRET_KEY
    );

    const new_token = await models.Token.query().insert({
      email: owner_email,
      token,
    });

    // send invite email
    const host = { first_name: "Booze Boss", last_name: "Team" };
    await outletInviteEmail(
      owner_email,
      new_token,
      { scope: "OUTLET", name: "MANAGER" },
      { name: display_name, custom_message, host }
    );

    // Add collaborator invitation
    let invitation_expiration_date = new Date();
    invitation_expiration_date.setHours(
      invitation_expiration_date.getHours() + 1
    ); // Default expiration time to 1 hour.
    await models.CollaboratorInvitation.query().insert({
      role_id: role.id,
      email: owner_email,
      expiration_date: invitation_expiration_date,
    });

    return res.status(201).json("Invitation successfull").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Client Signup
const clientSignup = async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      gender,
      date_of_birth,
      phone_number,
      token,
    } = req.body;

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json({ msg: "This email already exists" });

    // Validate expiration time on cient invitation
    const invitation = await models.CollaboratorInvitation.query()
      .withGraphFetched("client")
      .where("email", email)
      .orderBy("created_at", "DESC")
      .first();

    if (new Date(invitation.expiration_date).getTime() <= new Date().getTime())
      return res.status(400).json("Invitation already expired").send();

    // Validate the token signature
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Check if the token sent is on the database
    const tokens = await models.Token.query()
      .where("token", token)
      .where("email", email);

    // If there aren't tokens return error
    if (!tokens || tokens.length < 1)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate a refresh token
    const refresh_token = await crypto.randomBytes(16).toString("hex");

    // Add new account
    const new_account = await models.Account.query().insert({
      email,
      first_name,
      last_name,
      phone_number,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: true,
      refresh_token,
      location_id: invitation.client.location_id,
      gender,
      date_of_birth,
    });

    // Add wallet to client account
    await models.Wallet.query().insert({
      account_id: new_account.id,
    });

    // Update the Client organization owner_id
    if (decoded.scope === "BRAND" && decoded.name === "OWNER") {
      await models.Client.query()
        .patch({ owner_id: new_account.id })
        .where("contact_email", email);
    }

    // Delete confirmation token
    await models.Token.query()
      .delete()
      .where("token", token)
      .where("email", email);

    // Search for Brand Owner Role
    const role = await models.Role.query()
      .where("scope", decoded.scope)
      .where("name", decoded.name);

    // Add a client collaborator
    await models.ClientCollaborator.query().insert({
      role_id: role[0].id,
      account_id: new_account.id,
      client_id: decoded.client_id,
    });

    // Update the collaborator invites table
    await models.CollaboratorInvitation.query()
      .patch({ status: "SIGNED" })
      .where("email", email);

    // Generate the login token
    const jwt_token = await jwt.sign(
      {
        id: new_account.id,
        email: new_account.email,
        scope: role[0].scope,
        role: role[0].name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Send signup email
    // await sendConfirmationEmail(new_account, new_token);

    // Return the account
    return res.status(201).json({ token: jwt_token, refresh_token }).send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Client Signup
const agencySignup = async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      gender,
      phone_number,
      token,
      date_of_birth,
    } = req.body;

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json({ msg: "This email already exists" });

    // Validate the token signature
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Check if the token sent is on the database
    const tokens = await models.Token.query()
      .where("token", token)
      .where("email", email);

    // If there aren't tokens return error
    if (!tokens || tokens.length < 1)
      return res.status(400).json({ msg: "The email or token are invalid" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate a refresh token
    const refresh_token = await crypto.randomBytes(16).toString("hex");

    // Validate account location
    const invitation = await models.CollaboratorInvitation.query()
      .withGraphFetched(
        `[
                                        agency.[
                                            client
                                        ]
                                    ]`
      )
      .where({ email })
      .first();

    // Add new account
    const new_account = await models.Account.query().insert({
      email,
      first_name,
      last_name,
      phone_number,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: true,
      refresh_token,
      location_id: invitation.agency.client.location_id,
      gender,
      date_of_birth,
    });

    // Add wallet to client account
    await models.Wallet.query().insert({
      account_id: new_account.id,
    });

    // Update the Client organization owner_id
    if (decoded.scope === "AGENCY" && decoded.name === "OWNER") {
      await models.Agency.query()
        .patch({
          owner_id: new_account.id,
          sla_accepted: true,
        })
        .where("contact_email", email);
    }

    // Delete confirmation token
    await models.Token.query()
      .delete()
      .where("token", token)
      .where("email", email);

    // Search for Brand Owner Role
    const role = await models.Role.query()
      .where("scope", decoded.scope)
      .where("name", decoded.name);

    // Add a client collaborator
    await models.AgencyCollaborator.query().insert({
      role_id: role[0].id,
      account_id: new_account.id,
      agency_id: decoded.agency_id,
    });

    // Generate the login token
    const jwt_token = await jwt.sign(
      {
        id: new_account.id,
        email: new_account.email,
        scope: role[0].scope,
        role: role[0].name,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    // Update the collaborator status
    await models.CollaboratorInvitation.query()
      .patch({ status: "SIGNED" })
      .where("email", email);

    // Send signup email
    // await sendConfirmationEmail(new_account, new_token);

    // Return the account
    return res.status(201).json({ token: jwt_token, refresh_token }).send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// Signup for event guests
const guestSignup = async (req, res, next) => {
  try {
    const {
      email,
      first_name,
      last_name,
      phone_number,
      code,
      password,
      gender,
      date_of_birth,
    } = req.body;

    if (!email || !first_name || !last_name || !phone_number || !password)
      return res.status(400).json("Missing fields").send();

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account && account.length > 0)
      return res.status(400).json("This email already exists");

    // If the code doesn't exist return an error
    // if (!code) return res.status(400).json("Invalid invite code");

    // Search for the token and email
    let guest;

    // Check if there is an existing personal code for this guest.
    // guest = await models.EventGuest.query()
    //   .withGraphFetched(
    //     `[
    //                 role,
    //                 event.[
    //                     brief.[
    //                         client
    //                     ]
    //                 ]
    //             ]`
    //   )
    //   .where("code", code)
    //   .first();

    // If there isnt' a personal code try to get a master code
    // if (!guest) {
    //   const event = await models.Event.query()
    //     .where({ master_code: code })
    //     .first();

    //   // If there is an event with this code create an event guest.
    //   if (event) {
    //     // Find the regular role guest
    //     const role = await models.Role.query()
    //       .where({ scope: "GUEST", name: "REGULAR" })
    //       .first();

    //     await models.EventGuest.query()
    //       .insert({
    //         email,
    //         first_name,
    //         last_name,
    //         role_id: role.id,
    //         event_id: event.id,
    //         phone_number,
    //         code: `${code}_MASTERCODE`,
    //         code_redeemed: true,
    //       })
    //       .returning("id");

    //     // Fetch the guest
    //     guest = await models.EventGuest.query()
    //       .withGraphFetched(
    //         `[
    //                         role,
    //                         event.[
    //                             brief.[
    //                                 client
    //                             ]
    //                         ]
    //                     ]`
    //       )
    //       .where({
    //         email,
    //         event_id: event.id,
    //       })
    //       .first();
    //   }
    // }

    // if (!guest) return res.status(400).json("Invalid invite code");

    // Validate email
    // if (guest.email && guest.email !== email)
    //   return res
    //     .status(400)
    //     .json("The code doesn't match with the provided email");

    // If the guest doesn't have a email verification send an email but if the guest already has been validated by the platform
    // log him in inmediatly
    if (guest && guest.email === email) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Verify their location
      // const location_service = await fetch(`http://ip-api.com/json/${req.connection.remoteAddress}`)
      // const signup_location = await models.Location.query().where({name: location_service.countrt}).first();
      // if (!signup_location) return res.status(400).json(`Signup from ${location_service.country} is not available`).send();

      // Add new account
      const new_account = await models.Account.query().insert({
        email,
        first_name,
        last_name,
        password_hash,
        phone_number,
        is_admin: false,
        is_email_verified: true,
        is_age_verified: false,
        location_id: guest.event.brief.client.location_id,
        gender,
        date_of_birth,
      });

      // Generate the login token
      const jwt_token = await jwt.sign(
        {
          id: new_account.id,
          email: new_account.email,
          scope: "GUEST",
          role: guest.role.name,
          is_age_verified: false,
        },
        process.env.SECRET_KEY,
        { expiresIn: "31d" }
      );

      await models.EventGuest.query()
        .update({
          account_id: new_account.id,
        })
        .where("id", guest.id);

      return res.status(200).json({ login: true, jwt_token }).send();
    } else {
      // If its only a code signup
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Add new account
      const new_account = await models.Account.query().insert({
        email,
        first_name,
        last_name,
        password_hash,
        phone_number,
        is_admin: false,
        is_email_verified: false,
        is_age_verified: false,
      });

      // Create new token
      const new_token = await models.Token.query().insert({
        email: new_account.email,
        token: crypto.randomBytes(16).toString("hex"),
      });

      // Update event guest
      // await models.EventGuest.query()
      //   .update({
      //     account_id: new_account.id,
      //     first_name,
      //     last_name,
      //     email,
      //     phone_number,
      //     code_redeemed: true,
      //   })
      //   .where("id", guest.id);

      const jwt_token = await jwt.sign(
        {
          id: new_account.id,
          email: new_account.email,
          scope: "GUEST",
          role: "REGULAR",
          is_age_verified: false,
        },
        process.env.SECRET_KEY,
        { expiresIn: "31d" }
      );

      // Send signup email
      await sendConfirmationEmail(new_account, new_token);

      // Return the account
      return res
        .status(201)
        .json({
          login: true,
          message: `We sent you an email to ${email} to confirm your account`,
          jwt_token,
        })
        .send();
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Fetch account
    const account = await models.Account.query()
      .withGraphFetched(
        `[
                    collaborator.[
                        organization,
                        client,
                        agency.[
                            client
                        ],
                        role
                    ]
                ]`
      )
      .where("email", email)
      .first();
    // Return if the account doesn't exist
    if (!account)
      return res.status(401).json("Incorrect password or email").send();
    if (!account.is_email_verified)
      return res.status(401).json("Please verify your email").send();

    // Compare passwords
    const isCorrectPassword = await bcrypt.compareSync(
      password,
      account.password_hash
    );

    // If the password is incorrect return
    if (!isCorrectPassword)
      return res.status(401).json("Incorrect password or email").send();

    // Validate by admin first
    let scope = account.is_admin && "ADMIN";
    let role = account.is_admin && "ADMIN";

    // Validate Expiration Date
    if (!account.is_admin && account.collaborator) {
      if (!account.collaborator)
        return res.status(401).json("Invalid account").send();
      if (
        account.collaborator.organization &&
        new Date(account.collaborator.organization.expiration_date).getTime() <=
          new Date().getTime()
      )
        return res
          .status(403)
          .json("Account expired, please contact support@boozeboss.co")
          .send();
      if (
        account.collaborator.client &&
        new Date(account.collaborator.client.expiration_date).getTime() <=
          new Date().getTime()
      )
        return res
          .status(403)
          .json("Account expired, please contact support@boozeboss.co")
          .send();
      if (
        account.collaborator.agency &&
        account.collaborator.agency.client &&
        new Date(
          account.collaborator.agency.client.expiration_date
        ).getTime() <= new Date().getTime()
      )
        return res
          .status(403)
          .json("Account expired, please contact support@boozeboss.co")
          .send();
    }

    // Validate by brand if it isn't admin
    if (!scope || !role) {
      scope = account.collaborator && account.collaborator.role.scope;
      role = account.collaborator && account.collaborator.role.name;
    }

    // Sign token
    const token = await jwt.sign(
      {
        id: account.id,
        email: account.email,
        scope: scope || "GUEST",
        role: role || "REGULAR",
        is_age_verified: account.is_age_verified,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    const refresh_token = await crypto.randomBytes(16).toString("hex");
    await models.Account.query()
      .where("id", account.id)
      .update({ refresh_token });

    return res.status(200).json({ token, refresh_token });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    const account = await models.Account.query()
      .withGraphFetched(
        `[
                            role,
                            collaborator.[
                                organization,
                                client,
                                agency.[
                                    client
                                ]
                            ]
                        ]`
      )
      .where("refresh_token", refresh_token)
      .first();

    if (!account) return res.status(400).json("Invalid account").send();
    const scope = account.is_admin ? "ADMIN" : account.role.scope;
    const role = account.is_admin ? "ADMIN" : account.role.name;

    // Validate Expiration Date
    if (!account.is_admin) {
      if (!account.collaborator)
        return res
          .status(401)
          .json({ message: "Invalid collaborator", status: 401 })
          .send();
      if (
        account.collaborator.organization &&
        new Date(account.collaborator.organization.expiration_date).getTime() <=
          new Date().getTime()
      )
        return res
          .status(403)
          .json({ message: "Expired account", status: 401 })
          .send();
      if (
        account.collaborator.client &&
        new Date(account.collaborator.client.expiration_date).getTime() <=
          new Date().getTime()
      )
        return res
          .status(403)
          .json({ message: "Expired account", status: 401 })
          .send();
      if (
        account.collaborator.agency &&
        account.collaborator.agency.client &&
        new Date(
          account.collaborator.agency.client.expiration_date
        ).getTime() <= new Date().getTime()
      )
        return res
          .status(403)
          .json({ message: "Expired account", status: 401 })
          .send();
    }

    // Sign token
    const token = await jwt.sign(
      {
        id: account.id,
        email: account.email,
        scope,
        role,
        is_age_verified: account.is_age_verified,
      },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );

    const new_refresh_token = await crypto.randomBytes(16).toString("hex");
    await models.Account.query()
      .where("id", account.id)
      .update({ refresh_token: new_refresh_token });

    return res.status(200).json({ token, refresh_token: new_refresh_token });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// GET - Verify the signup email
const confirmation = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find a token
    const tokens = await models.Token.query().where("token", token);

    // Validate if token exists
    if (!tokens || token.length < 1)
      return res.status(400).json("Invalid token").send();

    // Update account to verified
    const updated_account = await models.Account.query()
      .patch({ is_email_verified: true })
      .where("email", tokens[0].email);

    // Delete invalid token
    await models.Token.query().deleteById(tokens[0].id);

    // Return updated account
    return res.redirect(
      `${process.env.SCHEMA}://${process.env.APP_HOST}${
        process.env.APP_PORT && `:${process.env.APP_PORT}`
      }/login?verified=true`
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Resend verification email token
const resendToken = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find the account
    const accounts = await models.Account.query().where("email", email);

    // Validate email
    if (!accounts[0] || accounts.length < 1)
      return res.status(401).json("The email is invalid").send();
    if (accounts[0].is_email_verified)
      return res.status(401).json("The email was already verified").send();

    // Create new token
    const new_token = await models.Token.query().insert({
      email: accounts[0].email,
      token: crypto.randomBytes(16).toString("hex"),
    });

    // Send signup email
    await sendConfirmationEmail(accounts[0], new_token);

    // Return the account
    return res.status(201).json({ account: accounts[0], new_token }).send();
  } catch (e) {
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Resend verification email token
const resendInvitation = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { collaborator_invitation_id } = req.body;

    // Validate that the user hasn't logged in
    const invitation = await models.CollaboratorInvitation.query()
      .withGraphFetched(
        `[
                organization,
                client,
                agency, 
                role,
            ]`
      )
      .findById(collaborator_invitation_id);

    if (invitation && invitation.status === "SIGNED")
      return res
        .status(400)
        .json("This invitation has already been used")
        .send();

    // Define email
    const { email } = invitation;

    // Get the token
    const token = await models.Token.query()
      .where("email", email)
      .orderBy("created_at", "DESC")
      .first();

    // Update collaborator invitaion expiration
    let invitation_expiration_date = new Date();
    invitation_expiration_date.setHours(
      invitation_expiration_date.getHours() + 1
    ); // Default expiration time to 1 hour.
    await models.CollaboratorInvitation.query()
      .update({ expiration_date: invitation_expiration_date })
      .where("email", email)
      .orderBy("creation_date", "DESC")
      .first();

    // send invite email
    const host = await models.Account.query().findById(account_id);

    // Route emails depending of the type of invitation
    if (invitation.organization) {
      await organizationInviteEmail(email, token, invitation.role, { host });
    }

    if (invitation.client) {
      await clientInviteEmail(email, token, invitation.role, { host });
    }

    if (invitation.agency) {
      await agencyInviteEmail(email, token, invitation.role, { host });
    }

    // Return the account
    return res.status(201).json("Successfully resend invitation").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Set the reset token and send an email with the url
const forgot = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Get the account
    const accounts = await models.Account.query().where("email", email);

    // Validate account
    if (!accounts[0] || accounts.length < 1)
      return res.status(401).json("No account found").send();

    // Generate a new password reset token and expiration
    const password_reset_token = await crypto.randomBytes(16).toString("hex");
    const password_reset_expiration = new Date(Date.now() + 3600000);

    // Set the token password_reset_token and expiration
    const updated_account = await models.Account.query()
      .patch({ password_reset_token, password_reset_expiration })
      .where("email", accounts[0].email);

    // Send an email with recovery instructions
    await sendFotgotPasswordEmail(accounts[0], password_reset_token);

    return res
      .status(201)
      .json(
        `An email was sent to ${accounts[0].email} with further instructions.`
      );
  } catch (e) {
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// POST - Set the new password comparing the token
const reset = async (req, res, next) => {
  try {
    const { email, token, password } = req.body;

    // Get the account
    const account = await models.Account.query().where("email", email).first();

    // Validate account
    if (!account) return res.status(401).json("No account found").send();

    // Validate that it isn't setting the same password
    // Compare passwords
    const isCorrectPassword = await bcrypt.compareSync(
      password,
      account.password_hash
    );

    // If the password is incorrect return
    if (isCorrectPassword)
      return res
        .status(401)
        .json("You can't set your old password as new")
        .send();

    // Validate token and expiration
    if (token !== account.password_reset_token)
      return res.status(401).json("Invalid token").send();
    if (Date.now() > new Date(account.password_reset_expiration))
      return res.status(401).json("Expired token").send();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Update account
    await models.Account.query()
      .patch({
        password_hash,
        password_reset_token: null,
        password_reset_expiration: null,
      })
      .where("email", account.email);

    return res.status(201).json(`Password updated!`);
  } catch (e) {
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const authWithFacebook = async (req, res, next) => {
  try {
    // Get facebook parameters
    const {
      email,
      name,
      age_range,
      facebook_access_token,
      facebook_data_access_expiration_time,
      facebook_user_id,
      facebook_signed_request,
    } = req.body;

    if (
      !email ||
      !name ||
      !facebook_access_token ||
      !facebook_data_access_expiration_time ||
      !facebook_user_id ||
      !facebook_signed_request
    )
      return res.status(400).json("Invalid auth").send();
    if (age_range && age_range.min < 18)
      return res
        .status(403)
        .json("You need to be +18 to use Booze Boss")
        .send();

    // Check if login or signup
    const accounts = await models.Account.query()
      .where("email", email)
      .where("facebook_user_id", facebook_user_id);

    const account = accounts[0];
    if (account) {
      // If it exists an account is a login attempt
      // Update account
      const updated_account = await models.Account.query()
        .update({
          facebook_access_token,
          facebook_data_access_expiration_time,
          facebook_user_id,
          facebook_signed_request,
        })
        .where("id", account.id);

      // Sign token
      const token = await jwt.sign(
        {
          id: account.id,
          email: account.email,
          scope: "GUEST",
          role: "REGULAR",
          is_age_verified: account.is_age_verified,
        },
        process.env.SECRET_KEY,
        { expiresIn: "365d" }
      );

      return res.status(200).json(token).send();
    } else {
      // If no account exist is a signup
      // Autogenerate password
      const password = Math.random().toString(36).substring(7).toUpperCase();
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const first_name = name.split(" ")[0];
      const last_name = name.split(" ")[1] || "";

      let temporal_age_verification_limit = new Date();
      temporal_age_verification_limit.setHours(
        temporal_age_verification_limit.getHours() + 48
      );

      // Add new account
      const new_account = await models.Account.query().insert({
        email,
        first_name,
        last_name,
        password_hash,
        is_admin: false,
        is_email_verified: true,
        is_age_verified: false,
        facebook_access_token,
        facebook_data_access_expiration_time,
        facebook_user_id,
        facebook_signed_request,
        temporal_age_verification_limit: moment(temporal_age_verification_limit)
          .utc()
          .format(),
      });

      // Sign token
      const token = await jwt.sign(
        {
          id: new_account.id,
          email: new_account.email,
          scope: "GUEST",
          role: "REGULAR",
          is_age_verified: false,
        },
        process.env.SECRET_KEY,
        { expiresIn: "365d" }
      );

      return res.status(200).json(token).send();
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const userController = {
  // User
  getUser,
  // Auth
  signup,
  outletSignup,
  organizationSignup,
  clientSignup,
  agencySignup,
  guestSignup,
  login,
  refreshToken,
  confirmation,
  resendToken,
  resendInvitation,
  forgot,
  reset,
  // OAuth
  authWithFacebook,
  inviteOutletManager,
  verifyEmailOrPhone,
  waiterSignup,
};

export default userController;
