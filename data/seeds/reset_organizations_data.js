const config = require('../organizations_data');

exports.seed = async (knex) => {

    /* REMOVE CLIENT */
    // Remove clients
    for (let config_client of config.CLIENTS) {

        const client = await knex('clients').where({name: config_client.client_data.name}).first();
        
        if (client) {
                for (let agency of config_client.agencies) {            
                // Delete accounts and collaborators.
                const db_agency = await knex('agencies').where({name: agency.agency_data.name}).first();
                
                if (db_agency) {

                        const collaborators = await knex('collaborators').where({ agency_id: db_agency.id });
                        const account_ids = await collaborators.map(collaborator => collaborator.account_id);

                        await knex('accounts')
                                .whereIn('id', account_ids);

                        await knex('collaborator_invitations')
                                        .where({agency_id: db_agency.id})
                                        .del();

                        await knex('collaborators')
                                        .where({agency_id: db_agency.id})
                                        .del();

                        await knex('accounts')
                                .whereIn('id', account_ids)
                                .del();

                        // Remove agency
                        await knex('agencies')
                                .where({
                                        name: agency.agency_data.name,
                                        contact_email: agency.agency_data.contact_email,
                                })
                                .del();  
                }
                
                }

                // Remove Warehouses
                await knex('warehouses')
                        .where({ client_id: client.id})
                        .del();

                
                // Remove Brands 
                await knex('brands')
                        .where({client_id: client.id})
                        .del();
                
                // Remove venues 
                await knex('venues')
                        .where({created_by: client.id})
                        .del();

                // Remove collaborators
                const client_collaborators = await knex('collaborators').where({ client_id: client.id });
                const account_ids = client_collaborators.map(cc => cc.account_id);

                await knex('collaborator_invitations')
                                .where({client_id: client.id})
                                .del();

                await knex('collaborators')
                        .where({client_id: client.id})
                        .del();
                
                await knex('wallets')
                        .whereIn('account_id', account_ids)
                        .del();

                await knex('accounts')
                        .whereIn('id', account_ids)
                        .del();

                // Remove config_client
                await knex('clients')
                        .where({
                        name: config_client.client_data.name,
                        description: config_client.client_data.description
                        })
                        .del();
                }
        }

    /* REMOVE ORGANIZATION */
    // Fetch organization
    const organization =
        await knex('regional_organizations')
                .where({name: config.ORGANIZATION_NAME})
                .first();
    
    // Delete all related regional organization locations
    await knex('regional_organization_locations')
            .where({regional_organization_id: organization.id})
            .del();

    // Delete accounts and collaborators.
    const organization_collaborators = await knex('collaborators').where({ regional_organization_id: organization.id });
    const account_ids = await organization_collaborators.map(oc => oc.account_id);
    
    await knex('collaborator_invitations')
        .where({regional_organization_id: organization.id})
        .del();

    await knex('collaborators')
            .whereIn('account_id', account_ids)
            .del();
    
    await knex('wallets')
            .whereIn('account_id', account_ids)
            .del();

    await knex('accounts')
            .whereIn('id', account_ids)
            .del();

    // Delete organization
    await knex('regional_organizations')
            .where({id: organization.id})
            .del();

};
