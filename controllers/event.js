import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

// GET - Get a list of venues
const getEvents = async (req, res, next) => {
    
    try {    

        const {account_id} = req;
    
        // Validate the account is a client collaborator
        const agency_collaborators = 
            await models.AgencyCollaborator.query()
                .withGraphFetched(`[client]`)
                .where('account_id', account_id)
            
        const collaborator = agency_collaborators[0];
        if (!collaborator) return res.status(400).send('Invalid account');

        // Get brief events for the client  
        const briefs = 
            await models.Brief.query()
                .withGraphFetched(`
                    [
                        brief_events.[
                            event.[
                                guests
                            ], 
                            venue
                        ]
                    ]
                `)
                .where('client_id', collaborator.client.id)
                .where('status', 'APPROVED');
        
        // Get brief
        const events = []; 
        await briefs.map(brief => {
            brief.brief_events.map(be => {
                events.push(be);
            })
        })            

        // Send the clientss
        return res.status(200).send(events);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Invite a user
const inviteGuest = async (req, res, next)  => {
    try { 
        const {account_id} = req;
        const {event_id, first_name, last_name, email, phone_number } = req.body;

        const code = Math.random().toString(36).substring(7).toUpperCase();

        console.log(req.body);

        // Validate if the user is a BoozeBoss user
        let guest;
        if (email) {
            const guests = 
            await models.Account.query()
                    .where('email', email);
        
            guest = guests[0];
        }
        

        // If the user has a boozeboss account assign the account
        await models.EventGuest.query()
                .insert({
                    event_id, 
                    account_id: guest ? guest.account_id : null,
                    first_name, 
                    last_name, 
                    email, 
                    phone_number,
                    code
                });        

        return res.status(200).json('Guest created');


    } catch (e) { 
        // Send the clientss
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const eventsController = {
    getEvents,
    inviteGuest
}

export default eventsController;