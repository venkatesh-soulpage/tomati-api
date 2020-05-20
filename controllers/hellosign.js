import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';
import AWS from 'aws-sdk';

// Hellosign 
const hellosign = require('hellosign-sdk')({ key: process.env.HELLOSIGN_API_KEY });

const submitPDF = async (requisition, res) => {

    // Find the brand owner
    const brand_owner = requisition.client.client_collaborators.find(collaborator => collaborator.role.name === 'OWNER');
      
    const opts = {
        test_mode: 1,
        clientId: process.env.HELLOSIGN_CLIENT_ID,
        subject: `ACTION NEEDED - Requisition #${requisition.serial_number}`,
        message: 'Please sign this requisition.',
        signers: [
            {
             email_address: brand_owner.account.email,
             name: `${brand_owner.account.first_name} ${brand_owner.account.last_name}`
            }
        ],
        files: [`temporal/${requisition.client.id}_${requisition.serial_number}.pdf`]
    };
    
    return await hellosign.signatureRequest.createEmbedded(opts).then((res) => {
        const signature = res.signature_request.signatures[0];
        const signatureId = signature.signature_id;
      
        return hellosign.embedded.getSignUrl(signatureId);
    }).then((res) => {
        return res.embedded.sign_url;
    }).catch((err) => {
    // handle error
        return res.status(500).json(err).send();
    });
}

export {
    submitPDF
}