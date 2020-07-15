const config = require('../organizations_data');

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  for (const config_client of config.CLIENTS) {

    // Find the client 
    const client = await knex('clients').where({name: config_client.client_data.name}).first();
    // Get the first agency
    
    if (client) {

        const agency = await knex('agencies').where({invited_by: client.id}).first();
        // Get the briefs id for this client
        if (agency) {
                const briefs = 
                        await knex('briefs')
                                .where({
                                client_id: client.id,
                                agency_id: agency.id,
                                })

                const briefs_ids = briefs.map(brief => brief.id);

                // Remove brief brands
                await knex('brief_brands')
                        .whereIn('brief_id', briefs_ids)
                        .del();
                
                // Remove brief brands
                const brief_events = 
                        await knex('brief_events')
                                .whereIn('brief_id', briefs_ids)

                // Delete all related events
                const brief_event_ids = 
                                brief_events.map(brief_event => brief_event.id);

                        const events =
                                await knex('events')
                                        .whereIn('brief_event_id', brief_event_ids)
                                
                        const event_ids = 
                                events.map(event => event.id);

                        await knex('event_funding_logs')
                                .whereIn('event_id', event_ids)
                                .del();
                        
                        await knex('event_guests')
                                .whereIn('event_id', event_ids)
                                .del();
                        
                        await knex('event_free_drinks_conditions')
                                .whereIn('event_id', event_ids)
                                .del();
                        
                        await knex('event_products')
                                .whereIn('event_id', event_ids)
                                .del();

                                
                        await knex('events')
                                .whereIn('brief_event_id', brief_event_ids)
                                .del();
                
                // Remove brief brands
                await knex('brief_events')
                        .whereIn('brief_id', briefs_ids)
                        .del();
                        
                // Remove actual briefs
                await knex('briefs')
                        .whereIn('id', briefs_ids)
                        .del()
                }
        }

  }
};
