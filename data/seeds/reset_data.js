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

    // Delet organization
    await knex('regional_organizations')
            .where({id: organization.id})
            .del();

};
