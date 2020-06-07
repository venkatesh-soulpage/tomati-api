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

        let brands;
        if (scope === 'BRAND') {
            // Validate the account is a client collaborator
            const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
            const collaborator = client_collaborators[0];
            if (!collaborator) return res.status(400).send('Invalid account');

            // Search venues by client_id if its a collaborator just return the client_id venues
            brands =  
                await models.Brand.query()
                    .modify((queryBuilder) => {
                        if (scope === 'BRAND') {
                            queryBuilder.where('client_id', collaborator.client_id); 
                        }
                    }) 
        }

        if (scope === 'AGENCY') {
            // Validate the account is a client collaborator
            const agency_collaborators = 
            await models.AgencyCollaborator.query()
                .withGraphFetched('client')
                .where('account_id', account_id)
            
            const collaborator = agency_collaborators[0];
            if (!collaborator) return res.status(400).send('Invalid account');

            // Search venues by client_id if its a collaborator just return the client_id venues
            brands =  
                await models.Brand.query()
                    .modify((queryBuilder) => {
                        if (scope === 'AGENCY') {
                            queryBuilder.where('client_id', collaborator.client.id); 
                        }
                    }) 
        }

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
        const {name, description, client_id, product_type, product_subtype} = req.body;

        // Validate the account is a client collaborator
        const client_collaborator = 
            await models.ClientCollaborator.query()
                .withGraphFetched(`[
                    client.[
                        brands
                    ]
                ]`)
                .where('account_id', account_id)
                .first();

        const is_same_client = client_collaborator && client_collaborator.client_id === client_id;
        if (!is_same_client && scope !== 'ADMIN') return res.status(401).json("Do you don't have permission to create this brand").send();
        if (client_collaborator.client.brands_limit >= client_collaborator.client.brands.length) return res.status(400).json('Limit reached please contact support@boozeboss.co to upgrade your account');

        const new_brand =  
            await models.Brand.query()
                .insert({
                    name, description, client_id, product_type, product_subtype
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