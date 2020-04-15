import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

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
        const {created_by, name, contact_name, contact_email, contact_phone_number, address, latitude, longitude} = req.body;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)

        const is_same_client = client_collaborators[0] && client_collaborators[0].client_id === created_by;
        if (!is_same_client && scope !== 'ADMIN') return res.status(401).json("Do you don't have permission to create this venue").send();

        const new_venue =  
            await models.Venue.query()
                .insert({
                    created_by, name, contact_name, contact_email, contact_phone_number, address, latitude, longitude
                }); 

        // Send the clients
        return res.status(201).json('Venue successfully created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}




const venueController = {
    getVenuesByClient,
    createVenue
}

export default venueController;