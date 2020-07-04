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
                    })
                    .modifyGraph('collaborator_invitations', builder => {
                        builder.where('collaborator_invitations.expiration_date', '>', new Date())
                    }) 
                    .orderBy('name', 'ASC');;

        } else if (req.scope === 'REGION') {

            let collaborator = 
                await models.Collaborator.query()
                    .withGraphFetched(`[
                        organization.[
                            clients
                        ]
                    ]`)
                    .where('account_id', req.account_id)
                    .first();
                
            const clients_ids = collaborator.organization.clients.map(client => client.id);

            agencies = 
                await models.Agency.query()
                    .whereIn('invited_by', clients_ids)
                    .withGraphFetched(query)
                    .modifyGraph('agency_collaborators', builder => {
                        builder.select('id');
                    })
                    .modifyGraph('collaborator_invitations', builder => {
                        builder.where('collaborator_invitations.expiration_date', '>', new Date())
                    }) 
                    .orderBy('name', 'ASC');
        } 
        else if (req.scope === 'BRAND') {

            let client_collaborator = 
                await models.ClientCollaborator.query()
                    .where('account_id', req.account_id);;

            agencies = 
                await models.Agency.query()
                    .where('invited_by', client_collaborator[0].client_id)
                    .withGraphFetched(query)
                    .modifyGraph('agency_collaborators', builder => {
                        builder.select('id');
                    })
                    .modifyGraph('collaborator_invitations', builder => {
                        builder.where('collaborator_invitations.expiration_date', '>', new Date())
                    }) 
                    .orderBy('name', 'ASC');

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
                    })
                    .modifyGraph('collaborator_invitations', builder => {
                        builder.where('collaborator_invitations.expiration_date', '>', new Date())
                    }) 
                    .orderBy('name', 'ASC');
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
        const { name, description, owner_email, sla_terms, sla_hours_before_event_creation,  sla_hours_before_event_update, display_name, custom_message } = req.body;

        const collaborator = 
            await models.ClientCollaborator.query()
                .withGraphFetched('[client.[warehouses, agencies], account]')
                .where('account_id', req.account_id)
                .first();

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
        let invitation_expiration_date = new Date();
        invitation_expiration_date.setHours(invitation_expiration_date.getHours() + 1); // Default expiration time to 1 hour.
        await models.CollaboratorInvitation.query()
                .insert({ 
                    agency_id: agency.id,
                    role_id: role[0].id,
                    email: owner_email,
                    expiration_date: invitation_expiration_date,
                })

        const host = collaborator && collaborator.account ? collaborator.account : {first_name: 'Booze Boss', last_name: 'Team'};
        // TODO send invite email
        await agencyInviteEmail(owner_email, new_token, {scope: 'AGENCY', name: 'OWNER'}, {display_name, custom_message, host});

        return res.status(201).json(agency).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a new client collaborator
const inviteCollaborator = async (req, res, next) => {
    try {
        const {account_id} = req;
        const { email, role_id, agency_id, name, custom_message } = req.body;

        if (!email || !role_id || !agency_id) return res.status(400).json('Missing fields').send();

        // Validate email 
        const accounts = 
            await models.Account.query()
                .where('email', email);
    
        if (accounts.length > 0) return res.status(400).json('An account already exists with this email address').send();

        // Validate that there isn't an existing invitation.
        const invitation = 
            await models.CollaboratorInvitation.query()
                    .where('email', email)
                    .where('expiration_date', '>', new Date())
                    .first();

        if (invitation) return res.status(400).json('A pending invitation already exists with this email').send();


        // Get Client id by ClientCollaborator relation
        const agency = 
            await models.Agency.query()
                .withGraphFetched(`[
                    collaborator_invitations, 
                    agency_collaborators,
                ]`)
                .modifyGraph('collaborator_invitations', builder => {
                    builder.where('collaborator_invitations.expiration_date', '>', new Date())
                }) 
                .findById(agency_id);

        if (!agency) return res.status(400).json('Invalid agency_id').send(); 

        const agency_collaborator =
            await models.AgencyCollaborator
                .query()
                .withGraphFetched('[client, agency.[agency_collaborators]]')
                .where('agency_id', agency.id)
                .first();

        // Spaces left condition
        const invites_left = agency.collaborator_invitations.filter(invite => invite.status === 'PENDING');
        const space_occupied = agency.agency_collaborators.length + invites_left.length;

        // Validate that the Agency has remaining collaborators
        if (agency_collaborator.client.agency_collaborators_limit <= space_occupied) return res.status(401).json(
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
        
        let expiration_date = new Date();
        expiration_date.setHours(expiration_date.getHours() + 1); // Default expiration time to 1 hour.

        await models.CollaboratorInvitation.query()
                .insert({
                    email, role_id, agency_id, expiration_date
                })

        const host = await models.Account.query().findById(account_id);

        // Send invite email
        await agencyInviteEmail(email, new_token, role[0], {name, custom_message, host});

        return res.status(201).json(`We sent an invite email to ${email}`).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// PUT - Revoke collaborator invitations 
const revokeCollaboratorInvite = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {collaborator_invitation_id} = req.params;

        // Validate collaborator id 
        const agency_collaborator = 
                await models.AgencyCollaborator.query()
                        .where('account_id', account_id)
                        .first();
            
        if (!agency_collaborator) return res.status(400).json('Invalid collaborator id').send();
        
        const collaborator_invitation =
                await models.CollaboratorInvitation.query()
                        .findById(collaborator_invitation_id);

        if (!collaborator_invitation) return res.status(400).json('Invalid invitation id').send();

        if (collaborator_invitation.agency_id !== agency_collaborator.agency_id) return res.status(400).json("You're not allowed to do this").send();
        
        await models.CollaboratorInvitation.query()
                .deleteById(collaborator_invitation_id);

        return res.status(201).json('Invitation correctly revoked').send();

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
    inviteCollaborator, 
    revokeCollaboratorInvite
}

export default agencyController;