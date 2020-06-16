import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

import { organizationInviteEmail } from './mailling'; 
 
const getOrganizations = async (req, res, next) => {
    try {
        const {account_id, scope, role} = req;

        // Validate that the user is either a regional collaborator or admin
        const collaborator = 
                await models.Collaborator.query()   
                        .withGraphFetched('organization')
                        .where('account_id', account_id)
                        .first();
            
        if (!collaborator && scope !== 'ADMIN') return res.status(400).json("Invalid collaborator").send();
            
        // Fetch organizations
        const organizations = 
            await models.RegionalOrganization.query()
                    .withGraphFetched(`[
                        clients,
                        collaborators.[
                            account, 
                            role
                        ],
                        collaborator_invitations.[
                            role
                        ]
                        locations.[
                            location.[
                                childrens
                            ]
                        ]
                    ]`)
                    .modify((queryBuilder) => {
                        // If the user is only a region owner only show the current region
                        if (scope === 'REGION') {
                            queryBuilder.where('id', collaborator.organization.id); 
                        }
                    }) 

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
            name, description, owner_email, locations_limit, selected_locations, display_name, custom_message, expiration_date
        } = req.body;

        // Validate that the client hasn't been registered on the platform
        const client_account = await models.Account.query().where('email', owner_email).first();
        if (client_account) return res.status(400).json('The owner email is already registered.').send();

        // Create client
        const organization = 
            await models.RegionalOrganization.query()
                .insert({
                    name, description, contact_email: owner_email, locations_limit, expiration_date
                })

        // Create client locations
        // Validate that there are locations
        const locations = selected_locations.map((selected, index) => {
            const is_primary_location = index < 1;
            return {
                location_id: selected.id,
                regional_organization_id: organization.id,
                is_primary_location
            }
        });

        if (locations.length > 0) {
            await models.RegionalOrganizationLocation
                .query()
                .insert(locations);
        }

        // Create new token to validate owner email
        const role = 
                await models.Role.query()
                    .where('scope', 'REGION')
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
        const host = {first_name: 'Booze Boss', last_name: 'Team'};
        await organizationInviteEmail(owner_email, new_token, {scope: 'REGION', name: 'OWNER'}, {name: display_name, custom_message, host});
            
        // Add collaborator invitation
        let invitation_expiration_date = new Date();
        invitation_expiration_date.setHours(invitation_expiration_date.getHours() + 1); // Default expiration time to 1 hour.
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


// PUT - Change primary location
const changePrimaryLocation = async (req, res, next) => {
    try {
        const {account_id, scope} = req;
        const {regional_organization_id} = req.params;
        const {regional_organization_location_id} = req.body;

        // Validate roles
        const collaborator = 
            await models.Collaborator.query()
                    .withGraphFetched('organization')
                    .where('account_id', account_id)
                    .first();

        if (!collaborator && scope !== 'ADMIN') return res.status(400).json('Invalid Role').send();
        if (collaborator && collaborator.organization && collaborator.organization.id !== Number(regional_organization_id)) return res.status(400).json('Invalid Organization').send();

        // Set all locations to false
        await models.RegionalOrganizationLocation.query()
                .where('regional_organization_id', regional_organization_id)
                .update({is_primary_location: false});

        // Change primary location
        await models.RegionalOrganizationLocation.query()
                .update({is_primary_location: true})
                .where('id', regional_organization_location_id);

        return res.status(200).json('Primary location changed successfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}



const regionalOrganizationController = {
    getOrganizations,
    inviteOrganization,
    changePrimaryLocation
}

export default regionalOrganizationController;