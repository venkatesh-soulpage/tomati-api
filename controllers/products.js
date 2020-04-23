import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get a list of venues
const getProducts = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
    
        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send('Invalid account');

        // Search venues by client_id if its a collaborator just return the client_id venues
        const client =  
            await models.Client.query()
                    .findById(collaborator.client_id)
                    .withGraphFetched('[products.[brand]]')                
            

        // Send the clients
        return res.status(200).send(client.products);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Get a list of venues
const createProduct = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
        const {name, brand_id, description, metric, metric_amount, sku, base_price, is_cocktail} = req.body;
    
        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send('Invalid account');

        // Search venues by client_id if its a collaborator just return the client_id venues
        const new_product = 
            await models.Product.query()
                .insert({
                    name, brand_id, description, metric, metric_amount, sku, base_price, is_cocktail
                })              
            

        // Send the clients
        return res.status(200).json(`Product ${name} created successfully`).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const productsController = {
    getProducts,
    createProduct
}

export default productsController;