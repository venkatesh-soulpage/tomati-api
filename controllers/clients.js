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

        const {account_id} = req;

        // Get the clients depending on admin or client
        let clients; 
        
        if (req.scope === 'ADMIN') {
            clients = 
                await models.Client.query()
                    .withGraphFetched('[client_collaborators, client_collaborators.[account, role]]')
                    .modifyGraph('client_collaborators', builder => {
                        builder.select('id');
                    })
        } else {
            // Get Client id by ClientCollaborator relation
            const collaborators = 
                await models.ClientCollaborator
                    .query()
                    .where('account_id', account_id)
                    .withGraphFetched('client')

            const collaborator = collaborators[0];
            
            clients =
                await models.Client.query()
                    .where('id', collaborator.client_id)
                    .withGraphFetched('[client_collaborators, client_collaborators.[account, role]]')
                    .modifyGraph('client_collaborators', builder => {
                        builder.select('id');
                    }) 
        }            

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
        const {
            name, description, owner_email,
            collaborator_limit, briefs_limit, brands_limit, warehouses_limit, locations_limit
        } = req.body;

        // Create client
        const client = 
            await models.Client.query()
                .insert({
                    name, 
                    description, 
                    contact_email: owner_email,
                    collaborator_limit, 
                    briefs_limit, 
                    brands_limit, 
                    warehouses_limit,
                    locations_limit
                })

        // Create new token to validate owner email
        const role = 
                await models.Role.query()
                    .where('scope', 'BRAND')
                    .where('name', 'OWNER');
        

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id: role[0].id,
                client_id: client.id,
                scope: role[0].scope,
                name: role[0].name
            }, 
            process.env.SECRET_KEY,
        );

        const new_token = 
            await models.Token.query().insert({
                email: owner_email,
                token,
            })

        // TODO send invite email
        await clientInviteEmail(owner_email, new_token, {scope: 'BRAND', name: 'OWNER'});

        return res.status(201).json(client).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a new client collaborator
const inviteCollaborator = async (req, res, next) => {
    try {
        
        const { account_id } = req;
        const { email, role_id } = req.body;

        if (!email || !role_id) return res.status(400);

        // Get Client id by ClientCollaborator relation
        const collaborators = 
            await models.ClientCollaborator
                .query()
                .where('account_id', account_id)
                .withGraphFetched('client')

        const collaborator = collaborators[0];

        const client_collaborators =
            await models.ClientCollaborator
                .query()
                .where('client_id', collaborator.client_id);
            
        // Validate that the Client has remaining collaborators
        if (collaborator.client.collaborator_limit <= client_collaborators.length) return res.status(401).json('You had exceed your collaborators limit').send();

        // Search for the role object
        const role = 
            await models.Role
                .query()
                .where('id', role_id);

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id,
                client_id: collaborator.client_id,
                scope: role[0].scope,
                name: role[0].name
            }, 
            process.env.SECRET_KEY,
        );

        // Create new token to validate owner email
        const new_token = 
            await models.Token.query()
            .insert({
                email: email,
                token
            })

        // Send invite email
        await clientInviteEmail(email, new_token, role[0]);

        return res.status(201).json('Collaborator invited').send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const clientController = {
    // Client
    getClients,
    inviteClient,
    inviteCollaborator
}

export default clientController;