import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';
import AWS from 'aws-sdk';

// Inititialize AWS 
const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.BUCKETEER_AWS_REGION,
  });


// POST - Verification
const uploadVerificationProcess = async (req, res, next) => {
    try {    
        const {account_id} = req;
        const { verification_type} = req.params;
    
        const {file} = req.files;

        const key = `public/verification/${account_id}/${verification_type}/${file.name}`

        let params = {
            Key: key,
            Bucket: process.env.BUCKETEER_BUCKET_NAME,
            Body: file.data,
        }

        await s3.putObject(params, async (err, data) => {
            if (err) {
                console.log(err, err.stack).send();
                return res.status(400).json('Upload failed').send();
            } else {
                
                await models.VerificationAttachment.query()
                    .insert({
                        account_id,
                        url: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
                        file_name: file.name,
                        file_type: file.mimetype,
                        verification_type,
                    })

                return res.status(200).json('Verification successfully uploaded').send();
            }
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}




const verificationController = {
    // Verification
    uploadVerificationProcess,
}

export default verificationController;