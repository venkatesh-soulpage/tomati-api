const config = require('../organizations_data');

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  for (const config_client of config.CLIENTS) {
    // Find the client 
    const client = await knex('clients').where({name: config_client.client_data.name}).first();
    // Get the first agency
    const agency = await knex('agencies').where({invited_by: client.id}).first();

    await knex('briefs')
            .where({
              client_id: client.id,
              agency_id: agency.id,
            })
            .del();
  }
};
