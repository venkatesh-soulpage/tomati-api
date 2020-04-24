import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get briefs
const getBriefs = async (req, res, next) => {
    try {    
        
        const {scope, account_id} = req;

        // Validate the collaborators
        let collaborator;

        // If client query client collaborators
        if (scope === 'BRAND') {
            const client_collaborators = 
                        await models.ClientCollaborator.query()
                            .where('account_id', account_id);

            collaborator = client_collaborators[0];
        } 

        // If agency bring Agency collaborators with client graph
        if (scope === 'AGENCY') {
                const agency_collaborators = 
                        await models.AgencyCollaborator.query()
                            .where('account_id', account_id)
                            .withGraphFetched('[client]')
                            
            collaborator = agency_collaborators[0];
        }

        
        if (!collaborator) return res.status(400).json('Invalid collaborator').send();

        // Create the brief
        const briefs = 
            await models.Brief.query()
                .withGraphFetched('[brief_events.[venue], products.[product.[brand]], agency]')
                .modify((queryBuilder) => {
                    if (scope === 'BRAND') {
                        queryBuilder.where('client_id', collaborator.client_id)
                    }
                    if (scope === 'AGENCY') {
                        queryBuilder
                            .where('client_id', collaborator.client.id)
                            .where('agency_id', collaborator.agency_id)
                            .where('status', 'SUBMITTED');
                    }
                }) 
                

        // Send the briefs
        return res.status(200).send(briefs);

    } catch (e) {
        console.log(e);
        console.log(req.headers);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Create a new brief
const createBrief = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {name, description, agency_id} = req.body;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator');

        // Create the brief
        const new_brief = 
            await models.Brief.query()
                .insert({
                    client_id: collaborator.client_id,
                    created_by: collaborator.id,
                    agency_id: agency_id,
                    name,
                    description,
                    status: 'DRAFT',
                })
                .withGraphFetched('[brief_events.[venue], agency]')

        // Send the clients
        return res.status(200).send(new_brief);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Create a new brief event
const addBriefEvent = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;
        const { 
            name,
            setup_time,
            start_time, 
            end_time, 
            recee_required,
            recee_time,
            expected_guests,
            hourly_expected_guests,
            cocktails_enabled,
            cocktails_per_guest,
            drinks_enabled,
            free_drinks_enabled,
            free_drinks_per_guest,
            cash_collected_by,
            comments,
            status,
            enabled, 
            parent_brief_event_id,
            venue_id,
        } = req.body;

        // Validate that brief exists
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).send('Invalid brief');

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief event
        const new_brief_event =
            await models.BriefEvent.query()
                .insert({
                    name,
                    brief_id,
                    setup_time,
                    start_time, 
                    end_time,
                    recee_required,
                    recee_time,
                    expected_guests,
                    hourly_expected_guests,
                    cocktails_enabled,
                    cocktails_per_guest,
                    drinks_enabled,
                    free_drinks_enabled,
                    free_drinks_per_guest,
                    cash_collected_by,
                    comments, 
                    status,
                    enabled,
                    parent_brief_event_id,
                    venue_id,
                })

        return res.status(201).json('Event created succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Create a new brief event
const addBriefProduct = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;
        const { product_id, limit } = req.body;

        // Validate that brief exists
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).send('Invalid brief');

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief product
        await models.BriefProducts.query()
                .insert({
                    brief_id,
                    product_id,
                    limit
                })

        return res.status(201).json('Brief product added succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Create a new brief event
const deleteBriefProduct = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id, brief_product_id} = req.params;

        // Validate that brief exists
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).send('Invalid brief');

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief product
        await models.BriefProducts.query()
                .deleteById(brief_product_id)

        return res.status(201).json('Brief product deleted succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Delete a brief
const deleteBrief = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator');

        // Validate if the collaborator is able to delete the brief
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).json('Invalid brief').send();
        if (brief.client_id !== collaborator.client_id) return res.status(401).json("You don't have permissions to delete this brief").send();

    
        // Delete the brief
        await models.Brief.query().deleteById(brief_id);

        // Send the clients
        return res.status(200).json('Deleted').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// DELETE - Delete a brief
const updateBriefStatus = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;
        const {status} = req.body;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator');

        // Validate if the collaborator is able to delete the brief
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).json('Invalid brief').send();
        if (brief.client_id !== collaborator.client_id) return res.status(401).json("You don't have permissions to delete this brief").send();
    
        // Delete the brief
        await models.Brief.query()
            .update({status})
            .where('id', brief_id);

        // Send the clients
        return res.status(200).json('Brief status updated').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}






const briefController = {
    getBriefs,
    createBrief,
    addBriefEvent,
    addBriefProduct,
    deleteBriefProduct,
    deleteBrief,
    updateBriefStatus
}

export default briefController;