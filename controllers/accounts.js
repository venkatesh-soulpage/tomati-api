import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendConfirmationEmail, sendFotgotPasswordEmail } from './mailling';


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

        const {email, password, first_name, last_name, token } = req.body;

        // Check if the account doesn't exist
        const account = 
        await models.Account.query()
            .where('email', email);

        // If the account exist, return message        
        if (account && account.length > 0) return res.status(400).json({msg: 'This email already exists'});

        // Check if the token sent is valid
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
                    email, first_name, last_name, password_hash,
                    is_admin: false,
                    is_email_verified: true,
                    is_age_verified: true,
                });

        // Update the Client organization owner_id and fetch the id
        await models.Client.query()
                .patch({owner_id: new_account.id})
                .where('contact_email', email)

        const updated_clients = 
            await models.Client.query()
                .where('contact_email', email)

        // Delete confirmation token
        await models.Token.query()
                .delete()
                .where('token', token)
                .where('email', email);

        // Search for Brand Owner Role
        const role = 
                await models.Role.query()
                    .where('scope','BRAND')
                    .where('name','OWNER')

        // Add a client collaborator
        await models.ClientCollaborator.query()
                .insert({
                    role_id: role[0].id,
                    account_id: new_account.id,
                    client_id: updated_clients[0].id,
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

// POST - Agency Signup
const agencySignup = async (req, res, next) => {

    try { 

        const {email, password, first_name, last_name, token } = req.body;

        // Check if the account doesn't exist
        const account = 
        await models.Account.query()
            .where('email', email);

        // If the account exist, return message        
        if (account && account.length > 0) return res.status(400).json({msg: 'This email already exists'});

        // Check if the token sent is valid
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
                    email, first_name, last_name, password_hash,
                    is_admin: false,
                    is_email_verified: true,
                    is_age_verified: true,
                });

        // Update the Client organization owner_id and fetch the id
        await models.Agency.query()
                .patch({owner_id: new_account.id})
                .where('contact_email', email)

        const updated_agencies = 
            await models.Agency.query()
                .where('contact_email', email)

        // Delete confirmation token
        await models.Token.query()
                .delete()
                .where('token', token)
                .where('email', email);

        // Search for Brand Owner Role
        const role = 
                await models.Role.query()
                    .where('scope','AGENCY')
                    .where('name','MANAGER')

        // Add a client collaborator
        await models.AgencyCollaborator.query()
                .insert({
                    role_id: role[0].id,
                    account_id: new_account.id,
                    agency_id: updated_agencies[0].id,
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
        if (!scope || role) {

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
        if (!scope || role) {

            const agencyCollaborators = 
                await models.AgencyCollaborator.query()
                    .where('account_id', accounts[0].id)
                    .withGraphFetched('role');

                if (agencyCollaborators.length > 0) {
                    scope = brandCollaborators[0].role.scope;
                    role = brandCollaborators[0].role.name;
                }
        }
        
        if (!scope || !role ) return res.status(401).send({mesg: 'Invalid account'});

        // Sign token
        const token = await jwt.sign(
            {
                id: accounts[0].id, 
                email: accounts[0].email, 
                scope,
                role,
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
        return res.status(201).json(updated_account).send();

    } catch (e) {
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

const userController = {
    // Auth
    signup,
    clientSignup,
    agencySignup,
    login,
    confirmation, 
    resendToken,
    forgot,
    reset,
}

export default userController;