import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get a list of venues
const getVenues = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
    
        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send('Invalid account');

        // Search venues by client_id if its a collaborator just return the client_id venues
        const venues =  
            await models.Venue.query()
                .modify((queryBuilder) => {
                    if (scope === 'BRAND') {
                        queryBuilder.where('created_by', collaborator.client_id); 
                    }
                }) 

        // Send the clients
        return res.status(200).send(venues);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Get a list of venues
const getVenuesByClient = async (req, res, next) => {
    
    try {    
        const {client_id} = req.params;

        const venues =  
            await models.Venue.query()
                .where('created_by', client_id); 

        // Send the clients
        return res.status(200).json(venues).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Submit a new venue
const createVenue = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {created_by, name, contact_name, contact_email, contact_phone_number, address, latitude, longitude, location_id} = req.body;

        // Validate the account is a client collaborator
        const collaborator = 
            await models.Collaborator.query()
                    .withGraphFetched(`[
                        organization.[
                            clients
                        ],
                        client
                    ]`)
                    .where('account_id', account_id)
                    .first();

        // Validate that the user has permission to do this
        // Valildate if is a client collaborator
        if (collaborator.client && collaborator.client.id !== created_by) return res.status(400).json('Invalid collaborator').send();
        // Validate if is a organization collaborator
        if (collaborator.organization ) {
            const clients = collaborator.organization.clients.map(client => client.id);
            if (clients.indexOf(created_by) < 0) return res.status(400).json('Invalid team').send();
        }

        const new_venue =  
            await models.Venue.query()
                .insert({
                    created_by, name, contact_name, contact_email, contact_phone_number, address, latitude, longitude, location_id
                }); 

        // Send the clients
        return res.status(201).json('Venue successfully created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Delete a venue
const deleteVenue = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {venue_id} = req.params;

        // Validate that the venue exists
        const venue = await models.Venue.query().findById(venue_id);
        if (!venue) return res.status(400).json('Invalid venue').send();
        
        // Validate the account is a client collaborator
        // Validate the account is a client collaborator
        const collaborator = 
            await models.Collaborator.query()
                    .withGraphFetched(`[
                        organization.[
                            clients
                        ],
                        client
                    ]`)
                    .where('account_id', account_id)
                    .first();

        // Validate that the user has permission to do this
        // Valildate if is a client collaborator
        if (collaborator.client && collaborator.client.id !== venue.created_by) return res.status(400).json('Invalid collaborator').send();
        // Validate if is a organization collaborator
        if (collaborator.organization ) {
            const clients = collaborator.organization.clients.map(client => client.id);
            if (clients.indexOf(venue.created_by) < 0) return res.status(400).json('Invalid team').send();
        }

        await models.Venue.query().deleteById(venue_id);

        // Send the clients
        return res.status(200).json('Venue successfully deleted').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}




const venueController = {
    getVenues,
    getVenuesByClient,
    createVenue,
    deleteVenue
}

export default venueController;