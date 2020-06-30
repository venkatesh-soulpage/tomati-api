const config = require('../organizations_data');

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  for (const config_client of config.CLIENTS) {

    // Find the client 
    const client = await knex('clients').where({name: config_client.client_data.name}).first();
    // Get the first agency
    const agency = await knex('agencies').where({invited_by: client.id}).first();

    if (client && agency) {

        // Get the briefs id for this client
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
        await knex('brief_events')
                .whereIn('brief_id', briefs_ids)
                .del();
                
        // Remove actual briefs
        await knex('briefs')
                .whereIn('id', briefs_ids)
                .del()
    }

  }
};
