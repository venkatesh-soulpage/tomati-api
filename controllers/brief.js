import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';
import AWS from 'aws-sdk';

// Hellosign 
const hellosign = require('hellosign-sdk')({ key: process.env.HELLOSIGN_API_KEY });


// Inititialize AWS 
const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
    region: process.env.BUCKETEER_AWS_REGION,
  });




// GET - Get briefs
const getBriefs = async (req, res, next) => {
    try {    
        
        const {scope, account_id} = req;

        // Validate the collaborators
        let collaborator;
        let client;

        // If client query client collaborators
        if (scope === 'REGION') {
            collaborator = 
                await models.Collaborator.query()
                    .withGraphFetched('[account]')
                    .where('account_id', account_id)
                    .first();

            client =
                await models.Client.query()
                        .where({
                            regional_organization_id: collaborator.regional_organization_id,
                            location_id: collaborator.account.location_id,
                        })
                        .first();
        }

        // If client query client collaborators
        if (scope === 'BRAND') {
            const client_collaborators = 
                        await models.ClientCollaborator.query()
                            .where('account_id', account_id);

            collaborator = client_collaborators[0];
        } 

        // If agency bring Agency collaborators with client graph
        if (scope === 'AGENCY') {
                const agency_collaborators = 
                        await models.AgencyCollaborator.query()
                            .where('account_id', account_id)
                            .withGraphFetched('[client]')
                            
            collaborator = agency_collaborators[0];
        }

        
        if (!collaborator) return res.status(400).json('Invalid collaborator').send();

        // Fetch the brief
        const briefs = 
            await models.Brief.query()
                .withGraphFetched(`
                    [
                        client,
                        brief_events.[
                            venue
                        ], 
                        brands.[
                            brand
                        ],
                        attachments, 
                        agency,
                        requisition
                    ]`
                )
                .modify((queryBuilder) => {
                    if (scope === 'REGION') {
                        return queryBuilder.where('client_id', client ? client.id : 0);
                    }
                    if (scope === 'BRAND') {
                        return queryBuilder.where('client_id', collaborator.client_id)
                    }
                    if (scope === 'AGENCY') {
                        return queryBuilder
                            .where('client_id', collaborator.client.id)
                            .where('agency_id', collaborator.agency_id)
                            .whereNotIn('status', ['DRAFT']);
                    }
                }) 
                .modifyGraph('client', builder => {
                    builder.select('brief_attachment_limits');
                })
                .orderBy('created_at', 'desc')
                

        // Send the briefs
        return res.status(200).send(briefs);

    } catch (e) {
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Create a new brief
const createBrief = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {name, description, agency_id} = req.body;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator');

        // Create the brief
        const new_brief = 
            await models.Brief.query()
                .insert({
                    client_id: collaborator.client_id,
                    created_by: collaborator.id,
                    agency_id: agency_id,
                    name,
                    description,
                    status: 'DRAFT',
                })
                .withGraphFetched('[brief_events.[venue], agency]')

        // Send the clients
        return res.status(200).send(new_brief);

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// POST - Create a new brief event
const addBriefEvent = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;
        const { 
            name,
            setup_time,
            start_time, 
            end_time, 
            recee_required,
            recee_time,
            expected_guests,
            hourly_expected_guests,
            cocktails_enabled,
            cocktails_per_guest,
            drinks_enabled,
            free_drinks_enabled,
            free_drinks_per_guest,
            cash_collected_by,
            comments,
            status,
            enabled, 
            parent_brief_event_id,
            venue_id,
        } = req.body;

        // Validate that brief exists
        const brief = await models.Brief.query().findById(brief_id).withGraphFetched('[brief_events.[venue], agency]');
        if (!brief) return res.status(400).send('Invalid brief');

        // Validate Brief SLA terms
        const sla_limit = (new Date()).setHours((new Date()).getHours() + brief.agency.sla_hours_before_event_creation);
        if (new Date(setup_time).getTime() < sla_limit || new Date(start_time).getTime() < sla_limit || new Date(end_time).getTime() < sla_limit) {
            return res.status(400).json('Invalid times').send();
        } 

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief event
        const new_brief_event =
            await models.BriefEvent.query()
                .insert({
                    name,
                    brief_id,
                    setup_time,
                    start_time, 
                    end_time,
                    recee_required,
                    recee_time,
                    expected_guests,
                    hourly_expected_guests,
                    cocktails_enabled,
                    cocktails_per_guest,
                    drinks_enabled,
                    free_drinks_enabled,
                    free_drinks_per_guest,
                    cash_collected_by,
                    comments, 
                    status,
                    enabled,
                    parent_brief_event_id,
                    venue_id,
                })

        return res.status(201).json('Event created succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// PUT - Update brief event
const updateBriefEvent = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id, brief_event_id} = req.params;
        const { 
            name,
            setup_time,
            start_time, 
            end_time, 
            recee_required,
            recee_time,
            expected_guests,
            hourly_expected_guests,
            cocktails_enabled,
            cocktails_per_guest,
            drinks_enabled,
            free_drinks_enabled,
            free_drinks_per_guest,
            cash_collected_by,
            comments,
            status,
            enabled, 
            parent_brief_event_id,
            venue_id,
        } = req.body;

        // Validate that brief exists
        const brief_events = 
            await models.BriefEvent.query()
                .withGraphFetched('[brief]')
                .where('id', brief_event_id);
                
        if (!brief_events || (brief_events.length < 1) || (brief_events[0].brief.id !== Number(brief_id))) return res.status(400).json('Invalid brief').send();

        // Validate Brief SLA terms
        /* const sla_limit = (new Date()).setHours((new Date()).getHours() + brief.agency.sla_hours_before_event_update);
        if (new Date(setup_time).getTime() < sla_limit || new Date(start_time).getTime() < sla_limit || new Date(end_time).getTime() < sla_limit) {
            return res.status(400).json('Invalid times').send();
        } */

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief event
            await models.BriefEvent.query()
                .update({
                    name,
                    brief_id,
                    setup_time,
                    start_time, 
                    end_time,
                    recee_required,
                    recee_time,
                    expected_guests,
                    hourly_expected_guests,
                    cocktails_enabled,
                    cocktails_per_guest,
                    drinks_enabled,
                    free_drinks_enabled,
                    free_drinks_per_guest,
                    cash_collected_by,
                    comments, 
                    status,
                    enabled,
                    parent_brief_event_id,
                    venue_id,
                })
                .where('id', brief_event_id);

        return res.status(201).json('Event updated succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Delete brief event
const deleteBriefEvent = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id, brief_event_id} = req.params;

        // Validate that brief exists
        const brief_events = 
            await models.BriefEvent.query()
                .withGraphFetched('[brief]')
                .where('id', brief_event_id);
                
        if (!brief_events || (brief_events.length < 1) || (brief_events[0].brief.id !== Number(brief_id))) return res.status(400).json('Invalid brief').send();

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief event
            await models.BriefEvent.query().deleteById(brief_event_id);

        return res.status(201).json('Event deleted succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Create a new brief event
const addBriefBrand = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;
        const { brand_id, limit } = req.body;

        // Validate that brief exists
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).send('Invalid brief');

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief product
        await models.BriefBrand.query()
                .insert({
                    brief_id,
                    brand_id,
                    limit
                })

        return res.status(201).json('Brief brand added succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Create a new brief event
const deleteBriefBrand = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id, brief_brand_id} = req.params;

        // Validate that brief exists
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).send('Invalid brief');

        // Validate that the event is created by a collaborator of the organization
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];
        if (!collaborator) return res.status(400).send("You don't have permissions to edit this brief");
        
        // Create brief product
        await models.BriefBrand.query()
                .deleteById(brief_brand_id)

        return res.status(201).json('Brief brand deleted succesfully').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Delete a brief
