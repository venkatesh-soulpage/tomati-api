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

        const query = `
            [
                owner,
                client,
                agency_collaborators.[
                    account, 
                    role
                ],
                collaborator_invitations.[
                    role
                ]
            ]
        `
    
        // Get Agencies according to scope;
        // ADMIN - All agencies
        // BRAND - Only agencies registered under brand 
        // AGENCY - Only my agency
        let agencies;
        if (req.scope === 'ADMIN') {

            agencies = 
                await models.Agency.query()
                    .withGraphFetched(query)
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
                    .withGraphFetched(query)
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
                    .withGraphFetched(query)
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

const getAgencySla = async (req, res, next) => {
    try {

        const {agency_id} = req.params; 
        
        const agency = 
            await models.Agency.query()
                .findById(agency_id);

        if (!agency) return res.status(400).json('Invalid agency');

        const sla = {
            sla_terms: agency.sla_terms,
            sla_hours_before_event_creation: agency.sla_hours_before_event_creation,
            sla_hours_before_event_update: agency.sla_hours_before_event_update,
        }

        return res.status(200).send(sla);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// Invite Agency
const inviteAgency = async (req, res, next) => {
    try {
        /* Todo add client organization logic */
        const { name, description, owner_email, sla_terms, sla_hours_before_event_creation,  sla_hours_before_event_update } = req.body;

        const client_collaborators = 
            await models.ClientCollaborator.query()
                .withGraphFetched('[client.[warehouses, agencies]]')
                .where('account_id', req.account_id);

        const collaborator = client_collaborators[0];

        // Validate client
        if (!collaborator) return res.status(400).json('Invalid client').send();

        // Validate limits
        if (collaborator.client.agencies_limit <= collaborator.client.agencies.length) {
            return res.status(400).json(
                `
                    Maximum number of agencies have been added. Contact ; support@boozeboss.co  to upgrade your account.
                `
            ).send();
        }
        
        // Create client
        const agency = 
            await models.Agency.query()
                .insert({
                    name, 
                    description, 
                    contact_email: owner_email,
                    invited_by: collaborator.client_id,
                    sla_terms, 
                    sla_hours_before_event_creation,  
                    sla_hours_before_event_update,
                    sla_accepted: false
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

        // Create agency collaborator invitation
        await models.CollaboratorInvitation.query()
                .insert({ 
                    agency_id: agency.id,
                    role_id: role[0].id,
                    email: owner_email
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

        // Validate email 
        const accounts = 
            await models.Account.query()
                .where('email', email);
    
        if (accounts.length > 0) return res.status(400).json('An account already exists with this email address').send();

        // Get Client id by ClientCollaborator relation
        const agency = 
            await models.Agency.query()
                .findById(agency_id);

        if (!agency) return res.status(400).json('Invalid agency_id').send(); 

        const agency_collaborators =
            await models.AgencyCollaborator
                .query()
                .withGraphFetched('[client, agency.[agency_collaborators]]')
                .where('agency_id', agency.id);
            
        // Validate that the Agency has remaining collaborators
        if (agency_collaborators[0].client.agency_collaborators_limit <= agency_collaborators[0].agency.agency_collaborators.length) return res.status(401).json(
            `
                Maximum number of collaborators have been added. Contact ; support@boozeboss.co  to upgrade your account.
            `
        ).send();

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

        await models.CollaboratorInvitation.query()
                .insert({
                    email, role_id, agency_id
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
    getAgencySla,
    inviteAgency,
    inviteCollaborator
}

export default agencyController;