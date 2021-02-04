const faker = require('faker');
const config = require('../organizations_data');

// Organization Expiration Date
const getTime = (days) => {
  let date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}


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
              .first();

    // Add 3 briefs to each client
    const briefs = [];
    for (let i = 0; i < 5; i++) {
      const brief = {
        client_id: client.id,
        created_by: collaborator.id,
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

    
    // Add brands to brief
    // Get brands 
    const brands = 
            await knex('brands')
                    .where({client_id: client.id});

    for (const brief_id of briefs_id) {
      // Add brands to brief events
      for (const brand of brands) {
        await knex('brief_brands')
                .insert({
                  brief_id,
                  brand_id: brand.id,
                  limit: 100,
                })
      }
    }

    // Start adding brief events
    for (const brief_id of briefs_id) {
      // Add randomness to brief events
      const brief_events_amount = Math.floor(Math.random() * 3) + 1;
      // Iterate through each brief 
      for (let event_counter = 0; event_counter < brief_events_amount; event_counter++) {

        const venue = await knex('venues').where({created_by: client.id}).first();

        const brief_event = {
          brief_id, 
          setup_time: getTime(2),
          start_time: getTime(3),
          end_time: getTime(4),
          recee_required: true,
          recee_time: getTime(1),
          expected_guests: 250,
          hourly_expected_guests: 30,
          drinks_enabled: true,
          cocktails_enabled: true,
          cocktails_per_guest: 10,
          free_drinks_enabled: true,
          free_drinks_per_guest: 10,
          name: faker.lorem.words(),
          cash_collected_by: 'AGENCY',
          comments: faker.lorem.sentence(),
          status: 'CURRENT',
          venue_id: venue.id,
        }

        await knex('brief_events')
                .insert(brief_event)
      }
    }

  }
};
