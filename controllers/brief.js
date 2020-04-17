import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get briefs
const getBriefs = async (req, res, next) => {
    try {    
        
        const {account_id} = req;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();

        // Create the brief
        const briefs = 
            await models.Brief.query()
                .where('client_id', collaborator.client_id);

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
        const {name, description} = req.body;

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
                    name,
                    description,
                    status: 'DRAFT',
                })

        // Send the clients
        return res.status(200).send(new_brief);

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




const briefController = {
    getBriefs,
    createBrief,
    deleteBrief
}

export default briefController;