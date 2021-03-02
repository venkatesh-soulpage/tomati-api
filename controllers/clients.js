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
            location, 
            venues.[
                location
            ], 
            brands, 
            warehouses.[
                location
            ], 
            client_collaborators.[
                account.[
                    wallet
                ], 
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
                    .modifyGraph('collaborator_invitations', builder => {
                        builder.where('collaborator_invitations.expiration_date', '>', new Date())
                    }) 
                    .select([
                        'clients.*',
                        models.Client.relatedQuery('verification_logs').count().as('total_verifications'),
                    ])
                    .orderBy('name', 'ASC');
        } else {
            // Get Client id by Collaborator
            const collaborator = 
                await models.Collaborator
                    .query()
                    .where('account_id', account_id)
                    .withGraphFetched('[client, organization]')
                    .first()
                        
                clients =
                    await models.Client.query()
                        .withGraphFetched(query)
                        .modify(builder => {
                            // Filter for organization teams
                            if (collaborator.organization) {
                                builder.where('regional_organization_id', collaborator.organization.id);
                            }
                            // Filter for team
                            if (collaborator.client) {
                                builder.where('id', collaborator.client.id)
                            }
                        })
                        .modifyGraph('client_collaborators', builder => {
                            builder.select('id');
                        }) 
                        .select([
                            'clients.*',
                            models.Client.relatedQuery('verification_logs').count().as('total_verifications'),
                        ])
                        .orderBy('name', 'ASC');
        }   
        
        // Send the clients
        return res.status(201).send(clients);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Create a new client organization and send an email to the client
const inviteClient = async (req, res, next) => {
    try {
        /* Todo add client organization logic */
        const { account_id, scope} = req;

        const {
            name, description, owner_email, display_name, custom_message,
            collaborator_limit, briefs_limit, brands_limit, warehouses_limit,
            identity_verifications_limit, agencies_limit, agency_collaborators_limit, location_id, expiration_date
        } = req.body;

        // Validate that the client hasn't been registered on the platform
        const client_account = await models.Account.query().where('email', owner_email).first();
        if (client_account) return res.status(400).json('The owner email is already registered.').send();

        // Check if it is a regional organization team
        const collaborator = 
                await models.Collaborator
                    .query()
                    .where('account_id', account_id)
                    .withGraphFetched('[organization, account]')
                    .first();

        // If its invited by a regional owner assign the correct id
        const regional_organization_id = collaborator && collaborator.organization && collaborator.organization.id;
        const client_expiration_date = collaborator && collaborator.organization ? collaborator.organization.expiration_date : expiration_date;


        // Validate that there isn't another client on the same location 1 client = 1 country
        const same_location_client =
            await models.Client.query()
                    .where({
                        regional_organization_id,
                        location_id
                    })
                    .first();
        
        if (same_location_client) return res.status(400).json('You already have a team on this country location.').send();

        // Create client
        const client = 
            await models.Client.query()
                .insert({
                    name, 
                    description, 
                    contact_email: owner_email,
                    collaborator_limit: collaborator && collaborator.organization ? collaborator.organization.collaborator_limit : collaborator_limit, 
                    briefs_limit: collaborator && collaborator.organization ? collaborator.organization.briefs_limit : briefs_limit,  
                    brands_limit: collaborator && collaborator.organization ? collaborator.organization.brands_limit : brands_limit,  
                    warehouses_limit: collaborator && collaborator.organization ? collaborator.organization.warehouses_limit : warehouses_limit, 
                    locations_limit: 1,
                    location_id,
                    identity_verifications_limit: collaborator && collaborator.organization ? collaborator.organization.identity_verifications_limit : identity_verifications_limit, 
                    agencies_limit: collaborator && collaborator.organization ? collaborator.organization.agencies_limit : agencies_limit, 
                    agency_collaborators_limit: collaborator && collaborator.organization ? collaborator.organization.agency_collaborators_limit : agency_collaborators_limit, 
                    expiration_date: client_expiration_date,
                    regional_organization_id, 
                })

        // Create new token to validate owner email
        const role = 
                await models.Role.query()
                    .where('scope', 'BRAND')
                    .where('name', 'OWNER')
                    .first();
        

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id: role.id,
                client_id: client.id,
                scope: role.scope,
                name: role.name
            }, 
            process.env.SECRET_KEY,
        );

        const new_token = 
            await models.Token.query().insert({
                email: owner_email,
                token,
            })

        // send invite email
        const host = collaborator && collaborator.account ? collaborator.account : {first_name: 'Booze Boss', last_name: 'Team'};
        await clientInviteEmail(owner_email, new_token, {scope: 'BRAND', name: 'OWNER'}, {display_name, custom_message, host, client});

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
        let invitation_expiration_date = new Date();
        invitation_expiration_date.setHours(invitation_expiration_date.getHours() + 1); // Default expiration time to 1 hour.
        await models.CollaboratorInvitation.query()
                .insert({ 
                    client_id: new_client.id, 
                    role_id: role.id,
                    email: owner_email,
                    expiration_date: invitation_expiration_date
                })

        return res.status(201).json('Client successfully created and invited. Waiting for signup').send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a new client collaborator
