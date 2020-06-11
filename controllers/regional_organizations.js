import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

import { organizationInviteEmail } from './mailling'; 
 
const getOrganizations = async (req, res, next) => {
    try {

        const organizations = await models.RegionalOrganization.query();

        return res.status(201).json(organizations).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a new regional organization
const inviteOrganization = async (req, res, next) => {
    try {
        /* Todo add client organization logic */
        const {
            name, description, owner_email, locations_limit, selected_locations, name, custom_message, 
        } = req.body;

        // Validate that the client hasn't been registered on the platform
        const client_account = await models.Account.query().where('email', owner_email).first();
        if (client_account) return res.status(400).json('The owner email is already registered.').send();

        // Create client
        const organization = 
            await models.RegionalOrganization.query()
                .insert({
                    name, description, owner_email, locations_limit
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
                    .where('scope', 'REGIONAL')
                    .where('name', 'OWNER')
                    .first();
        

        // Sign jwt
        const token = await jwt.sign(
            {  
                role_id: role.id,
                regional_organization_id: organization.id,
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
        const host = 'Booze Boss Team';
        await organizationInviteEmail(owner_email, new_token, {scope: 'REGIONAL', name: 'OWNER'}, {name, custom_message, host});
            
        // Add collaborator invitation
        let invitation_expiration_date = new Date();
        invitation_expiration_date.setHours(expiration_date.getHours() + 1); // Default expiration time to 1 hour.
        await models.CollaboratorInvitation.query()
                .insert({ 
                    regional_organization_id: organization.id, 
                    role_id: role.id,
                    email: owner_email,
                    expiration_date: invitation_expiration_date
                })

        return res.status(201).json('Organization successfully created and invited. Waiting for signup').send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}




const regionalOrganizationController = {
    getOrganizations,
    inviteOrganization
}

export default regionalOrganizationController;