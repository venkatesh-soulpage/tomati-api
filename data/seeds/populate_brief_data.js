const faker = require('faker');
const config = require('../organizations_data');

exports.seed = async (knex) => {
  // Create random briefs for each client
  for (const config_client of config.CLIENTS) {
    // Find the client 
    const client = await knex('clients').where({name: config_client.client_data.name}).first();
    // Get the first agency
    const agency = await knex('agencies').where({invited_by: client.id}).first();
    // Get the first collaborator
    const collaborator = 
      await knex('collaborators')
              .where({client_id: client.id})
              .join('accounts', {'collaborators.account_id': 'accounts.id'})
              .first();

    // Add 3 briefs to each client
    const briefs = [];
    for (let i = 0; i < 5; i++) {
      const brief = {
        client_id: client.id,
        created_by: collaborator.account_id,
        agency_id: agency.id,
        name: faker.lorem.words(),
        description: faker.lorem.sentence(),
        status: 'APPROVED',
      }
      briefs.push(brief);
    }

    // Add briefs to database
    const briefs_id = 
        await knex('briefs')
                .insert(briefs)
                .returning('id')

    console.log(briefs_id);

  }
};
