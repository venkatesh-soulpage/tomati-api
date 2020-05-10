import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendInviteCode } from './mailling'

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
                                guests.[
                                    role
                                ]
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
        const {event_id, role_id, first_name, last_name, email, phone_number, send_email } = req.body;

        const code = Math.random().toString(36).substring(7).toUpperCase();
        // Validate if the user is a BoozeBoss user
        let guest_account;
        if (email) {
            const guests = 
            await models.Account.query()
                    .where('email', email);
        
                    guest_account = guests[0];
        }
        

        // If the user has a boozeboss account assign the account
        const event_guest =
            await models.EventGuest.query()
                .insert({
                    event_id, 
                    account_id: guest_account ? guest_account.id : null,
                    role_id,
                    first_name, 
                    last_name, 
                    email, 
                    phone_number,
                    code
                });        

        // If the send_email flag is enabled send an email.
        if (send_email) {

            const created_guest = 
                await models.EventGuest.query()
                    .withGraphFetched(`
                        [
                            event.[
                                brief_event.[
                                    venue
                                ]
                            ]
                        ]
                    `)
                    .findById(event_guest.id)
            await sendInviteCode(created_guest);
        }        

        return res.status(200).json('Guest created');


    } catch (e) { 
        // Send the clientss
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const resendEmail = async (req, res, next) => {
    try {
        const {event_guest_id} = req.params;

        const guest = 
            await models.EventGuest.query()
                        .withGraphFetched(`
                        [
                            event.[
                                brief_event.[
                                    venue
                                ]
                            ]
                        ]
                    `)
                    .findById(event_guest_id);

        if (!guest) return res.status(400).json('Invalid guest').send();

        await sendInviteCode(guest);

    } catch(e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const revokeEventGuest = async (req, res, next) => {
    try {
        const {event_guest_id} = req.params;

        await models.EventGuest.query()
                .deleteById(event_guest_id);

        return res.status(200).json('Succesfully removed');

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}
 
const eventsController = {
    getEvents,
    inviteGuest,
    revokeEventGuest,
    resendEmail
}

export default eventsController;