import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get briefs
const getRequisitions = async (req, res, next) => {
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

        // Get the requisitions
        const requisitions = 
            await models.Requisition.query()
                .withGraphFetched('[orders.[product], brief.[brief_events.[venue], products.[product]]]')
                .modifyGraph('brief', builder => {
                    if (scope === 'AGENCY') {
                        builder.where('agency_id', collaborator.agency_id);
                    }

                    if (scope === 'BRAND') {
                        builder.where('client_id', collaborator.client_id)
                    }                
                })
                .modify((queryBuilder) => {
                    if (scope === 'BRAND') {
                        queryBuilder
                            .where('status', 'SUBMITTED');
                    }
                })
                

        // Send the briefs
        return res.status(200).send(requisitions);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Create a new requisition
const createRequisition = async (req, res, next) => {
    try {    
        
        const { scope, account_id} = req;
        const { brief_id, brief_parent_id } = req.body;

        // Validate the collaborators
        const agency_collaborators = 
                        await models.AgencyCollaborator.query()
                            .where('account_id', account_id)
                
        const collaborator = agency_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();
                
        // Create a new requisition
        await models.Requisition.query()
            .insert({brief_id, brief_parent_id, status: 'DRAFT'});

        // Update brief status to 'On progress'
        await models.Brief.query()
            .patch({status: 'ON PROGRESS'})
            .where('id', brief_id);

        // Send the briefs
        return res.status(200).json('Requisition created.').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const createRequisitionOrder = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id} = req.params;
        const {brief_event_id, product_id, price, units} = req.body;

        await models.RequisitionOrder.query()
            .insert({requisition_id, brief_event_id, product_id, price, units});

        return res.status(200).json('Order created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const requisitionController = {
    getRequisitions,
    createRequisition,
    createRequisitionOrder,
}

export default requisitionController;