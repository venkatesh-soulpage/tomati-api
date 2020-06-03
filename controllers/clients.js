import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';
import AWS from 'aws-sdk';

import { sendConfirmationEmail, sendFotgotPasswordEmail, clientInviteEmail } from './mailling';

// Inititialize AWS 
const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.BUCKETEER_AWS_REGION,
  });

// GET - Get a list of clients
const getClients = async (req, res, next) => {
    try {

        const {account_id} = req;

        // Get the clients depending on admin or client
        let clients; 

        const query = `[
            locations.[
                location
            ], 
            venues, 
            brands, 
            warehouses.[
                location
            ], 
            client_collaborators.[
                account, 
                role
            ],
            collaborator_invitations.[
                role
            ]
        ]`;
        
        if (req.scope === 'ADMIN') {
            clients = 
                await models.Client.query()
                    .withGraphFetched(query)
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
                    .withGraphFetched(query)
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
            collaborator_limit, briefs_limit, brands_limit, warehouses_limit, locations_limit,
            identity_verifications_limit, agencies_limit, agency_collaborators_limit, selected_locations,
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
                    locations_limit,
                    identity_verifications_limit, 
                    agencies_limit, 
                    agency_collaborators_limit
                })

        // Create client locations
        // Validate that there are locations
        const locations = selected_locations.map(selected => {
            return {
                location_id: selected.id,
                client_id: client.id,
            }
        });

        if (locations.length > 0) {
            await models.ClientLocations
                .query()
                .insert(locations);
        }

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

        const query = '[locations.[location], venues, brands, warehouses.[location], client_collaborators.[account, role]]';
        
        // Create client
        const new_client = 
            await models.Client.query()
                .findById(client.id)
                .withGraphFetched(query)
                .modifyGraph('client_collaborators', builder => {
                    builder.select('id');
                }) 
    
        // Add collaborator invitation
        await models.CollaboratorInvitation.query()
                .insert({ 
                    client_id: new_client.id, 
                    role_id: role[0].id,
                    email: owner_email,
                })

        return res.status(201).json(new_client).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a new client collaborator
const inviteCollaborator = async (req, res, next) => {
    try {
        const {account_id} = req;
        const { email, role_id, client_id, name, custom_message } = req.body;

        if (!email || !role_id || !client_id) return res.status(400).json('Missing fields').send();

        // Validate email 
        const accounts = 
            await models.Account.query()
                .where('email', email);

        if (accounts.length > 0) return res.status(400).json('An account already exists with this email address').send();

        // Get Client id by ClientCollaborator relation
        const client = 
            await models.Client.query()
                .findById(client_id);

        if (!client) return res.status(400).json('Invalid client_id').send(); 

        const client_collaborators =
            await models.ClientCollaborator
                .query()
                .where('client_id', client.id);
            
        // Validate that the Client has remaining collaborators
        if (client.collaborator_limit <= client_collaborators.length) {
            return res.status(401).json(
                `
                All seats are currently occupied.  
                Contact support@boozeboss.co to upgrade your account.
                `
            ).send();
        }

        // Search for the role object
        const role = 
            await models.Role
                .query()
                .where('id', role_id);

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id,
                client_id: client.id,
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

        // Add collaborator invitation
        await models.CollaboratorInvitation.query()
            .insert({ 
                email, role_id, client_id
            })

        // Find the host
        const host = await models.Account.query().findById(account_id);

        // Send invite email
        await clientInviteEmail(email, new_token, role[0], {name, custom_message, host});

        return res.status(201).json(`We sent an invite email to ${email}`).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

/* POST - Add more locations to a client */
const addLocation = async (req, res, next) => {
    try {    
        const {account_id, scope} = req;
        const { client_id } = req.params;
        const { location_id } = req.body;

        // Add client location
        await models.ClientLocations.query()
            .insert({
                location_id, client_id,
            })

        return res.status(200).json('Location successfully created').send()

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }

}

// PATCH 
const editSla = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {client_id} = req.params;
        const {field, value} = req.body;

        if (!client_id) return res.status(400).json('Invalid client');

        await models.Client.query()
                .update({[field]: value})
                .where('id', client_id);
            
        return res.status(200).json('Client successfully updated')
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// PUT - Upload a logo to the client profile
const uploadLogo = async (req, res, next) => {
    try {    
        const {account_id} = req;
        const {client_id} = req.params;
        const {file} = req.files;

        const key = `public/brand_images/${client_id}/${file.name}`

        let params = {
            Key: key,
            Bucket: process.env.BUCKETEER_BUCKET_NAME,
            Body: file.data,
        }

        // Verify client with collaborator
        const collaborator = 
            await models.ClientCollaborator.query()
                        .where('account_id', account_id)
                        .first();

        if (!collaborator) return res.status(400).json('Invalid account').send();
        if (`${collaborator.client_id}` !== client_id) return res.status(400).json('Invalid client').send(); // Parse int to string

        // Upload the image 
        await s3.putObject(params, async (err, data) => {
            if (err) {
                console.log(err, err.stack).send();
                return res.status(400).json('Upload failed').send();
            } else {
                
                await models.Client.query()
                    .update({
                        logo_url: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
                    })
                    .where('id', client_id);

                return res.status(200).json('Logo successfully uploaded').send();
            }
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
} 


const clientController = {
    // Client
    getClients,
    inviteClient,
    inviteCollaborator,
    addLocation,
    editSla, 
    uploadLogo,
}

export default clientController;