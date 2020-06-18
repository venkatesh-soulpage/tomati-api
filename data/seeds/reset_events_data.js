const config = require('../organizations_data');

exports.seed = async (knex) => {
    for (const config_client of config.CLIENTS) {
      // Get data
      const client = await knex('clients').where({name: config_client.client_data.name}).first();
    
      // Convert brief events into actual event
      // 1 - Get the briefs
      const briefs = await knex('briefs').where({client_id: client.id});
      // Iterate through all the briefs and get the brief events
      for (const brief of briefs) {
        // Get the brief events
        const brief_events = await knex('brief_events').where({brief_id: brief.id});
        // Iterate through all the brief_events and create an actual event
        for (const brief_event of brief_events) {
          // Create a event for each brief event
          
          // Delete all accounts and event guests related to this event
          const event_guests = await knex('event_guests').where({brief_event_id: brief_event.id});
          const account_ids = event_guests.map(eg => eg.account_id);

          // Delete all guests
          await knex('event_guests')
                  .where({brief_event_id: brief_event.id})
                  .del();
            
          // Delete all accounts
          await knex('accounts')
                  .whereIn('id', account_ids)
                  .del();

          await knex('events')
                  .where({brief_event_id: brief_event.id})
                  .del();
        }
      }
    }
};
