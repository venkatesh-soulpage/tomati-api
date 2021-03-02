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
        let client;

        if (scope === 'REGION') {
            const collaborator = 
                await models.Collaborator.query()
                    .withGraphFetched(`[
                        account,
                        organization.[
                            clients
                        ]
                    ]`)
                    .where('account_id', account_id)
                    .first();
                
            if (!collaborator) return res.status(400).send('Invalid account');

            const location_client = 
                collaborator.organization.clients.find(client => collaborator.account.location_id === client.location_id);

            client =
                await models.Client.query()
                    .findById(location_client ? location_client.id : 0)
                    .withGraphFetched(`[
                        products.[
                            brand, 
                            stocks, 
                            ingredients.[
                                product
                            ]
                        ]
                    ]`);   

            if (!client) return res.status(200).send([]);
        }

        if (scope === 'BRAND') {
            const client_collaborators = 
                await models.ClientCollaborator.query()
                    .where('account_id', account_id)
                
            const collaborator = client_collaborators[0];
            if (!collaborator) return res.status(400).send('Invalid account');

            // Search venues by client_id if its a collaborator just return the client_id venues
            client =  
                await models.Client.query()
                        .findById(collaborator.client_id)
                        .withGraphFetched('[products.[brand, stocks]]')       
        }
            
        if (scope === 'AGENCY') {
            const agency_collaborators = 
                await models.AgencyCollaborator.query()
                    .withGraphFetched('client')
                    .where('account_id', account_id); 

            const collaborator = agency_collaborators[0];
            if (!collaborator) return res.status(400).send('Invalid account');
        
        
            client = 
                await models.Client.query()
                    .findById(collaborator.client.id)
                    .withGraphFetched(`[
                        products.[
                            brand, 
                            stocks, 
                            ingredients.[
                                product
                            ]
                        ]
                    ]`);   
        }
            

        // Send the clientss
        return res.status(200).send(client.products);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


const getClientProducts = async (req, res, next) => {
    try {
        const {account_id, scope} = req;
        // const {client_id} = req.params;

        let collaborator;
        if (scope === 'AGENCY') {
            const agency_collaborators =
            await models.AgencyCollaborator.query()
               .withGraphFetched('[client]')
               .where('account_id', account_id)

            // Validate collaborator
            if (!agency_collaborators || agency_collaborators.length < 1) return res.status(400).json('Invalid collaborator').send();
            collaborator = agency_collaborators[0]; 
        }

        if (scope === 'BRAND') {
            const client_collaborators =
            await models.ClientCollaborator.query()
                .withGraphFetched('[client]')
               .where('account_id', account_id)

            // Validate collaborator
            if (!client_collaborators || client_collaborators.length < 1) return res.status(400).json('Invalid collaborator').send();
            collaborator = client_collaborators[0]; 
        }

        if (scope === 'REGION') {
            collaborator = 
                await models.Collaborator.query()
                    .withGraphFetched(`[
                        organization.[
                            clients
                        ]
                    ]`)
                    .where('account_id', account_id)
                    .first();
                
            if (!collaborator) return res.status(400).send('Invalid account');
        }

        // Validate client
        // if (`${collaborator.client.id}` !== client_id) return res.status(400).json("You don't have access to this client").send();

        const products = 
            await models.Product.query()
                .withGraphFetched('[ingredients.[product], brand]')
                .modify(queryBuilder => {
                    if (scope === 'AGENCY') {
                        queryBuilder.where('client_id', collaborator.client.id);
                    }
                    if (scope === 'BRAND') {
                        queryBuilder.where('client_id', collaborator.client.id);
                    }
                    if (scope === 'REGION') {
                        console.log()
                        queryBuilder.where('client_id', collaborator.organization.clients[0].id);
                    }
                });

        return res.status(200).send(products);


    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Get a list of venues
const createProduct = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
        const {name, brand_id, description, metric, metric_amount, sku, base_price, is_cocktail, cocktail_ingredients, product_type, product_subtype} = req.body;
    
        // Validate the account is a client collaborator
        let collaborator;

        if (scope === 'BRAND') {
            const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
            collaborator = client_collaborators[0];
        }
        
        if (scope === 'AGENCY') {
            const agency_collaborators = 
                await models.AgencyCollaborator.query()
                    .withGraphFetched('client')
                    .where('account_id', account_id);

            collaborator = agency_collaborators[0];
        }

        if (!collaborator) return res.status(400).send('Invalid account');

        // Search venues by client_id if its a collaborator just return the client_id venues
        const new_product = 
            await models.Product.query()
                .insert({
                    client_id: collaborator.client ? collaborator.client.id : collaborator.client_id,
                    name, brand_id, description, metric, metric_amount, sku, base_price, is_cocktail, product_type, product_subtype
                })              

        // If its cocktail save the cocktail ingredients
        if (is_cocktail && cocktail_ingredients) {
            const ingredients = cocktail_ingredients.map(ingredient => {
                return {
                    product_parent_id: new_product.id,
                    ...ingredient
                }
            })
            await models.ProductIngredient
                .query()
                .insert(ingredients);
        }
            

        // Send the clients
        return res.status(200).json(`Product ${name} created successfully`).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// UPDATE - Update product
const updateProduct = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
        const { product_id } = req.params;
        const {name, description, metric, metric_amount, sku, base_price } = req.body;
    
        // Validate the account is a client collaborator
        let collaborator;

        if (scope === 'BRAND') {
            const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)
            
            collaborator = client_collaborators[0];
        }
        
        if (scope === 'AGENCY') {
            const agency_collaborators = 
                await models.AgencyCollaborator.query()
                    .withGraphFetched('client')
                    .where('account_id', account_id);

            collaborator = agency_collaborators[0];
        }

        if (!collaborator) return res.status(400).send('Invalid account');
            

        const product =
            await models.Product.query().findById(product_id);
        
        // alidate product
        if (!product) return res.status(400).json('Invalid product').send();

        if ((product.client_id !== collaborator.client_id) && (product.client_id !== collaborator.client.id )) return res.status(400).json("You don't have permission to do that").send();


        // Query builder for product update
        const new_product = 
            await models.Product.query()
                .where('id', product_id)
                .update({name, description, metric, metric_amount, sku, base_price})

        // Send the clients
        return res.status(200).json(`Product ${name} updated successfully`).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const deleteProducts = async (req, res, next) => {
    
}

const productsController = {
    getProducts,
    getClientProducts,
    createProduct,
    updateProduct
}

export default productsController;