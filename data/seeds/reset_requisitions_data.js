const config = require('../organizations_data');

exports.seed = async (knex) => {
  // Delete requisitions and reset current requisition
  for (const config_client of config.CLIENTS) {
    const client = await knex('clients').where({name: config_client.client_data.name}).first();

    // Update current requisition serial
    await knex('clients')
          .update({requisition_current_serial: 100000})
          .where({id: client.id});

    // Get briefs to delete requisition
    const briefs =
        await knex('briefs')
            .where({client_id: client.id});

    const briefs_ids = briefs.map(brief => brief.id);
    
    await knex('requisitions')
            .whereIn('brief_id', briefs_ids)
            .del();
  }  
};
