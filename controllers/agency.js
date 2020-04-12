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

        // Get the Brand of the client
        let client_collaborator = 
            await models.ClientCollaborator.query()
                .where('account_id', req.account_id);;


        const is_admin = (req.scope === 'ADMIN' && req.role === 'ADMIN');

        // If there isn't any brand collaborators and the user isn't admin return
        if (!client_collaborator[0] && !is_admin) return res.status(400).send({msg: 'Brand Collaborator does not exist'});
    
        // Get Client agencies by invited role or all if not admin
        let brands;
        if (is_admin) {
            brands = 
            await models.Agency.query()
                .withGraphFetched('[owner, client, agency_collaborators.[account, role]]')
                .modifyGraph('agency_collaborators', builder => {
                    builder.select('id');
                });
        } else {
            brands = 
                await models.Agency.query()
                    .where('invited_by', client_collaborator[0].client_id)
                    .withGraphFetched('[owner, client, agency_collaborators.[account, role]]')
                    .modifyGraph('agency_collaborators', builder => {
                        builder.select('id');
                    });
        }

        // Send the clients */
        return res.status(201).json(brands).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Create a new Agency organization and send an email to the owner
const inviteAgency = async (req, res, next) => {
    try {
        // Todo add client organization logic 
        const {name, description, owner_email} = req.body;

        // Get the Brand of the client
        const client_collaborator = 
            await models.ClientCollaborator.query()
                .where('account_id', req.account_id);

        // Create Agency
        const agency = 
            await models.Agency.query()
                .insert({
                    name, 
                    description, 
                    invited_by: client_collaborator[0].client_id,
                    contact_email: owner_email,
                })

        // Create new token to validate owner email
        const new_token = 
            await models.Token.query().insert({
                email: owner_email,
                token: crypto.randomBytes(16).toString('hex')
            })

        // TODO send invite email
        await agencyInviteEmail(owner_email, new_token);

        return res.status(201).json(agency).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const agencyController = {
    // Client
    getAgencies,
    inviteAgency
}

export default agencyController;