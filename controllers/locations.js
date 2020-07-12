import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get a list of all locations
const getLocations = async (req, res, next) => {
    
    try {    

        const {account_id, scope} = req;
        
        const collaborator =
                await models.Collaborator.query()
                        .withGraphFetched(`[
                            organization.[
                                locations
                            ]
                        ]`)
                        .where('account_id', account_id)
                        .first();

        if (!collaborator && scope !== 'ADMIN') return res.status(400).json('Invalid account').send();

        const locations = 
            await models.Location
                .query()
                .withGraphFetched(`[
                    childrens
                ]`)
                .where('is_country', true)
                .orderBy('name', 'asc')
                .modify(builder => { 
                    // Get the regional organization locations and filter the endpoint to only them
                    if (collaborator && collaborator.organization) {
                        const locations = collaborator.organization.locations.map(location => location.location_id);
                        builder.whereIn('id', locations);
                    }
                });
                

        return res.status(201).send(locations);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const getChildrenLocations = async (req, res, next) => {
    try {
        const {location_id} = req.params;

        const available_locations =
            await models.Location.query()
                    .withGraphFetched(`[
                        childrens.[
                            childrens
                        ]
                    ]`)
                    .findById(location_id);

        return res.status(200).send(available_locations.childrens);

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

const updateCurrencyRate = async (req, res, next) => {
    try {
        const {location_id} = req.params;
        const {currency_conversion} = req.body;
        
        await models.Location.query()
                .update({
                    currency_conversion: Number(currency_conversion)
                })
                .where({id: location_id});

        return res.status(200).json('Rate successfully updated.').send();

    } catch (e) {
        console.log(e);
        return res.status(400).json(e).send();
    }
}



const locationsController = {
    getLocations,
    getChildrenLocations,
    createLocation,
    updateCurrencyRate,
}

export default locationsController;