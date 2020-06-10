import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get a list of all locations
const getLocations = async (req, res, next) => {
    
    try {    
        const locations = 
            await models.Location
                .query()
                .withGraphFetched(`[
                    childrens.[
                        childrens
                    ]
                ]`)
                .where('is_country', true);
                

        return res.status(201).send(locations);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Create a new location
const createLocation = async (req, res, next) => {
    try {    

        const {name, is_country, parent_location, passport_available, id_card_available, currency} = req.body;

        const location = 
            await models.Location.query()
                .insert({name, is_country, parent_location, passport_available, id_card_available, currency});

        return res.status(201).json('Location created successfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}



const locationsController = {
    getLocations,
    createLocation
}

export default locationsController;