const deleteBrief = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator');

        // Validate if the collaborator is able to delete the brief
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).json('Invalid brief').send();
        if (brief.client_id !== collaborator.client_id) return res.status(401).json("You don't have permissions to delete this brief").send();

    
        // Delete the brief
        await models.Brief.query().deleteById(brief_id);

        // Send the clients
        return res.status(200).json('Deleted').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}


// DELETE - Delete a brief
const updateBriefStatus = async (req, res, next) => {
    
    try {    
        const {account_id} = req;
        const {brief_id} = req.params;
        const {status} = req.body;

        // Validate the collaborator
        const client_collaborators = 
            await models.ClientCollaborator.query()
                .where('account_id', account_id);

        const collaborator = client_collaborators[0];

        if (!collaborator) return res.status(400).json('Invalid collaborator');

        // Validate if the collaborator is able to delete the brief
        const brief = await models.Brief.query().findById(brief_id);
        if (!brief) return res.status(400).json('Invalid brief').send();
        if (brief.client_id !== collaborator.client_id) return res.status(401).json("You don't have permissions to delete this brief").send();
    
        // Delete the brief
        await models.Brief.query()
            .update({status})
            .where('id', brief_id);

        // Send the clients
        return res.status(200).json('Brief status updated').send();

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// POST - Upload a brief attachment
const uploadBriefAttachment = async (req, res, next) => {
    
    try {    
        const {brief_id} = req.params;
    
        const {file} = req.files;

        const key = `public/briefs/${brief_id}/${file.name}`

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
                
                await models.BriefAttachment.query()
                    .insert({
                        brief_id,
                        url: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
                        file_name: file.name,
                        file_type: file.mimetype,
                        size: file.size,
                    })

                return res.status(200).json('Attachment successfully uploaded').send();
            }
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// DELETE - Delete a brief attachment
const deleteBriefAttachment = async (req, res, next) => {
    
    try {    
        const {brief_id, brief_attachment_id} = req.params;

        const brief_attachments = 
            await models.BriefAttachment.query()
                    .where('brief_id', brief_id)
                    .where('id', brief_attachment_id);
    
        const brief_attachment = brief_attachments[0];
        
        s3.deleteObject({
            Key: `public/briefs/${brief_id}/${brief_attachment.url.replace('https://s3.amazonaws.com/', '')}`,
            Bucket: process.env.BUCKETEER_BUCKET_NAME,
        }, 
        async (err, data) => {
            if (err) return res.status(400).json('Unable to remove attachment').send();
            
            await models.BriefAttachment.query()
                .deleteById(brief_attachment.id);

            return res.status(200).json('Attachment removed').send();
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

// Create hellosign doc 
const getHelloSignUrl = async (req, res, next) => {
    try {

          const opts = {
            test_mode: 1,
            clientId: process.env.HELLOSIGN_CLIENT_ID,
            template_id: 'dc087da5cce2513aa4480f0787973e7f6ee17730',
            title: 'embedded draft test',
            subject: 'embedded draft test',
            message: 'embedded draft test',
            signing_redirect_url: 'http://example.com/signed',
            requesting_redirect_url: 'http://example.com/requested',
          
            signers: [
              {
                email_address: 'irvollo@gmail.com',
                name: 'Alice',
                role: 'BRAND',
                pin: 'abcd1234'
              },
              {
                email_address: 'irvollo@gmail.com',
                name: 'Bob',
                role: 'AGENCY',
                pin: 'abcd1234'
              }
            ],
            requester_email_address: 'irvollo@gmail.com'
          };
          
          hellosign.unclaimedDraft.createEmbeddedWithTemplate(opts).then((hellosign_res) => {
            // handle response
            console.log(hellosign_res);
            return res.status(200).json(hellosign_res).send();
          }).catch((err) => {
            // handle error
            console.log(err);
            return res.status(500).json(JSON.stringify(err)).send();
          });

    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}





const briefController = {
    getBriefs,
    createBrief,
    addBriefEvent,
    updateBriefEvent,
    deleteBriefEvent,
    addBriefBrand,
    deleteBriefBrand,
    deleteBrief,
    updateBriefStatus,
    uploadBriefAttachment,
    deleteBriefAttachment,
    getHelloSignUrl
}

export default briefController;