const config = require('../populate_config');

exports.seed = async (knex) => {
    
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
