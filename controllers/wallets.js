import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';

const randomString = (len) => {
    var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(len)].reduce(a=>a+p[~~(Math.random()*p.length)],'');
}

// POST - Create a new wallet order and transactions
const createOrder = async (req, res, next) => {
    
    try {    
        const {account_id, scope} = req;
        const {wallet_id} = req.params;
        const {transactions} = req.body;

        // Get user account with location so we can get the current conversion rate
        const account = await models.Account.query()
                                .withGraphFetched(`location`)
                                .where({id: account_id})
                                .first();

        // Transactions should be an array of event products ids,
        // Get the actual values for the event products and avoid calculating the total price for each item and the order on the front-end
        const event_products = [];
        for (const tx of transactions) {
            const event_product = await models.EventProduct.query().findById(tx);
            if (!event_product) return res.status(400).json('Invalid event product id:' + tx).send();
            event_products.push(event_product);
        }

        // If the transactions array is empty return an error
        if (event_products.length < 1) return res.status(400).json('Cannot create empty order').send();

        // Calculate the total order price and validate that there is balance on the user wallet
        const wallet = await models.Wallet.query().findById(wallet_id);
        if (!wallet) return res.status(400).json('Invalid wallet').send();
        if (wallet.account_id !== account_id) return res.status(400).json('Invalid account').send();

        // Validate the correct amount with the current rate
        const total_amount = 
            event_products.reduce((acc, curr) => {
                return acc + curr.price;
            }, 0);

        const coin_total_amount = Math.round(total_amount * account.location.currency_conversion * 1000) / 1000;
        
        if (wallet.balance < coin_total_amount) return res.status(400).json("Insufficicent balance").send();

        // Get the first reference product and assign the event id to this order
        const reference_event_product = 
            await models.EventProduct.query()
                    .findById(transactions[0]);

        // If the wallet has enough balance procced to complete the order.
        const order_identifier = randomString(10); 
        const wallet_order = 
            await models.WalletOrder.query()
                    .insert({
                        wallet_id,
                        event_id: reference_event_product.event_id,
                        total_amount,
                        order_identifier,
                        status: 'CREATED',
                        type: 'BUY'
                    })

        if (!wallet_order) return res.status(400).json('Error creating the wallet order').send();

        // Create the wallet order transactions
        for (const tx of transactions) {
            await models.WalletOrderTransaction.query()
                    .insert({
                        wallet_order_id: wallet_order.id,
                        event_product_id: tx,
                    })
        }

       // Reduce the balance from the wallet 
       await models.Wallet.query()
                .update({
                    balance: wallet.balance - coin_total_amount
                })
                .where('id', wallet.id);
        
        

        // Send the clients
        return res.status(200).json(order_identifier).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const getOrder = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {order_identifier} = req.params;

        const order =
                await models.WalletOrder.query()
                        .withGraphFetched(`[
                            wallet,
                            transactions.[
                                event_product.[
                                    product
                                ]
                            ],
                            agency_collaborator
                        ]`)
                        .where('order_identifier', order_identifier)
                        .first();
                
        if (!order) return res.status(400).json('Invalid order identifier');
        
        return res.status(200).send(order);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const cancelOrder = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {order_id} = req.params;

        // Get the account wallet
        const account = 
            await models.Account.query()
                    .withGraphFetched(`[
                        location
                    ]`) 
                    .findById(account_id);
                    
        if (!account) return res.status(400).json('Invalid Request').send();
        
        const order = 
                await models.WalletOrder.query()
                        .withGraphFetched(`[
                            wallet
                        ]`)
                        .findById(order_id);
        
        if (!order) return res.status(400).json('Invalid order').send();
        if (order.wallet.account_id !== account_id) return res.status(400).json('Invalid account').send();
        if (order.status !== 'CREATED') return res.status(400).json("Order can't be cancelled").send();

        // Update order status 
        await models.WalletOrder.query()
            .update({ status: 'CANCELLED'})
            .where('id', order_id);
        
        const updated_order = 
                await models.WalletOrder.query()
                    .withGraphFetched(`[
                        wallet,
                        transactions.[
                            event_product.[
                                product
                            ]
                        ],
                        agency_collaborator
                    ]`)
                    .findById(order_id);

        // Refund credits
        await models.Wallet.query()
                .update({
                    balance: Number(Math.round(order.total_amount * account.location.currency_conversion * 100) / 100) + Number(order.wallet.balance),
                })
                .where('id', order.wallet.id);

        return res.status(200).json({order: updated_order, success: 'Order successfully canceled'});

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const scanOrder = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {order_identifier} = req.params;

        const order = 
                await models.WalletOrder.query()
                        .withGraphFetched(`[
                            wallet
                        ]`)
                        .where('order_identifier', order_identifier)
                        .first();
        
        if (!order) return res.status(400).json('Invalid order').send();
        if (order.status !== 'CREATED') return res.status(400).json("Order can't be accepted").send();

        // Update order status 
        await models.WalletOrder.query()
            .update({ status: 'RECEIVED', scanned_by: account_id})
            .where('order_identifier', order_identifier);
        
        const updated_order = 
                await models.WalletOrder.query()
                    .withGraphFetched(`[
                        wallet,
                        transactions.[
                            event_product.[
                                product
                            ]
                        ],
                        agency_collaborator
                    ]`)
                    .where('order_identifier', order_identifier)
                    .first();


        return res.status(200).json({order: updated_order, success: 'Order successfully scanned'});

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// Handle Paypal purchase
const addCreditsWithPaypal = async (req, res, next) => {
    try {
        const { wallet_id } = req.params;
        const { amount, payment_type, paypal_order_id } = req.body;

        if (!wallet_id || !amount || !payment_type || !paypal_order_id)  return res.status(400).json('Invalid payment. Please contact support@boozeboss.co .').send();

        const wallet = await models.Wallet.query().findById(wallet_id);
        if (!wallet) return res.status(400).json('Invalid wallet id').send();

        // Create the wallet purchase 
        const wallet_purchase = 
                await models.WalletPurchase.query()
                        .insert({
                            wallet_id,
                            payment_type,
                            amount,
                            status: 'APPROVED', 
                            paypal_order_id
                        })

        // Add credits to account wallet 
        await models.Wallet.query()
                .update({
                    balance: Number(wallet.balance) + Number(amount)
                })
                .where('id', wallet.id);
        
        return res.status(200).json(`Thanks for your purchase! We added ${wallet_purchase.amount} to your wallet.`).send();
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// Handle Paypal purchase
const addCreditsWithQR = async (req, res, next) => {
    try {
        const { wallet_id } = req.params;
        const { amount, payment_type } = req.body;

        if (!wallet_id || !amount || !payment_type)  return res.status(400).json('Invalid payment. Please contact support@boozeboss.co .').send();

        const wallet = await models.Wallet.query().findById(wallet_id);
        if (!wallet) return res.status(400).json('Invalid wallet id').send();

        const qr_code = await crypto.randomBytes(16).toString('hex');

        // Create the wallet purchase 
        const wallet_purchase = 
                await models.WalletPurchase.query()
                        .insert({
                            wallet_id,
                            payment_type,
                            amount,
                            status: 'PENDING', 
                            qr_code 
                        })   
        
        return res.status(200).json({success: `Please scan and pay this code at the venue front desk to redeem your credits to your Wallet`, code: qr_code}).send();
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const approveCreditsWithQR = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {code} = req.params;
        const {event_id} = req.body;

        if (!account_id || !event_id || !code) return res.status(400).json('Missing fields').send();

        const wallet_purchase = 
            await models.WalletPurchase.query()
                    .withGraphFetched('[wallet]')
                    .where('qr_code', code)
                    .first();

        const event = 
            await models.Event.query().findById(event_id);

        // Validate the credits left with the current amount 
        if (wallet_purchase.amount > event.credits_left) return res.status(400).json('No credits left. Please use another method').send();
        // Validate the date
        if (new Date(event.ended_at).getTime() < new Date().getTime()) return res.status(400).json('Credits not available for this event').send();

        if (wallet_purchase.status !== 'PENDING') return res.status(400).json('This code has already been scanned').send();

        await models.WalletPurchase.query()
                .update({
                    status: 'APPROVED',
                    scanned_by: account_id,
                    event_id,
                })
                .where('qr_code', code)

        await models.Wallet.query()
                .update({
                    balance: wallet_purchase.wallet.balance + wallet_purchase.amount, 
                 })
                 .where('id', wallet_purchase.wallet.id)

        // Update Event fund
        await models.Event.query()
                .update({
                    credits_left:  Number(event.credits_left) - Number(wallet_purchase.amount)
                })
                .where('id', event_id);

        return res.status(200).json('Balance added succesfully').send();
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const getWalletPurchase = async (req, res, next) => {
    try {
        const {code} = req.params;
        
        const wallet_purchase =
                await models.WalletPurchase.query()
                        .where('qr_code', code)
                        .first();

        if (!wallet_purchase) return res.status(400).json('Invalid code').send();

        return res.status(200).send(wallet_purchase);
    

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const transferCredits = async (req, res, next) => {
    try {
        const { account_id } = req;
        const {amount, target_email} = req.body;

        // Validate the source wallet
        const source_wallet = await models.Wallet.query().where({account_id}).first();

        if (!source_wallet) return res.status(400).json('Invalid wallet').send();
        if (amount < 1) return res.status(400).json('Invalid transfer amount').send();
        if (amount > source_wallet.balance) return res.status(400).json('Insufficient balance').send();

        // Validate target wallet
        const target_account = 
            await models.Account.query()
                    .withGraphFetched('[wallet]')
                    .where({email: target_email})
                    .first();

        if (!target_account) return res.status(400).json('Invalid email').send();
        if (!target_account.wallet) return res.status(400).json('Invalid walet').send();

        // Transfer balances
        // Substract from source wallet 
        await models.Wallet.query()
                .update({
                    balance: Number(source_wallet.balance) - Number(amount),
                })
                .where({
                    id: source_wallet.id
                });
        
        // Add to target wallet
        await models.Wallet.query()
                .update({
                    balance: Number(target_account.wallet.balance) + Number(amount),
                })
                .where({
                    id: target_account.wallet.id
                });

        // Save the transfer log
        await models.TransferLog.query()
                .insert({
                    from_account_id: account_id,
                    to_account_id: target_account.id,
                    amount,
                })

        return res.status(200).json(`${amount} credits successfully transfered to ${target_email}`).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const addFundsToCollaboratorWallet = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {collaborator_account_id, credits_amount} = req.body;

        const sending_account = await models.Account.query().where({ id: account_id }).first();
        const collaborator_account = 
                    await models.Account.query()
                            .withGraphFetched(`[wallet]`)
                            .where({ id: collaborator_account_id})
                            .first();

        // Update the collaborator wallet balance
        const new_balance = Number(collaborator_account.wallet.balance) + Number(credits_amount);
        await models.Wallet.query()
                .update({
                    balance: new_balance > 0 ? new_balance : 0,
                })
                .where({
                    account_id: collaborator_account_id
                })
        
        // Add the transfeer log to the db
        await models.TransferLog.query()
                .insert({
                    from_account_id: sending_account.id,
                    to_account_id: collaborator_account.id,
                    amount: credits_amount
                })

        // Return message
        return res.status(200).json(`Successfully added ${credits_amount} to ${collaborator_account.email}`).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const getWalletActions = async (req, res, next) => {
    try {

        const {account_id} = req;

        // Get account wallet
        const wallet =
                await models.Wallet.query()
                        .where({account_id})
                        .first();
        
        // Get all the transfer logs sent or received
        const sent_transfer_logs = 
            await models.TransferLog.query()
                    .withGraphFetched(`[
                        target_account
                    ]`)
                    .where({
                        from_account_id: account_id,
                    });
        
        const received_transfer_logs = 
            await models.TransferLog.query()
                    .withGraphFetched(`[
                        source_account
                    ]`)
                    .where({
                        to_account_id: account_id,
                    });

        // Get wallet purchases
        const wallet_purchases = 
            await models.WalletPurchase.query()
                    .withGraphFetched(`[
                        event.[
                            brief_event
                        ]
                    ]`)
                    .where({
                        wallet_id: wallet.id,
                    })

        // Get wallet orders 
        const wallet_orders =
            await models.WalletOrder.query()
                    .withGraphFetched(`[
                        event.[
                            brief_event
                        ]
                    ]`)
                    .where({
                        wallet_id: wallet.id
                    })

        // Normalize all actions into a single object
        const actions = [];

        sent_transfer_logs.map(transfer_log => {
            actions.push({
                ...transfer_log,
                action: 'SENT_TRANSFER',
            })
        })

        received_transfer_logs.map(transfer_log => {
            actions.push({
                ...transfer_log,
                action: 'RECEIVED_TRANSFER',
            })
        })

        wallet_purchases.map(wallet_purchase => {
            actions.push({
                ...wallet_purchase,
                action: 'PURCHASE'
            });
        })

        wallet_orders.map(wallet_order => {
            actions.push({
                ...wallet_order,
                action: 'ORDER'
            })
        });

        // Order the transactions in order
        const ordered_actions = 
            actions.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        return res.status(200).send(ordered_actions)

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
} 

const walletController = {
    createOrder,
    getOrder,
    cancelOrder,
    scanOrder,
    addCreditsWithPaypal,
    addCreditsWithQR, 
    approveCreditsWithQR,
    getWalletPurchase, 
    transferCredits,
    addFundsToCollaboratorWallet,
    getWalletActions
}

export default walletController;