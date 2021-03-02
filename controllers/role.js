import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendConfirmationEmail, sendFotgotPasswordEmail, clientInviteEmail } from './mailling';

// GET - Get a list of roles
const getRoles = async (req, res, next) => {
    
    try {    
        const {scope, name} = req.query;

        const roles =  
            await models.Role.query()
                .modify((queryBuilder) => {
                    if (scope) {
                        queryBuilder.where('scope', scope);
                    }
                    if (name) {
                        queryBuilder.where('name', name);
                    }
                }) 

        // Send the clients
        return res.status(201).send(roles);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}




const roleController = {
    // Client
    getRoles,
}

export default roleController;