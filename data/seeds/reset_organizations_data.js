const config = require('../organizations_data');

exports.seed = async (knex) => {

    /* REMOVE CLIENT */
    // Remove clients
    for (let config_client of config.CLIENTS) {

        const client = await knex('clients').where({name: config_client.client_data.name}).first();
        
        for (let agency of config_client.agencies) {            
            // Delete accounts and collaborators.
            const db_agency = await knex('agencies').where({name: agency.agency_data.name}).first();
            const collaborator_emails = agency.collaborators.map(collaborator => collaborator.account.email);
            
            if (db_agency) {
                const accounts = 
                    await knex('accounts')
                            .whereIn('email', collaborator_emails);

                const account_ids = accounts.map(account => account.id);

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
        const collaborator_emails = config_client.collaborators.map(collaborator => collaborator.account.email);
        const accounts = 
            await knex('accounts')
                    .whereIn('email', collaborator_emails);

        const account_ids = accounts.map(account => account.id);

        await knex('collaborator_invitations')
                        .where({client_id: client.id})
                        .del();

        await knex('collaborators')
                .where({client_id: client.id})
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
    const collaborator_emails = config.ORGANIZATION_COLLABORATORS.map(collaborator => collaborator.account.email);
    
    const accounts = 
            await knex('accounts')
                    .whereIn('email', collaborator_emails);

    const account_ids = accounts.map(account => account.id);

    await knex('collaborators')
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
