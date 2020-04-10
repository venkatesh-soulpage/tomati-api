import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendConfirmationEmail, sendFotgotPasswordEmail, clientInviteEmail } from './mailling';

// GET - Get a list of clients
const getClients = async (req, res, next) => {
    try {

        // Get the clients
        const clients = 
            await models.Client.query()
                .withGraphFetched('[client_collaborators, client_collaborators.[account, role]]')
                .modifyGraph('client_collaborators', builder => {
                    builder.select('id');
                })

        // Send the clients
        return res.status(201).json(clients).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Create a new client organization and send an email to the client
const inviteClient = async (req, res, next) => {
    try {
        /* Todo add client organization logic */
        const {name, description, owner_email} = req.body;

        // Create client
        const client = 
            await models.Client.query()
                .insert({
                    name, 
                    description, 
                    contact_email: owner_email,
                })

        // Create new token to validate owner email
        const new_token = 
            await models.Token.query().insert({
                email: owner_email,
                token: crypto.randomBytes(16).toString('hex')
            })

        // TODO send invite email
        await clientInviteEmail(owner_email, new_token);

        return res.status(201).json(client).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const clientController = {
    // Client
    getClients,
    inviteClient
}

export default clientController;