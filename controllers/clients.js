import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import async from 'async'
import fetch from 'node-fetch';
import queryString from 'query-string';

import { sendConfirmationEmail, sendFotgotPasswordEmail } from './mailling';

// POST - Create a new client organization and send an email to the client
const inviteClient = async (req, res, next) => {
    try {
        /* Todo add client organization logic */
        return res.status(201).send()
    } catch (e) {
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const clientController = {
    // Client
    inviteClient
}

export default clientController;