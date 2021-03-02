import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendInviteCode } from './mailling'

const getOrganizationEvents = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {regional_organization_id} = req;

        // Validate collaborator
        const collaborator =
                await models.Collaborator.query()
                        .withGraphFetched('organization')
                        .where('account_id', account_id)
                        .first();

        if (!collaborator || !collaborator.organization) return res.status(400).json('Invalid collaborator').send();

        const organization = 
            await models.RegionalOrganization.query()
                    .withGraphFetched(`[
                        clients.[
                            briefs.[
                                brief_events.[
                                    event
                                ]
                            ]
                        ]
                    ]`)
                    .where('id', collaborator.organization.id)
                    .first();
        
        const events = [];
        organization.clients.map(client => {
            client.briefs.map(brief => {
                brief.brief_events
                        .filter(brief_event => {
                            return brief_event.event && (new Date(brief_event.event.ended_at).getTime() <= new Date().getTime());
                        })
                        .map(brief_event => events.push(brief_event));
            })
        })

        return res.status(200).send(events);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// GET - Get clients events 
const getClientEvents = async (req, res, next) => {
    try {
        const {account_id} = req;

        // Validate collaborator
        const collaborator =
                await models.Collaborator.query()
                        .withGraphFetched('client')
                        .where('account_id', account_id)
                        .first();

        if (!collaborator || !collaborator.client) return res.status(400).json('Invalid collaborator').send();

        const client = 
            await models.Client.query()
                    .withGraphFetched(`[
                        briefs.[
                            brief_events.[
                                event
                            ]
                        ]
                    ]`)
                    .where('id', collaborator.client.id)
                    .first();
        
        const events = [];
        client.briefs.map(brief => {
            brief.brief_events
                    .filter(brief_event => {
                        return brief_event.event && new Date(brief_event.event.ended_at).getTime() <= new Date().getTime()
                    })
                    .map(brief_event => events.push(brief_event));
        })

        return res.status(200).send(events);
    } catch (e) {
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

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
                            orders.[
                                product.[
                                    ingredients
                                ]
                            ],
                            brief.[
                                brands
                            ],
                            event.[
                                guests.[
                                    role
                                ],
                                products.[
                                    product
                                ],
                                condition.[
                                    role
                                ]
                            ], 
                            venue
                        ]
                    ]
                `)
                .where('client_id', collaborator.client.id)
                .where('status', 'APPROVED')
                .orderBy('created_at', 'DESC');
        
        // Get brief
        const events = []; 
        await briefs.map(brief => {
            brief.brief_events
                .filter(be => be.event)
                .map(be => {
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

// GET - Get an specific event with an id
const getEvent = async (req, res, next) => {

    try {
        const {event_id} = req.params;

        const event = 
            await models.Event.query()
                .withGraphFetched(`
                    [
                        brief,
                        brief_event,
                        guests.[
                            role
                        ],
                        products.[
                            product
                        ]
                    ]
                `)
                .findById(event_id);
    
        if (!event) return res.status(400).json('Invalid ID').send();
    
        return res.status(200).send(event);
    } catch (error) {
        console.log(error);
        return res.status(500).json(JSON.stringify(error)).send();
    }
}

// UPDATE - Update an event field mostly used for start an event before and ending it before
const updateEventField = async (req, res, next) => {

    try {
        const {account_id} = req;
        const {event_id} = req.params;
        const {field, value} = req.body;

        if (!event_id || !field || !value) return res.status(400).json('Missing fields').send();

        await models.Event.query()
                .update({[field]: value})
                .where('id', event_id);

        // If it is a end of the day command mark the one who ended it.
        if (field === 'ended_at') {
            await models.Event.query()
                    .update({ended_by: account_id})
                    .where('id', event_id);
        }

        return res.status(200).json('Successfully updated').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Fund event credit wallet 
const fundEvent = async (req, res, next) => {
    try { 
        const {account_id} = req;  
        const {event_id} = req.params;
        const {funding_amount} = req.body;

        const event = await models.Event.query()
                            .withGraphFetched(`[
                                brief_event
                            ]`)
                            .where({ id: event_id }).first();   
        
        // Verify wallet 
        const wallet = await models.Wallet.query().where({account_id}).first();

        if (!wallet) return res.status(400).json('Invalid funding account').first();
        if (wallet.balance < Number(funding_amount)) return res.status(400).json('Insufficient wallet balance').send();

        // Calculate credits left required
        const credits_left = (Number(event.credits_left) + Number(funding_amount));
        const total_credits_funded = Number(event.total_credits_funded) + Number(funding_amount);

        // Substract the credits from account wallet 
        await models.Wallet.query()
                .update({
                    balance: Number(wallet.balance) - Number(funding_amount),
                })
                .where({
                    account_id,
                })

        // Add the funding log
        await models.EventFundingLogs.query()
                .insert({
                    account_id,
                    event_id, 
                    amount: Number(funding_amount),
                    action: 'FUNDED'
                })

        // Update credits left
        await models.Event.query()
                .update({ 
                    credits_left,
                    total_credits_funded
                })
                .where({id: event_id});

        return res.status(200).json(`Successfully added ${funding_amount} credits to ${event.brief_event.name}`).send();

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
        return res.status(200).json('Success').send();

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

// Guest
const getGuestEvents = async (req, res, next) => {
    try {
        const {account_id} = req;
        
        // Get the events where the user is a guest
        const guest_of_events = 
                await models.EventGuest.query()
                    .withGraphFetched(`[
                        event.[
                            brief_event.[
                                venue
                            ], 
                            condition
                        ]
                    ]`)
                    .where('account_id', account_id)
                    .orderBy('created_at', 'DESC');        

        // Bring only the events with brief_events

        return res.status(200).send(guest_of_events); 
              
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}
 
const getCheckinToken = async (req, res, next) => {
    try {
        const {account_id} = req;
        const { event_id } = req.params;

        // Vaidate if the user is a event guest
        const guest_list = 
            await models.EventGuest.query()
                    .where('event_id', event_id)
                    .where('account_id', account_id);

        const guest = guest_list[0];
        if (!guest) return res.status(400).json("This account isn't on the guest list").send();

        // If the user is on the list generate a token
        const check_in_token = crypto.randomBytes(16).toString('hex');
        
        // Update the token
        await models.EventGuest.query()
                .update({
                    check_in_token
                })
                .where('event_id', event_id)
                .where('account_id', account_id);

        return res.status(200).json(check_in_token).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const checkInGuest = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {token} = req.params;

        // Validate token
        if (!token) return res.status(400).json('Invalid token').send();

        const guest = 
            await models.EventGuest.query()
                .withGraphFetched(`[
                    account, 
                    role, 
                    event.[
                        brief_event
                    ]
                ]`)
                .where('check_in_token', token)
                .first();
            

        if (!guest) return res.status(400).json('Invalid token').send();
    
        // Update guest Check-In but validate if the user has already checked out from the event.
        // If the user had already checked in and checked out from the event remove the checkout time
        // If is the first time check in gift the free credits and set the check in time.
        if (guest.checked_in) {
            await models.EventGuest.query()
                    .update({ check_out_time: null })
                    .where('id', guest.id);
        } else {
            await models.EventGuest.query()
                .update({
                    checked_in: true, 
                    check_in_time: new Date(),
                    checked_in_by: account_id
                })
                .where('id', guest.id)
        }
        
        // Return the gues with account
        return res.status(200).send(guest);
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const checkOutGuest = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {token} = req.params;

        // Validate token
        if (!token) return res.status(400).json('Invalid token').send();

        const event_guests = 
            await models.EventGuest.query()
                .withGraphFetched('[account, role]')
                .where('check_in_token', token);

        const guest = event_guests[0];

        if (!guest) return res.status(400).json('Invalid token').send();
        
        // Update guest Check-In
        await models.EventGuest.query()
                .update({
                    check_out_time: new Date(),
                    checked_out_by: account_id,
                })
                .where('id', guest.id)

        // Return the gues with account
        return res.status(200).send(guest);
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Redeem code
const redeemCode = async (req, res, next) => {
    try {

        const {account_id} = req;
        const {code} = req.body;

        // Validate token
        if (!code) return res.status(400).json('Invalid Code').send();

        // Check if the code used is master code 
        const event =
            await models.Event.query()
                    .where('master_code', code)
                    .first();
        
        // If there is an event add it to the event guest list, else check by individual guests logic 
        if (event) {

            // Validate the account 
            const account = 
                    await models.Account.query()
                            .findById(account_id);

            if (!account) return res.status(400).json('Invalid Account').send();

            const event_guests = 
                await models.EventGuest.query()
                        .where({account_id});
    
            const checked_in_event_ids = event_guests.map(event_guest => event_guest.event_id);

            if (checked_in_event_ids.indexOf(event.id) > -1) return res.status(400).json('Already a guest').send();
            
            // Create the guest 
            await models.EventGuest.query()
                    .insert({
                        event_id: event.id,
                        account_id: account.id,
                        first_name: account.first_name,
                        last_name: account.last_name,
                        email: account.email,
                        phone_number: account.phone_number,
                        code: `${code}_${account_id}`,
                        code_redeemed: true
                    })

            // Return the gues with account
            return res.status(200).json('Successfully redemeed').send();
            
        } else {
            const guest = 
                await models.EventGuest.query()
                    .withGraphFetched('[account, role]')
                    .where('code', code)
                    .first();

            if (!guest) return res.status(400).json('Invalid code').send();

            // Validate that the account doesn't have a registered code for this event
            const account_guests = 
                await models.EventGuest.query()
                    .where('account_id', account_id)
                    .where('event_id', guest.event_id);
                
            if (account_guests.length > 0) return res.status(400).json('This account is already invited to this event.').send();

            // Validate that the code wasn't redeemed
            if (!guest) return res.status(400).json('Invalid Code').send();
            if (guest.code_redeemed) return res.status(400).json('This code has already been redeemed.').send();
            
            // Update guest Check-In
            await models.EventGuest.query()
                    .update({code_redeemed: true, account_id})
                    .where('id', guest.id)

            // Return the gues with account
            return res.status(200).json('Successfully redemeed').send();
        }
        
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const addEventProduct = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {event_id} = req.params;
        const {product_id, price} = req.body;

        // Validate valid agency collaborator
        const collaborator = 
            await models.AgencyCollaborator.query()
                    .withGraphFetched(`[client]`)
                    .where('account_id', account_id)
                    .first();

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();
        
        // Validate that the collaborator has the correct access  
        const event = await models.Event.query()
                        .withGraphFetched('[brief]')
                        .findById(event_id);

        if (!event) return res.status(400).json('Invalid event id').send();
        if (event.brief.agency_id !== collaborator.agency_id) return res.status(400).json('Invalid agency').send();
        
        await models.EventProduct.query()
                .insert({
                    event_id, product_id, price,
                })

        return res.status(200).json('Product successfully added to menu').send();        
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const removeEventProduct = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {event_id, event_product_id} = req.params;

        // Validate valid agency collaborator
        const collaborator = 
            await models.AgencyCollaborator.query()
                    .withGraphFetched(`[client]`)
                    .where('account_id', account_id)
                    .first();

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();
        
        // Validate that the collaborator has the correct access  
        const event = await models.Event.query()
                        .withGraphFetched('[brief]')
                        .findById(event_id);

        if (!event) return res.status(400).json('Invalid event id').send();
        if (event.brief.agency_id !== collaborator.agency_id) return res.status(400).json('Invalid agency').send();
        
        await models.EventProduct.query()
                .deleteById(event_product_id);

        return res.status(200).json('Product successfully added to menu').send();        
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const updateEventProduct = async (req, res, next) => {
    try {
        const {event_id, event_product_id } = req.params;
        const {field, value} = req.body;

        await models.EventProduct.query()
                .patch({
                    [field]: value
                })
                .where({
                    id: event_product_id,
                    event_id,
                });

        return res.status(200).json('Update product').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

const selectFreeDrink = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {event_id, event_product_id} = req.params;

        // Validate valid agency collaborator
        const collaborator = 
            await models.AgencyCollaborator.query()
                    .withGraphFetched(`[client]`)
                    .where('account_id', account_id)
                    .first();

        if (!collaborator) return res.status(400).json('Invalid collaborator').send();
        
        // Validate that the collaborator has the correct access  
        const event = await models.Event.query()
                        .withGraphFetched('[brief]')
                        .findById(event_id);

        if (!event) return res.status(400).json('Invalid event id').send();
        if (event.brief.agency_id !== collaborator.agency_id) return res.status(400).json('Invalid agency').send();
        
        await models.EventProduct.query()
                .update({is_free_drink: false})
                .where({event_id: event_id});

        await models.EventProduct.query()
                .update({is_free_drink: true})
                .where({id: event_product_id});    

        return res.status(200).json('Update redeemable drink').send();        
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}


const getEventStats = async (req, res, next) => {
    try {
        const {event_id} = req.params;

        const event_products = 
            await models.EventProduct.query()
                    .withGraphFetched(`[
                        product.[
                            ingredients.[
                                product
                            ]
                        ],
                        transactions.[
                            wallet_order
                        ]
                    ]`)
                    .where('event_id', event_id);

        const event = 
                await models.Event.query()
                        .withGraphFetched(`[
                            guests.[
                                role
                            ]
                        ]`)
                        .findById(event_id);


        return res.status(200).send({event_products, event});
                
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Add event condition 
const addEventCondition = async (req, res, next) => {
    try {

        const {event_id} = req.params;
        const {condition_type, end_time, gender, limit, max_age, min_age, start_time, role_id} = req.body;

        // Delete conditions for this event
        await models.EventCondition.query()
                .where({event_id: event_id})
                .del();
        
        await models.EventCondition.query()
                .insert({
                    event_id,
                    condition_type, end_time, gender, limit, max_age, min_age, start_time, role_id
                })

        return res.status(200).json('Condition created').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Add event condition 
const removeEventCondition = async (req, res, next) => {
    try {

        const {event_id} = req.params;

        // Delete conditions for this event
        await models.EventCondition.query()
                .where({event_id: event_id})
                .del();

        return res.status(200).json('Condition removed').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Generate QR code for free drinks
const generateFreeDrinkCode  = async (req, res, next) => {
    try {

        const {event_id, event_guest_id} = req.params;

        // Validate that the user hasn't redeemed a code
        const guest = 
            await models.EventGuest.query()
                    .where({id: event_guest_id})
                    .first();
        
        if (!guest) return res.status(400).json('Invalid guest id').send();
        if (guest.free_drink_redemeed) return res.status(400).json('A drink has already been redemeed').json();

        // Generate code and update the table
        const free_drink_code = crypto.randomBytes(16).toString('hex');

        await models.EventGuest.query()
                .update({free_drink_code})
                .where({id: event_guest_id});

        const free_drink = 
            await models.EventProduct.query()
                    .withGraphFetched(`[product]`)
                    .where({event_id, is_free_drink: true })
                    .first();

        return res.status(200).json({free_drink_code, free_drink}).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Scan and give a free drink
const redeemFreeDrinkCode = async (req, res, next) => {
    try {
        const {code} = req.body;
        
        const guest = 
                await models.EventGuest.query()
                        .where({
                            free_drink_code: code,
                        })
                        .first();
                
        if (!guest) return res.status(400).json('Invalid Code').send();
        if (guest.free_drink_redemeed) return res.status(400).json('Code already used').send();

        // Update the event redemed limit 
        const event = 
                await models.Event.query()
                        .withGraphFetched('[condition]')
                        .findById(guest.event_id);

        if (event.condition.limit <= (event.free_redemeed_drinks + 1)) return res.status(400).json('Free drink limit reached').send();


        // Mark the code as redeemed
        await models.EventGuest.query()
                .update({
                    free_drink_redemeed: true
                })
                .where({
                    id: guest.id,
                });
                
        await models.Event.query()
                .update({
                    free_redemeed_drinks: (event.free_redemeed_drinks + 1)
                })
                .where({
                    id: guest.event_id,
                })

        const free_drink = 
            await models.EventProduct.query()
                    .withGraphFetched(`[product]`)
                    .where({
                        event_id: guest.event_id, 
                        is_free_drink: true 
                    })
                    .first();

        return res.status(200).send(free_drink);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Get funding logs
const getFundingLogs = async (req, res, next) => {
    try {
        const {event_id} = req.params;

        const funding_logs = 
                await models.EventFundingLogs.query()
                        .withGraphFetched(`[
                            account
                        ]`)
                        .where({event_id})
                        .orderBy('created_at', 'desc');

        return res.status(200).send(funding_logs);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();  
    }
}

// Refund logs using fifo 
const refundFundingCredits = async (req, res, next) => {
    try {

        const {event_id} = req.params;

        const event = 
            await models.Event.query().findById(event_id);

        if (event.already_refunded) return res.status(400).json('Already refunded').send();

        const funding_logs = 
            await models.EventFundingLogs.query()
                    .where({
                        event_id
                    })
                    .orderBy('created_at', 'desc')

        // Refund funding orders depending on funding order
                    
        let credits_counter = event.credits_left;
        for (const funding_log of funding_logs) {
            // Validate that there are credits left to refund
            if (credits_counter > 0) {
                // If the log amount is smaller than the credits left refund entirely
                if (Number(funding_log.amount) <= Number(credits_counter)) {
                    // Create a refund log
                    await models.EventFundingLogs.query()
                            .insert({
                                account_id: funding_log.account_id,
                                event_id: funding_log.event_id,
                                amount: funding_log.amount,
                                action: 'REFUND',
                            })
                    
                    // Add the credits to the wallet
                    const wallet = await models.Wallet.query().where({account_id: funding_log.account_id}).first();

                    await models.Wallet.query()
                            .update({
                                balance: Number(wallet.balance) + Number(funding_log.amount)
                            })
                            .where({
                                account_id: funding_log.account_id
                            });


                    credits_counter = Math.round((Number(credits_counter) - Number(funding_log.amount)) * 100) / 100;
                } else {
                    // Refund the current balance
                    // Create a refund log
                    await models.EventFundingLogs.query()
                            .insert({
                                account_id: funding_log.account_id,
                                event_id: funding_log.event_id,
                                amount: credits_counter,
                                action: 'PARTIAL REFUND',
                            })
                    
                    // Add the credits to the wallet
                    const wallet = await models.Wallet.query().where({account_id: funding_log.account_id}).first();

                    await models.Wallet.query()
                            .update({
                                balance: Number(wallet.balance) + Number(credits_counter)
                            })
                            .where({
                                account_id: funding_log.account_id
                            });

                            credits_counter = 0;
                }
            }
        }

        // Clear credits_left
        await models.Event.query()
            .update({
                credits_left: 0,
                already_refunded: true,
            })
            .where({
                id: event_id
            });

        return res.status(200).json('Refunded successfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send(); 
    }
}

const eventsController = {
    getEvents,
    getClientEvents,
    getOrganizationEvents,
    getEvent,
    updateEventField,
    getGuestEvents,
    inviteGuest,
    revokeEventGuest,
    resendEmail,
    getCheckinToken,
    checkInGuest,
    checkOutGuest,
    redeemCode, 
    addEventProduct, 
    removeEventProduct,
    selectFreeDrink,
    getEventStats,
    addEventCondition, 
    removeEventCondition, 
    updateEventProduct,
    generateFreeDrinkCode,
    redeemFreeDrinkCode,
    fundEvent,
    getFundingLogs,
    refundFundingCredits
}

export default eventsController;