import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendRequisitionToEmail, sendDeliveryEmail } from './mailling'
import pdfController from './pdf';
import { getPDF, submitPDF } from './hellosign'

const revision_indexes = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,Y,X,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL'.split(',');

// GET - Get briefs
const getRequisitions = async (req, res, next) => {
    try {    
        
        const {scope, account_id} = req;

        // Get the collaborators
        const collaborator =   
            await models.Collaborator.query()
                    .withGraphFetched(`[client, agency]`)
                    .where('account_id', account_id)
                    .first();

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();

        // Get the client briefs
        const briefs = 
                await models.Brief.query()
                        .modify(queryBuilder => {
                            if (scope === 'AGENCY') {
                                queryBuilder.where('client_id', collaborator.agency.invited_by);
                            }
                            if (scope === 'BRAND') {
                                queryBuilder.where('client_id', collaborator.client_id)
                            } 
                        });
        
        const briefs_ids = briefs.map(brief => brief.id);

        // Get the requisitions
        const requisitions = 
            await models.Requisition.query()
                .withGraphFetched(
                    `[
                        orders.[
                            product.[
                                ingredients.[
                                    product,
                                    brand
                                ],
                                brand
                            ]
                        ],
                        brief.[
                            brief_events.[venue], 
                            brands.[
                                brand
                            ]
                        ],
                        deliveries.[
                            warehouse,
                            products.[product]
                        ]
                    ]`
                )
                .whereIn('brief_id', briefs_ids)
                .modify((queryBuilder) => {
                    if (scope === 'BRAND') {
                        queryBuilder
                            .whereIn('status', ['SUBMITTED', 'APPROVED', 'DELIVERED']);
                    }
                })
                .modifyGraph((queryBuilder) => {
                    if (scope === 'AGENCY') {
                        queryBuilder.where('brief_id', collaborator.agency.invited_by);
                    }
                    if (scope === 'BRAND') {
                        queryBuilder.where('brief_id', collaborator.client_id)
                    }   
                })
                .orderBy('created_at', 'desc')
                

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
                            .withGraphFetched('[client]')
                            .where('account_id', account_id)
                
        const collaborator = agency_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();
                
        // Create a new requisition
        await models.Requisition.query()
            .insert({
                brief_id, 
                brief_parent_id, 
                status: 'DRAFT', 
                serial_number: collaborator.client.requisition_current_serial + 1,
                created_by: collaborator.id
            });

        // Update current client
        await models.Client.query()
            .update({requisition_current_serial: collaborator.client.requisition_current_serial + 1})

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

const updateRequisitionStatus = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id} =req.params;
        const { status, hellosign_signature_id, comments } = req.body;

        const requisition = 
            await models.Requisition.query()
                    .withGraphFetched(`
                        [
                            client.[
                                client_collaborators.[
                                    account
                                ]
                            ],
                            brief.[
                                agency.[
                                    agency_collaborators.[
                                        account
                                    ]
                                ],
                                brief_events.[
                                    orders.[
                                        product
                                    ]
                                ]
                            ]
                        ]`)
                    .findById(requisition_id);

        await models.Requisition.query()
            .patch({status, comments, hellosign_signature_id})
            .where('id', requisition_id);

        // If approved
        if (status === 'APPROVED' ) {
            await models.Brief.query()
                .patch({ status: 'APPROVED' })
                .where('id', requisition.brief_id);

            // MAIL notifications
            for (const collaborator of requisition.brief.agency.agency_collaborators) {
                await sendRequisitionToEmail(requisition, collaborator.account, status);
            }

            // Create Events from brief 
            for (const brief_event of requisition.brief.brief_events ) {
                 await models.Event.query()
                        .insert({
                            brief_event_id: brief_event.id,
                            setup_at: brief_event.setup_time,
                            started_at: brief_event.start_time,
                            ended_at: brief_event.end_time,
                            master_code: Math.random().toString(36).substring(7).toUpperCase(),
                            is_master_code_enabled: true,
                            credits_left: 10000,
                        })
            }
        }
        
        // IF SUBMITTED
        if ( status === 'SUBMITTED') {
            await models.Brief.query()
            .patch({status: 'WAITING APPROVAL'})
            .where('id', requisition.brief_id);

            // MAIL notifications
            for (const collaborator of requisition.client.client_collaborators) {
                await sendRequisitionToEmail(requisition, collaborator.account, status);
            }
        }

        // IF REQUEST MODIFICATIONS
        if (status == 'DRAFT' || status === 'CHANGES REQUIRED') {
            await models.Brief.query()
                .update({status: 'ON PROGRESS'})
                .where('id', requisition.brief_id);
            
            // MAIL notifications
            for (const collaborator of requisition.client.client_collaborators) {
                await sendRequisitionToEmail(requisition, collaborator.account, status);
            }
        }


        return res.status(200).json('Requisition updated!').send();
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const rejectRequisition = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id} = req.params;

        // Validate the collaborators
        const client_collaborators = 
                        await models.ClientCollaborator.query()
                            .withGraphFetched('[client]')
                            .where('account_id', account_id)
                
        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();

        // Validate Requisition permission
        const requisition = await models.Requisition.query()
                                .withGraphFetched('[brief]')       
                                .findById(requisition_id);

        if (requisition.brief.client_id !== collaborator.client_id) return res.status(400).json('Invalid client').send();

        await models.Requisition.query()
                .update({status: 'REJECTED'})
                .where('id', requisition_id);

        await models.Brief.query()
                .update({status: 'REQUISITION REJECTED'})
                .where('id', requisition.brief_id)
        
        return res.status(200).json('Status updated').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const createRequisitionOrder = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id} = req.params;
        const {brief_event_id, product_id, price, units, is_display} = req.body;

        await models.RequisitionOrder.query()
            .insert({requisition_id, brief_event_id, product_id, price, units, is_display});

        return res.status(200).json('Order created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const deleteRequisitionOrder = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id, requisition_order_id} = req.params;

        await models.RequisitionOrder.query()
            .deleteById(requisition_order_id);

        return res.status(200).json('Order deleted').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

/* DEPRECATED */
const deliverRequisitionOrders = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id} = req.params;
        const {waybill, orders} = req.body;

        // Order comes in form of
        /* 
            {
                product_id: 1,
                units: 100,
                warehouse_id: 1,
            }
        */

         // Validate stock
        for (const order of orders) {

            // Destruct order
            const {product_id, warehouse_id, units} = order;

            // Iteraye trough all stocks
            const stock = 
                await models.WarehouseStock.query()
                    .findOne({
                        product_id,
                        warehouse_id,
                    })

            if (Number(order.units) > Number(stock.quantity)) return res.status(400).json(`Stock unavailable for product with id ${product_id} at warehouse ${warehouse_id}`);
        }

        // If the stock exists for every product
        for (const order of orders) {

            // Destruct order
            const {product_id, warehouse_id, units} = order;

            // Used as an accountability table
            const stocks = 
                await models.WarehouseStock.query()
                    .where('product_id', product_id)
                    .where('warehouse_id', warehouse_id)

            const stock = stocks[0];

            // Record the transaction
            await models.WarehouseTransaction.query()
                    .insert({
                        product_id,
                        warehouse_id, 
                        account_id,
                        requisition_id,
                        quantity: units,
                        action: 'DELIVERY'
                    })
            
            // Update the current amount
            await models.WarehouseStock.query()
                    .update({quantity: Number(stock.quantity) - Number(units)})
                    .where('product_id', product_id)
                    .where('warehouse_id', warehouse_id);
            
        }

        // Update current requisition status
        await models.Requisition.query()
            .update({
                waybill,
                status: 'DELIVERED'
            })
            .where('id', requisition_id);

        // Update brief to READY
        const requisition = await models.Requisition.query().findById(requisition_id);
        await models.Brief.query()
                .update({status: 'READY'})
                .where('id', requisition.brief_id);
        
        return res.status(200).json('Order delivered')

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const createRequisitionDelivery = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id} = req.params;
        const {warehouse_id, deliveryProducts, requisition_delivery_parent_id} = req.body;


        // Validate stock
        for (const deliveryProduct of deliveryProducts) {

            // Destruct order
            const {product, units} = deliveryProduct;

            // Iteraye trough all stocks
            const stock = 
                await models.WarehouseStock.query()
                    .findOne({
                        product_id: product.id,
                        warehouse_id,
                    })

            if (Number(units) > Number(stock.quantity)) return res.status(400).json(`Stock unavailable for product with id ${product_id} at warehouse ${warehouse_id}`);
        }

        // Get the number of deliveries that aren't disputes
        let revision_indicator;
        if (requisition_delivery_parent_id) {
            const parent_requisition_delivery = 
                await models.RequisitionDelivery.query()
                        .findById(requisition_delivery_parent_id);
            
            // Get the third parameter of the waybill 
            const revision_index = parent_requisition_delivery.waybill.split('_')[2];
            revision_indicator = revision_indexes[revision_indexes.indexOf(revision_index) + 1];

            // Disable last delivery
            await models.RequisitionDelivery.query()
                    .update({ enabled: false })
                    .where('id', requisition_delivery_parent_id);

        } else {    
            revision_indicator = revision_indexes[0];
        }

        // Get the current requisition
        const requisition = 
            await models.Requisition.query()
                    .findById(requisition_id)
                    .withGraphFetched(`
                        [   
                            deliveries,
                        ]
                    `);

        const delivery_number = requisition.deliveries.filter(delivery => delivery.enabled).length + 1;

        // Create a new delivery
        const delivery = 
            await models.RequisitionDelivery.query()
                    .insert({
                        requisition_id: Number(requisition_id),
                        waybill: `${requisition.serial_number}_${delivery_number}_${revision_indicator}`,
                        status: 'PROCESSING DELIVERY',
                        warehouse_id
                    });

        // If the stock exists for every product
        for (const deliveryProduct of deliveryProducts) {

            // Destruct order
            const {product, units} = deliveryProduct;

            // Used as an accountability table
            
            const stocks = 
                await models.WarehouseStock.query()
                    .where('product_id', product.id)
                    .where('warehouse_id', warehouse_id)

            const stock = stocks[0];

            // Create a Delivery Product
            await models.RequisitionDeliveryProduct.query()
                    .insert({
                        requisition_delivery_id: delivery.id,
                        product_id: product.id,
                        units
                    })

            // Record the transaction
            await models.WarehouseTransaction.query()
                    .insert({
                        product_id: product.id,
                        warehouse_id, 
                        account_id,
                        requisition_id,
                        quantity: units,
                        action: 'DELIVERY'
                    })
            
            // Update the current amount
            await models.WarehouseStock.query()
                    .update({quantity: Number(stock.quantity) - Number(units)})
                    .where('product_id', product.id)
                    .where('warehouse_id', warehouse_id);
        }

        // Populate new delivery model to send emails
        const new_delivery = 
            await models.RequisitionDelivery.query()
                .withGraphFetched(`[
                    requisition.[
                        brief.[
                            agency.[
                                agency_collaborators.[
                                    account
                                ]
                            ],
                            brief_events.[
                                orders.[
                                    product
                                ]
                            ]
                        ]
                    ],
                    warehouse,
                    products.[
                        product
                    ]
                ]`)
                .findById(delivery.id)

        for (const collaborator of new_delivery.requisition.brief.agency.agency_collaborators) {
            await sendDeliveryEmail(new_delivery, collaborator.account, 'PROCESSING DELIVERY');
        } 

        return res.status(200).json('Delivery successfull created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const updateRequisitionDelivery = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {requisition_id, requisition_delivery_id} = req.params;
        const {waybill, status, comments, is_refund, refunds} = req.body;

        await models.RequisitionDelivery.query()
                .update({waybill, status, comments, updated_at: new Date()})
                .where('requisition_id', requisition_id)
                .where('id', requisition_delivery_id);

        // Populate new delivery model to send emails
        const new_delivery = 
            await models.RequisitionDelivery.query()
                .withGraphFetched(`[
                    requisition.[
                        brief.[
                            client.[
                                client_collaborators.[
                                    account
                                ]
                            ],
                            agency.[
                                agency_collaborators.[
                                    account
                                ]
                            ],
                            brief_events.[
                                orders.[
                                    product
                                ]
                            ]
                        ]
                    ],
                    warehouse,
                    products.[
                        product
                    ]
                ]`)
                .findById(requisition_delivery_id)
        
        // Return objects in transaction if there is a dispute
        if (status === 'DISPUTED') {

            // If refund send the items to the warehouse 
            if (is_refund && refunds && refunds.length > 0) {
                for (const refund of refunds) {

                    // Used as an accountability table
                    const stocks = 
                        await models.WarehouseStock.query()
                            .where('product_id', refund.product.id)
                            .where('warehouse_id', new_delivery.warehouse_id)
    
                    const stock = stocks[0];
    
                    // Record the transaction
                    await models.WarehouseTransaction.query()
                            .insert({
                                product_id: refund.product.id,
                                warehouse_id: new_delivery.warehouse_id, 
                                account_id,
                                requisition_id: new_delivery.requisition_id,
                                quantity: refund.refund_amount,
                                action: 'DISPUTED'
                            })
                    
                    // Update the current amount
                    await models.WarehouseStock.query()
                            .update({quantity: Number(stock.quantity) + Number(refund.refund_amount)})
                            .where('product_id', refund.product.id)
                            .where('warehouse_id', new_delivery.warehouse_id);
                }
            }
        }

        // Send email to all client collaborators
        for (const collaborator of new_delivery.requisition.brief.client.client_collaborators) {
            await sendDeliveryEmail(new_delivery, collaborator.account, status);
        }
        
        // Send email to all agency collaborators
        for (const collaborator of new_delivery.requisition.brief.agency.agency_collaborators) {
            await sendDeliveryEmail(new_delivery, collaborator.account, status);
        } 

        return res.status(200).json('Delivery updated successfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// GET - Get a copy of the signed document
const getHellosignSignature = async (req, res, next) => {
    try {

        const {requisition_id} = req.params; 

        
        // Get the requisition and validate that it has a signature id
        const requisition  = await models.Requisition.query().findById(requisition_id);

        if (!requisition) return res.status(400).json('Invalid requisition').send();
        if (!requisition.hellosign_signature_id) return res.status(400).json('Invalid signature').send();

        res.setHeader('Content-disposition', 'attachment; filename="' + requisition.hellosign_signature_id + '"')
        res.setHeader('Content-type', 'application/pdf')

        await getPDF(requisition.hellosign_signature_request_id, res);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Create a document, upload it to hellosign and return the signature url.
const requestHelloSignSignature = async (req, res, next) => {
    try {
        const {requisition_id} = req.params;
        const requisition = await pdfController.helloSignPDF(requisition_id);
        const signature  = await submitPDF(requisition, res);

        await models.Requisition.query()
                .update({ hellosign_signature_request_id: signature.signature_request_id })
                .where('id', requisition_id );

        return res.status(200).json(signature.url).send();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const requisitionController = {
    getRequisitions,
    createRequisition,
    updateRequisitionStatus,
    rejectRequisition,
    createRequisitionOrder,
    deleteRequisitionOrder,
    deliverRequisitionOrders,
    createRequisitionDelivery,
    updateRequisitionDelivery,
    // Hellosign
    getHellosignSignature,
    requestHelloSignSignature
}

export default requisitionController;