const config = require('../populate_config');

exports.seed = async (knex) => {
  /* REGIONAL ORGANIZATION */

  // Create Organization
  const organization_id = 
      await knex('regional_organizations')
          .insert({
            name: config.ORGANIZATION_NAME,
            description: config.ORGANIZATON_DESCRIPTION,
            contact_email: config.ORGANIZATION_CONTACT_EMAIL,
            expiration_date: config.EXPIRATION_DATE,
            locations_limit: config.LOCATIONS_LIMIT,
          })
          .returning('id')

  // Create Organization Locations
  for (const location_name of config.ORGANIZATION_LOCATIONS) {
      // Get the location id and add the regional location organization
      const location = await knex('locations').where({name: location_name}).first();
      if (location) {
        const is_primary_location = config.ORGANIZATION_LOCATIONS.indexOf(location_name) < 1;
        await knex('regional_organization_locations')
                .insert({
                  location_id: location.id,
                  regional_organization_id: Number(organization_id),
                  is_primary_location,
                })
      }
  }
}; 
