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

        const total_amount = 
            event_products.reduce((acc, curr) => {
                return acc + curr.price;
            }, 0);
            
        if (wallet.balance < total_amount) return res.status(400).json("Insufficicent balance").send();

        // If the wallet has enough balance procced to complete the order.
        const order_identifier = randomString(10); 
        const wallet_order = 
            await models.WalletOrder.query()
                    .insert({
                        wallet_id,
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
                    balance: wallet.balance - total_amount
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
                    balance: Number(order.total_amount) + Number(order.wallet.balance),
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
        
        return res.status(200).json(`Successfully added ${wallet_purchase.amount} to your Wallet`).send();
        
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

        const code = await crypto.randomBytes(16).toString('hex');

        // Create the wallet purchase 
        const wallet_purchase = 
                await models.WalletPurchase.query()
                        .insert({
                            wallet_id,
                            payment_type,
                            amount,
                            status: 'PENDING', 
                            code 
                        })   
        
        return res.status(200).json({success: `Please scan this at the venue front desk to redeem your credits to your Wallet`, code}).send();
        
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const approveCreditsWithQR = async (req, res, next) => {
    try {
        const {account_id} = req;
        const {event_id, code} = req.body;

        if (!account_id || !event_id || !code) return res.status(400).json('Missing fields').send();

        const wallet_purchase = 
            await models.WalletPurchase.query()
                    .withGraphFetched('[wallet]')
                    .where('code', code)
                    .first();

        if (wallet_purchase.status === 'PENDING') return res.status(400).json('This code has already been scanned').send();

        await models.WalletPurchase.query()
                .update({
                    status: 'APPROVED',
                    scanned_by: account_id,
                    event_id,
                })

        await models.Wallet.query()
                .update({
                    balance: Number(wallet_purchase.wallet.balance) + Number(wallet_purchase.amount), 
                 })
                 .where('id', wallet_purchase.wallet.id)

        return res.status(200).json('Balance added succesfully').send();
        
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
    approveCreditsWithQR
}

export default walletController;