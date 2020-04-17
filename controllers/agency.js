import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { agencyInviteEmail } from './mailling';

// GET - Get a list of agencies
const getAgencies = async (req, res, next) => {

    try {

    
        // Get Agencies according to scope;
        // ADMIN - All agencies
        // BRAND - Only agencies registered under brand 
        // AGENCY - Only my agency
        let agencies;
        if (req.scope === 'ADMIN') {

            agencies = 
                await models.Agency.query()
                    .withGraphFetched('[owner, client, agency_collaborators.[account, role]]')
                    .modifyGraph('agency_collaborators', builder => {
                        builder.select('id');
                    });

        } else if (req.scope === 'BRAND') {

            let client_collaborator = 
                await models.ClientCollaborator.query()
                    .where('account_id', req.account_id);;

            agencies = 
                await models.Agency.query()
                    .where('invited_by', client_collaborator[0].client_id)
                    .withGraphFetched('[owner, client, agency_collaborators.[account, role]]')
                    .modifyGraph('agency_collaborators', builder => {
                        builder.select('id');
                    });

        } else if (req.scope === 'AGENCY') {

            let agency_collaborator = 
                await models.AgencyCollaborator.query()
                    .where('account_id', req.account_id);;

            agencies = 
                await models.Agency.query()
                    .where('id', agency_collaborator[0].agency_id)
                    .withGraphFetched('[owner, client, agency_collaborators.[account, role]]')
                    .modifyGraph('agency_collaborators', builder => {
                        builder.select('id');
                    });
        }

        if (!agencies) return res.status(400).json('Invalid').send();

        // Send the clients */
        return res.status(200).send(agencies);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// Invite Agency
const inviteAgency = async (req, res, next) => {
    try {
        /* Todo add client organization logic */
        const { name, description, owner_email } = req.body;
        let {client_id} = req.body;

        // If there isn't a client_id use the token
        if (!client_id) {
            // Get the Brand of the client
            const client_collaborator = 
                await models.ClientCollaborator.query()
                    .where('account_id', req.account_id);
        
            client_id = client_collaborator[0].client_id
        }

        if (!client_id) return res.status(400).json('No client_id').send();
        
        // Create client
        const agency = 
            await models.Agency.query()
                .insert({
                    name, 
                    description, 
                    contact_email: owner_email,
                    invited_by: client_id,
                })

        // Create new token to validate owner email
        const role = 
                await models.Role.query()
                    .where('scope', 'AGENCY')
                    .where('name', 'OWNER');
        

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id: role[0].id,
                agency_id: agency.id,
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
        await agencyInviteEmail(owner_email, new_token, {scope: 'AGENCY', name: 'OWNER'});

        return res.status(201).json(agency).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a new client collaborator
const inviteCollaborator = async (req, res, next) => {
    try {
        
        const { email, role_id, agency_id } = req.body;

        if (!email || !role_id || !agency_id) return res.status(400).json('Missing fields').send();

        // Get Client id by ClientCollaborator relation
        const agency = 
            await models.Agency.query()
                .findById(agency_id);

        if (!agency) return res.status(400).json('Invalid agency_id').send(); 

        const agency_collaborators =
            await models.AgencyCollaborator
                .query()
                .where('agency_id', agency.id);
            
        // Validate that the Agency has remaining collaborators
        // if (client.collaborator_limit <= client_collaborators.length) return res.status(401).json('You had exceed your collaborators limit').send();

        // Search for the role object
        const role = 
            await models.Role
                .query()
                .where('id', role_id);

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id,
                agency_id: agency.id,
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
        await agencyInviteEmail(email, new_token, role[0]);

        return res.status(201).json(`We sent an invite email to ${email}`).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


const agencyController = {
    // Client
    getAgencies,
    inviteAgency,
    inviteCollaborator
}

export default agencyController;