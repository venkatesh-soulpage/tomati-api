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
        const {wallet_id, transactions} = req.body;

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

        if (wallet_order) return res.status(400).json('Error creating the wallet order').send();

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
        return res.status(200).json(`Successfully created order with identifier: ${order_identifier}`).send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }


}

const walletController = {
    createOrder,
}

export default walletController;