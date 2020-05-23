import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';
import moment from 'moment';

import { sendConfirmationEmail, sendFotgotPasswordEmail } from './mailling';

// GET - Get user profile
const getUser = async (req, res, next) => {
    try {
        const {account_id} = req;

        const account = 
            await models.Account.query()
                    .withGraphFetched('[wallet]')
                    .findById(account_id);

        if (!account) return res.status(400).json('Invalid account').send();

        return res.status(200).send(account);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Signup
const signup = async (req, res, next) => {

    const {email, password, first_name, last_name } = req.body;

    try { 
        // Check if the account doesn't exist
        const account = 
        await models.Account.query()
            .where('email', email);

        // If the account exist, return message        
        if (account && account.length > 0) return res.status(400).json({msg: 'This email already exists'});
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
 
        // Add new account
        const new_account = 
            await models.Account.query()
                .insert({
                    email, first_name, last_name, password_hash,
                    is_admin: false,
                    is_email_verified: false,
                    is_age_verified: false,
                });

        // Create new token
        const new_token = 
            await models.Token.query().insert({
                email: new_account.email,
                token: crypto.randomBytes(16).toString('hex')
            })

        // Send signup email
        await sendConfirmationEmail(new_account, new_token);

        // Return the account
        return res.status(201).json({new_account, new_token}).send();

    } catch (e) {
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Client Signup
const clientSignup = async (req, res, next) => {

    try { 

        const {email, password, first_name, last_name, phone_number, token } = req.body;

        // Check if the account doesn't exist
        const account = 
            await models.Account.query()
                .where('email', email);

        // If the account exist, return message        
        if (account && account.length > 0) return res.status(400).json({msg: 'This email already exists'});


        // Validate the token signature
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) return res.status(400).json({msg: 'The email or token are invalid'});

        // Check if the token sent is on the database
        const tokens = 
            await models.Token.query()
                .where('token', token)
                .where('email', email);

        // If there aren't tokens return error
        if (!tokens || tokens.length < 1) return res.status(400).json({msg: 'The email or token are invalid'});

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
 
        // Add new account
        const new_account = 
            await models.Account.query()
                .insert({
                    email, first_name, last_name, phone_number, password_hash,
                    is_admin: false,
                    is_email_verified: true,
                    is_age_verified: true,
                });

        // Update the Client organization owner_id
        if (decoded.scope === 'BRAND' && decoded.name === 'OWNER') {
            
            await models.Client.query()
                .patch({owner_id: new_account.id})
                .where('contact_email', email)
        }

        // Delete confirmation token
        await models.Token.query()
                .delete()
                .where('token', token)
                .where('email', email);

        // Search for Brand Owner Role
        const role = 
                await models.Role.query()
                    .where('scope', decoded.scope)
                    .where('name', decoded.name)

        // Add a client collaborator
        await models.ClientCollaborator.query()
                .insert({
                    role_id: role[0].id,
                    account_id: new_account.id,
                    client_id: decoded.client_id,
                })
        
        // Generate the login token
        const jwt_token = await jwt.sign(
            {
                id: new_account.id, 
                email: new_account.email, 
                scope: role[0].scope,
                role: role[0].name,
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: '31d' }
        );

        // Send signup email
        // await sendConfirmationEmail(new_account, new_token);

        // Return the account
        return res.status(201).json(jwt_token).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Client Signup
const agencySignup = async (req, res, next) => {

    try { 

        const {email, password, first_name, last_name, phone_number, token } = req.body;
        console.log(req);

        // Check if the account doesn't exist
        const account = 
            await models.Account.query()
                .where('email', email);

        // If the account exist, return message        
        if (account && account.length > 0) return res.status(400).json({msg: 'This email already exists'});


        // Validate the token signature
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) return res.status(400).json({msg: 'The email or token are invalid'});

        // Check if the token sent is on the database
        const tokens = 
            await models.Token.query()
                .where('token', token)
                .where('email', email);

        // If there aren't tokens return error
        if (!tokens || tokens.length < 1) return res.status(400).json({msg: 'The email or token are invalid'});


        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
 
        // Add new account
        const new_account = 
            await models.Account.query()
                .insert({
                    email, first_name, last_name, phone_number, password_hash,
                    is_admin: false,
                    is_email_verified: true,
                    is_age_verified: true,
                });

        // Update the Client organization owner_id
        if (decoded.scope === 'AGENCY' && decoded.name === 'OWNER') {
            
            await models.Agency.query()
                .patch({
                    owner_id: new_account.id,
                    sla_accepted: true,
                })
                .where('contact_email', email)
        }

        // Delete confirmation token
        await models.Token.query()
                .delete()
                .where('token', token)
                .where('email', email);

        // Search for Brand Owner Role
        const role = 
                await models.Role.query()
                    .where('scope', decoded.scope)
                    .where('name', decoded.name)

        // Add a client collaborator
        await models.AgencyCollaborator.query()
                .insert({
                    role_id: role[0].id,
                    account_id: new_account.id,
                    agency_id: decoded.agency_id,
                })
        
        // Generate the login token
        const jwt_token = await jwt.sign(
            {
                id: new_account.id, 
                email: new_account.email, 
                scope: role[0].scope,
                role: role[0].name,
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: '31d' }
        );

        // Send signup email
        // await sendConfirmationEmail(new_account, new_token);

        // Return the account
        return res.status(201).json(jwt_token).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// Signup for event guests
const guestSignup = async (req, res, next) => {
    try { 

        const {email, first_name, last_name, phone_number, code, password} = req.body;

        if (!email || !first_name || !last_name || !phone_number || !code || !password ) return res.status(400).json('Missing fields').send();

        // Check if the account doesn't exist
        const account = 
            await models.Account.query()
                .where('email', email);
            

        // If the account exist, return message        
        if (account && account.length > 0) return res.status(400).json('This email already exists');

        // If the code doesn't exist return an error
        if (!code) return res.status(400).json('Invalid invite code'); 

        // Search for the token and email 
        const event_guest = 
            await models.EventGuest.query()
                .withGraphFetched('[role]')
                .where('code', code);
        
        if (!event_guest || event_guest.length < 1) return res.status(400).json('Invalid invite code');

        const guest = event_guest[0];

        // Validate email
        if (guest.email && guest.email !== email) return res.status(400).json("The code doesn't match with the provided email"); 

        // If the guest doesn't have a email verification send an email but if the guest already has been validated by the platform
        // log him in inmediatly
        if (guest.email === email) {

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
 
            // Add new account
            const new_account = 
                await models.Account.query()
                    .insert({
                        email, first_name, last_name, password_hash, phone_number,
                        is_admin: false,
                        is_email_verified: true,
                        is_age_verified: false,
                    });

            // Generate the login token
            const jwt_token = await jwt.sign(
                {
                    id: new_account.id, 
                    email: new_account.email, 
                    scope: 'GUEST',
                    role: guest.role.name,
                    is_age_verified: false,
                }, 
                process.env.SECRET_KEY, 
                { expiresIn: '31d' }
            );

            await models.EventGuest.query()
                    .update({
                        account_id: new_account.id,
                    })
                    .where('id', guest.id);

            return res.status(200).json({login: true, jwt_token}).send();

        } else {

            // If its only a code signup
             // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
    
            // Add new account
            const new_account = 
                await models.Account.query()
                    .insert({
                        email, first_name, last_name, password_hash, phone_number,
                        is_admin: false,
                        is_email_verified: false,
                        is_age_verified: false,
                    });

            // Create new token
            const new_token = 
                await models.Token.query().insert({
                    email: new_account.email,
                    token: crypto.randomBytes(16).toString('hex')
                })
            
            // Update event guest
            await models.EventGuest.query()
                    .update({
                        account_id: new_account.id,
                        first_name,
                        last_name,
                        email,
                        phone_number,
                        code_redeemed: true
                    })
                    .where('id', guest.id);

            // Send signup email
            await sendConfirmationEmail(new_account, new_token);

            // Return the account
            return res.status(201).json({login: false, message: `We sent you an email to ${email} to confirm your account`}).send();

        }

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Login
const login = async (req, res, next) => {

    const {email, password} = req.body;

    try {

        // Fetch account
        const accounts = 
            await models.Account.query()
                .where('email', email);

        // Return if the account doesn't exist
        if (!accounts || accounts.length < 1) return res.status(401).json("Incorrect password or email").send();
        if (!accounts[0].is_email_verified) return res.status(401).json("Please verify your email").send(); 

        // Compare passwords
        const isCorrectPassword = await bcrypt.compareSync(password, accounts[0].password_hash);

        // If the password is incorrect return
        if (!isCorrectPassword) return res.status(401).json("Incorrect password or email").send(); 

        // Validate by admin first
        let scope = accounts[0].is_admin && 'ADMIN';
        let role = accounts[0].is_admin && 'ADMIN';


        // Validate by brand if it isn't admin
        if (!scope || !role) {

            const brandCollaborators = 
                await models.ClientCollaborator.query()
                    .where('account_id', accounts[0].id)
                    .withGraphFetched('role');

                if (brandCollaborators.length > 0) {
                    scope = brandCollaborators[0].role.scope;
                    role = brandCollaborators[0].role.name;
                }
        }

        // Validate by Agency if it isn't brand
        if (!scope || !role) {

            const agencyCollaborators = 
                await models.AgencyCollaborator.query()
                    .where('account_id', accounts[0].id)
                    .withGraphFetched('role');

                if (agencyCollaborators.length > 0) {
                    scope = agencyCollaborators[0].role.scope;
                    role = agencyCollaborators[0].role.name;
                }
        }

        // Validate by Guests if it isn't brand
        if (!scope || !role) {

            const event_guests = 
                await models.EventGuest.query()
                    .where('account_id', accounts[0].id)
                    .withGraphFetched('role');

                if (event_guests.length > 0) {
                    scope = event_guests[0].role.scope;
                    role = event_guests[0].role.name;
                }
        }
        
        if (!scope || !role ) return res.status(401).json('Invalid account').send();

        // Sign token
        const token = await jwt.sign(
            {
                id: accounts[0].id, 
                email: accounts[0].email, 
                scope,
                role,
                is_age_verified: accounts[0].is_age_verified
            }, 
            process.env.SECRET_KEY, 
            { expiresIn: '31d' }
        );
                        
        return res.status(201).json(token);

    } catch (e) {
        console.log(e)
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Verify the signup email
const confirmation = async (req, res, next) => {

    try {
        
        const {token} = req.params;

        // Find a token
        const tokens = 
            await models.Token.query()
                .where('token', token);

        // Validate if token exists
        if (!tokens || token.length < 1) return res.status(400).json('Invalid token').send();

        // Update account to verified
        const updated_account = 
            await models.Account.query()
                .patch({ is_email_verified: true })
                .where('email', tokens[0].email);

        // Delete invalid token
        await models.Token.query().deleteById(tokens[0].id);

        // Return updated account
        return res.redirect(`${process.env.SCHEMA}://${process.env.APP_HOST}${process.env.APP_PORT && `:${process.env.APP_PORT}`}/login?verified=true`);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Resend verification email token
const resendToken = async (req, res, next) => {

    try {
        const {email} = req.body;

        // Find the account
        const accounts = 
            await models.Account.query()
            .where('email', email);


        // Validate email 
        if (!accounts[0] || accounts.length < 1) return res.status(401).json("The email is invalid").send();
        if (accounts[0].is_email_verified) return res.status(401).json("The email was already verified").send();

        // Create new token
        const new_token = 
            await models.Token.query().insert({
                email: accounts[0].email,
                token: crypto.randomBytes(16).toString('hex')
            })

        // Send signup email
        await sendConfirmationEmail(accounts[0], new_token);

        // Return the account
        return res.status(201).json({account: accounts[0], new_token}).send();

    } catch (e) {
        
        return res.status(500).json(JSON.stringify(e)).send();

    }

}

// POST - Set the reset token and send an email with the url
const forgot = async (req, res, next) => {

    try {
        
        const {email} = req.body;

        // Get the account
        const accounts = 
            await models.Account.query()
                .where('email', email);

        // Validate account
        if (!accounts[0] || accounts.length < 1) return res.status(401).json("No account found").send();

        // Generate a new password reset token and expiration
        const password_reset_token = await crypto.randomBytes(16).toString('hex');
        const password_reset_expiration = new Date(Date.now() + 3600000); 

    
        // Set the token password_reset_token and expiration
        const updated_account = 
            await models.Account.query()
                .patch({ password_reset_token, password_reset_expiration})
                .where('email', accounts[0].email);

        // Send an email with recovery instructions
        await sendFotgotPasswordEmail(accounts[0], password_reset_token);

        return res.status(201).json(`An email was sent to ${accounts[0].email} with further instructions.`);

    } catch (e) {
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Set the new password comparing the token
const reset = async (req, res, next) => {

    try {
    
        const {email, token, password} = req.body;

        // Get the account
        const accounts = 
            await models.Account.query()
                .where('email', email);

        // Validate account
        if (!accounts[0] || accounts.length < 1) return res.status(401).json("No account found").send();

        // Validate token and expiration
        if (token !== accounts[0].password_reset_token) return res.status(401).json("Invalid token").send();
        if (Date.now() > new Date(accounts[0].password_reset_expiration)) return res.status(401).json("Expired token").send();

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
                .where('email', accounts[0].email);

        return res.status(201).json(`Password updated!`);

    } catch (e) {
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

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
            facebook_signed_request
        } = req.body;

        if (!email || !name || !facebook_access_token || !facebook_data_access_expiration_time || !facebook_user_id || !facebook_signed_request) return res.status(400).json('Invalid auth').send();
        if (age_range && age_range.min < 18) return res.status(403).json('You need to be +18 to use Booze Boss').send();


        // Check if login or signup 
        const accounts = 
            await models.Account.query()
                    .where('email', email).where('facebook_user_id', facebook_user_id);

        const account = accounts[0];
        if (account) {
            // If it exists an account is a login attempt
            // Update account
            const updated_account = 
                await models.Account.query()
                    .update({
                        facebook_access_token,
                        facebook_data_access_expiration_time,
                        facebook_user_id,
                        facebook_signed_request
                    })
                    .where('id', account.id);

                // Sign token
                const token = await jwt.sign(
                    {
                        id: account.id, 
                        email: account.email, 
                        scope: 'GUEST',
                        role: 'REGULAR',
                        is_age_verified: account.is_age_verified
                    }, 
                    process.env.SECRET_KEY, 
                    { expiresIn: '365d' }
                );

                return res.status(200).json(token).send();

        } else {
            // If no account exist is a signup
            // Autogenerate password
            const password = Math.random().toString(36).substring(7).toUpperCase();
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            const first_name = name.split(' ')[0];
            const last_name = name.split(' ')[1] || '';
    
            let temporal_age_verification_limit = new Date();
            temporal_age_verification_limit.setHours(temporal_age_verification_limit.getHours() + 48);

            // Add new account
            const new_account = 
                await models.Account.query()
                    .insert({
                        email, first_name, last_name, password_hash,
                        is_admin: false,
                        is_email_verified: true,
                        is_age_verified: false,
                        facebook_access_token,
                        facebook_data_access_expiration_time,
                        facebook_user_id,
                        facebook_signed_request,
                        temporal_age_verification_limit: moment(temporal_age_verification_limit).utc().format(), 
                    });

                // Sign token
                const token = await jwt.sign(
                    {
                        id: new_account.id, 
                        email: new_account.email, 
                        scope: 'GUEST',
                        role: 'REGULAR',
                        is_age_verified: false,
                    }, 
                    process.env.SECRET_KEY, 
                    { expiresIn: '365d' }
                );

                return res.status(200).json(token).send();
            }

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


const userController = {
    // User
    getUser,
    // Auth
    signup,
    clientSignup,
    agencySignup,
    guestSignup,
    login,
    confirmation, 
    resendToken,
    forgot,
    reset,
    // OAuth
    authWithFacebook,
}

export default userController;