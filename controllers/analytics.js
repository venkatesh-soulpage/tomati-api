import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendConfirmationEmail, sendFotgotPasswordEmail, clientInviteEmail } from './mailling';

// GET - Get a list of roles
const getOrganizationAnalytics = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const { client_id } = req.params;

        const collaborator = 
                await models.Collaborator.query()
                        .withGraphFetched(`[
                            organization,
                        ]`)
                        .where('account_id', account_id)
                        .first();

        if (!collaborator && !collaborator.organization) return res.status(400).json('Require organization role').send();

        // Get Briefs and Events
        const briefs = 
                await models.Brief.query()
                    .withGraphFetched(`[
                    brief_events.[
                            event
                        ]
                    ]`)
                    .modifyGraph('brief_events.event', builder => {
                        builder.where('ended_at', '>', new Date())
                    })
                    .modify(queryBuilder => {
                        if (client_id) {
                            queryBuilder.where('client_id', client_id);
                        } 
                    });

        const available_events = [];
        briefs.map(brief => {
            brief.brief_events.map(brief_event => {
                if (brief_event.event) {
                    available_events.push(brief_event.event.id);
                }
            })
        })

        const events = 
                await models.Event.query()
                        .withGraphFetched(`[
                            brief_event.[
                                brief.[
                                    client.[
                                        location
                                    ]
                                ]
                            ], 
                            guests,
                            products.[
                                product,
                                transactions
                            ]
                        ]`) 
                        .whereIn('id', available_events);
                        
        

        return res.status(200).send(events);
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Get Client Analytics
const getClientAnalytics = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;

        const collaborator = 
                await models.Collaborator.query()
                        .withGraphFetched(`[
                            client,
                        ]`)
                        .where('account_id', account_id)
                        .first();

        if (!collaborator && !collaborator.client) return res.status(400).json('Require client role').send();

        // Get Briefs and Events
        const briefs = 
                await models.Brief.query()
                    .withGraphFetched(`[
                    brief_events.[
                            event
                        ]
                    ]`)
                    .where('client_id', collaborator.client.id)
                    .modifyGraph('brief_events.event', builder => {
                        builder.where('ended_at', '>', new Date())
                    })

        const available_events = [];
        briefs.map(brief => {
            brief.brief_events.map(brief_event => {
                if (brief_event.event) {
                    available_events.push(brief_event.event.id);
                }
            })
        })

        const events = 
                await models.Event.query()
                        .withGraphFetched(`[
                            brief_event.[
                                brief.[
                                    client.[
                                        location
                                    ]
                                ]
                            ], 
                            guests,
                            products.[
                                product,
                                transactions
                            ]
                        ]`) 
                        .whereIn('id', available_events);
                        
        

        return res.status(200).send(events);
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


const analyticsController = {
    getOrganizationAnalytics,
    getClientAnalytics,
}

export default analyticsController;