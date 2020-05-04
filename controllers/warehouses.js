import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get the warehouses
const getWarehouses = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)

        const warehouses =  
            await models.Warehouse.query()
                .withGraphFetched('[location, stocks.[product, transactions.[account]]]')
                .modify((queryBuilder) => {
                    if (scope !== 'ADMIN') {
                        queryBuilder.where('client_id', client_collaborators[0].client_id);
                    }
                }) 

        // Send the clients
        return res.status(200).send(warehouses);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }


}


// POST - Submit a new venue
const createWarehouse = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {location_id, name, address, client_id} = req.body;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .withGraphFetched('[client.[warehouses]]')
                .where('account_id', account_id)

        if (client_collaborators[0].client_id !== client_id) return res.status(400).json('Invalid client').send();

        // Validate warehouses
        if (client_collaborators[0].client.warehouses_limit <= client_collaborators[0].client.warehouses.length) {
            return res.status(400).json(
                `
                    Maximum number of warehouses have been added. Contact ; support@boozeboss.co  to upgrade your account.
                `
            ).send()
        }
    
        const new_warehouse =  
            await models.Warehouse.query()
                .insert({
                    location_id, name, address,
                    client_id: client_collaborators[0].client_id,
                }); 

        // Send the clients
        return res.status(201).json('Warehouse successfully created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Submit a warehouse stock
const createWarehouseStock = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {warehouse_id} = req.params;
        const {product_id, quantity} = req.body;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)

        const warehouse =
            await models.Warehouse.query()
                .findById(warehouse_id);

        if (warehouse.client_id !== client_collaborators[0].client_id) return res.status(400).json('You dont have permission to do this').send();

        // Validate if the product is on stock
        const stock = 
            await models.WarehouseStock.query()
                .where('product_id', product_id)
                .where('warehouse_id', warehouse_id);


        // Update or create current stock
        if (stock && stock.length > 0) {
            // Update  
            await models.WarehouseStock.query()
                .patch({quantity: new Number(stock[0].quantity) +  new Number(quantity)})
                .where('id', stock[0].id);
        } else {
            // Insert
            await models.WarehouseStock.query()
                .insert({
                    warehouse_id, product_id, quantity
                });
        }           
        
        // Register the transaction
        await models.WarehouseTransaction.query()
            .insert({
                warehouse_id, product_id, account_id, quantity,
                action: 'ADD'
            })

        // Send the clients
        return res.status(201).json('Stock successfully added').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const removeWarehouseStock = async (req, res, next) => {
    try {    
        const {account_id, scope} = req;
        const {warehouse_id} = req.params;
        const {product_id, quantity} = req.body;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)

        const warehouse =
            await models.Warehouse.query()
                .findById(warehouse_id);

        if (warehouse.client_id !== client_collaborators[0].client_id) return res.status(400).json('You dont have permission to do this').send();

        // Validate if the product is on stock
        const stock = 
            await models.WarehouseStock.query()
                .where('product_id', product_id)
                .where('warehouse_id', warehouse_id);

        if (stock[0].quantity <= 0) return res.status(400).json('No stock left').send();
        
        // Validate stock 
        const new_stock = new Number(stock[0].quantity) -  new Number(quantity);
        const new_amount = new_stock <= 0 ? 0 : new_stock;

        await models.WarehouseStock.query()
            .patch({quantity: new_amount})
            .where('id', stock[0].id);
        
        // Register the transaction
        await models.WarehouseTransaction.query()
            .insert({
                warehouse_id, product_id, account_id,
                quantity,
                action: 'REMOVE'
            })

        // Send the clients
        return res.status(201).json('Stock successfully removed').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


const warehouseController = {
    getWarehouses,
    createWarehouse,
    createWarehouseStock,
    removeWarehouseStock
}

export default warehouseController;