const inviteCollaborator = async (req, res, next) => {
    try {
        const {account_id} = req;
        const { email, role_id, client_id, display_name, custom_message } = req.body;

        if (!email || !role_id || !client_id) return res.status(400).json('Missing fields').send();

        // Validate email 
        const account = 
            await models.Account.query()
                .withGraphFetched('collaborator')
                .where('email', email)
                .first();

        if (account) return res.status(400).json('An account already exists with this email address').send();

        // Validate that there isn't an existing invitation.
        const invitation = 
            await models.CollaboratorInvitation.query()
                    .where('email', email)
                    .where('expiration_date', '>', new Date())
                    .first();

        if (invitation) return res.status(400).json('A pending invitation already exists with this email').send();

        // Get Client id by ClientCollaborator relation
        const client = 
            await models.Client.query()
                .withGraphFetched(`[
                    client_collaborators,
                    collaborator_invitations
                ]`)
                .modifyGraph('collaborator_invitations', builder => {
                    builder.where('collaborator_invitations.expiration_date', '>', new Date())
                }) 
                .findById(client_id);
        

        if (!client) return res.status(400).json('Invalid client_id').send(); 

        // Spaces left condition
        const invites_left = client.collaborator_invitations.filter(invite => invite.status === 'PENDING');
        const space_occupied = client.client_collaborators.length + invites_left.length;
        
        // Validate that the Client has remaining collaborators
        if (client.collaborator_limit <= space_occupied) {
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
                .where('id', role_id)
                .first();

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id,
                client_id: client.id,
                scope: role.scope,
                name: role.name
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

        let expiration_date = new Date();
        expiration_date.setHours(expiration_date.getHours() + 1); // Default expiration time to 1 hour.

        // Add collaborator invitation
        await models.CollaboratorInvitation.query()
            .insert({ 
                email, role_id, client_id,
                expiration_date,
            })

        // Find the host
        const host = await models.Account.query().findById(account_id);

        // Send invite email
        await clientInviteEmail(email, new_token, role, {name: display_name, custom_message, host, client});

        return res.status(201).json(`We sent an invite email to ${email}`).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// PUT - Revoke collaborator invitations 
const revokeCollaboratorInvite = async (req, res, next) => {
    try {
        const {account_id, scope} = req;
        const {collaborator_invitation_id} = req.params;

        // Validate collaborator id 
        const collaborator = 
                await models.Collaborator.query()
                        .where('account_id', account_id)
                        .first();
            
        if (!collaborator && scope !== 'ADMIN') return res.status(400).json('Invalid collaborator id').send();
        
        const collaborator_invitation =
                await models.CollaboratorInvitation.query()
                        .findById(Number(collaborator_invitation_id));

        if (!collaborator_invitation) return res.status(400).json('Invalid invitation id').send();

        if (scope !== 'ADMIN' && collaborator && collaborator_invitation.client_id !== collaborator.client_id) return res.status(400).json("You're not allowed to do this").send();
        
        await models.CollaboratorInvitation.query()
                .deleteById(collaborator_invitation_id);

        return res.status(201).json('Invitation correctly revoked').send();

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

        // Validate locations
        const collaborator =
            await models.ClientCollaborator.query()
                .withGraphFetched(`[
                    client.[
                        locations
                    ]
                ]`)
                .first();

        if (collaborator.client.locations_limit >= collaborator.client.locations.length ) return res.status(400).json('Limit reached. Please contact support@boozeboss.co to increase your limit').send();

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
    revokeCollaboratorInvite,
    addLocation,
    editSla, 
    uploadLogo,
}

export default clientController;