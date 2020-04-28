import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get a list of venues
const getBrands = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
    
        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send('Invalid account');

        // Search venues by client_id if its a collaborator just return the client_id venues
        const brands =  
            await models.Brand.query()
                .modify((queryBuilder) => {
                    if (scope === 'BRAND') {
                        queryBuilder.where('client_id', collaborator.client_id); 
                    }
                }) 

        // Send the clients
        return res.status(200).send(brands);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Get a list of venues
/* const getVenuesByClient = async (req, res, next) => {
    
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
}*/

// POST - Submit a new venue
const createBrand = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {name, description, client_id, product_type} = req.body;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)

        const is_same_client = client_collaborators[0] && client_collaborators[0].client_id === client_id;
        if (!is_same_client && scope !== 'ADMIN') return res.status(401).json("Do you don't have permission to create this brand").send();

        const new_brand =  
            await models.Brand.query()
                .insert({
                    name, description, client_id, product_type
                }); 

        // Send the clients
        return res.status(201).json('Brand successfully created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


const brandController = {
    getBrands,
    createBrand
}

export default brandController;