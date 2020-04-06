import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

// import { sendConfirmationEmail, sendFotgotPasswordEmail } from './mailling';


// GET - Profile
const getProfile = (req, res, next) => {
    
}

// PATCH - Profile
const updateProfile = (req, res, next) => {
    

}


// POST - Signup
const create = (req, res, next) => {

    /* const {email, token, username, firstName, lastName, password} = req.body.user;

    async.waterfall([
        // Validate the token with email
        (done) => {
            models.Token.findOne({email, token}, (err, userToken) => {
                if (err) return done(err.errmsg);
                if (!userToken) return done('Invalid token');

                done(null, userToken);
            })
        },
        // If it was a token, create the user
        (userToken, done) => {

            const newUser = { 
                username, email, firstName, lastName, password,
                isVerified: true,
            }
        
            models.User.create(newUser, (err, user) => {
                // If error return 500
                if (err) return done(err.errmsg);
                if (!user) return done('Error creating the user');

                done(null, user, userToken);
            })
       },
       // Delete the token
       (user, userToken, done) => {
            models.Token.findByIdAndDelete(userToken._id, (err, query) => {
                if (err) return done(err.errmsg);
                return res.status(201).json({message: 'User created', user});
            })
       },
    ], (err, result) => {
        console.log(err);
        res.status(500).json(err).send();
    })*/
}

// POST - Login
const authenticate = (req, res, next) => {
    /* models.User.findOne({username: req.body.auth.username}, function(err, userInfo){
        try {
            if (err) {
                next(err);
            } else {
                try {
                    
                    // Validate user verification
                    if (!userInfo.isVerified) return res.status(403).json({message: "Please confirm your email address."})

                    if(bcrypt.compareSync(req.body.auth.password, userInfo.password)) {
                        const token = jwt.sign({id: userInfo._id, role: userInfo.role}, process.env.SECRET_KEY, { expiresIn: '31d' });
                        res.status(201).json(token);
                    }else{
                        res.status(403).json({message: "The user or password are incorrect"});
                    }
                } catch(e) {
                    res.status(403).json({message: "The user or password are incorrect"});
                }
            }
        } catch (e) {
            res.status(500);
        }
    }); */
}

// GET - Verify the signup email
const confirmation = (req, res, next) => {

    /* models.Token.findOne({ token: req.params.token }, (err, token) => {
        // If the token wasn't found return an error
        if (!token) return res.status(400).send({message: 'Invalid Token'});

        // If the token was found update the user
        models.User.findOne({_id: token._userId }, (err, user) => {
            // If no user was found return 400
            if (err) return res.status(500)
            if (!user) return res.status(400).send({ message: 'Unable to find user for the token provided.'}); 
            if (user.isVerified) return res.status(400).send({message: 'This user is already verified'});

            // Verify and save the user
            user.isVerified = true;
            user.save((userErrors) => {
                if (userErrors) return res.status(500);
                const redirectUrl = `${process.env.SCHEMA}://${process.env.FRONT_HOST}${process.env.FRONT_PORT && `:${process.env.FRONT_PORT}`}/login?email=${user.email}`
                res.send(`<script>window.location.href="${redirectUrl}";</script>`)
            })
        })
    })   */
}


// POST - Resend verification email token
const resendToken = (req, res, next) => {
    // Find if the user is valid
    /* models.User.findOne({ email: req.body.email}, (err, user) => {
        // If the user doesn't exist return 404
        if (!user) return res.status(404).json({message: 'User not found'});
        
        // Create the token model
        const newToken = {
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        }

         // Save the new token to the database
         models.Token.create(newToken, (err, token) => {
            if (err) {
                res.status(500);
            } 

            // Handle token creation
            if (token) {
                try {
                    // Send confirmation email and return the status
                    sendConfirmationEmail(req.body, token);
                    res.status(200).json(`Email re-sent to ${user.email}`);
                } catch (e) {
                    res.send(500);
                }
                
            }
        })
    }) */
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
    create,
    authenticate,
    confirmation, 
    resendToken,
    forgot,
    reset,
}

export default userController;