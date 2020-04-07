import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendConfirmationEmail, sendFotgotPasswordEmail } from './mailling';


// GET - Profile
const getProfile = (req, res, next) => {
    
}

// PATCH - Profile
const updateProfile = (req, res, next) => {
    

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

// POST - Login
const login = async (req, res, next) => {

    const {email, password} = req.body;

    try {

        // Fetch account
        const account = 
            await models.Account.query()
                .where('email', email);

        // Return if the account doesn't exist
        if (!account || account.length < 1) return res.status(401).json("Incorrect password or email").send();
        if (!account[0].is_email_verified) return res.status(401).json("Please verify your email").send(); 

        // Compare passwords
        const isCorrectPassword = await bcrypt.compareSync(password, account[0].password_hash);

        // If the password is incorrect return
        if (!isCorrectPassword) return res.status(401).json("Incorrect password or email").send(); 

        const token = await jwt.sign({id: account.id, }, process.env.SECRET_KEY, { expiresIn: '31d' });
                        
        return res.status(201).json(token);

    } catch (e) {
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

}

// POST - Set the reset token and send an email with the url
const forgot = (req, res, next) => {
    // Get the user
    /* models.User.findOne({email: req.body.email}, (err, user) => {
        if (err) return res.status(500);
        if (!user) return res.status(404).json({message: 'User not found'});

        // Calculate the token
        crypto.randomBytes(16, (err, buff) => {
            // Set the user values for expiration
            user.passwordResetToken = buff.toString('hex');
            user.passwordResetExpires = Date.now() + 3600000; 

            // Save the user to the database
            user.save((err) => {
                if (err) return res.status(500);
                // Send email
                sendFotgotPasswordEmail(user);
                res.status(201).json({message: 'Successful request'});
            })
        })
    }) */
}

// POST - Set the new password comparing the token
const reset = (req, res, next) => {

    /* async.waterfall([
        // Find the user
        (done) => {
            models.User.findOne({email: req.body.email} , (err, user) => {
                // Handle possible errors
                if (err) return res.status(500);
                if (!user) return res.status(404).json({message: 'User not found'});

                // Validate the token matches the db.
                if (user.passwordResetToken === req.body.token) {
                    // Vlidate expiration
                    if ((new Date(user.passwordResetExpires).getTime() >= Date.now())) {
                        // Set the new password and remove the token logic from the model
                        user.password = req.body.password;
                        user.passwordResetToken = undefined;
                        user.passwordResetExpires = undefined;

                        // Return the new user
                        done(null, user);
                    } else {
                        return res.status(401).json({message: 'Expired token'})
                    }
                } else {
                    return res.status(401).json({message: 'Invalid token'})
                }            
            })
        },
        // Save the user to the db
        (user, done) => {
            console.log('try to save user', user)
            // Save the user
            user.save((err) => {
                if (err) return res.status(500);
                console.log('User saved')
                return res.status(201).json({message: 'Password updated'});
            })
        }
    ], (err, result) => {
        if (err) return res.status(500);
    }) */
}



const userController = {
    // User
    getProfile,
    updateProfile,
    // Auth
    signup,
    login,
    confirmation, 
    resendToken,
    forgot,
    reset,
}

export default userController;