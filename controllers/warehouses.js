import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';


// POST - Submit a new venue
const createWarehouse = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {location_id, name, address, client_id} = req.body;

        // Validate the account is a client collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id)

        if (client_collaborators[0].client_id !== client_id) return res.status(400).json('Invalid client').send();

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


const warehouseController = {
    createWarehouse
}

export default warehouseController;