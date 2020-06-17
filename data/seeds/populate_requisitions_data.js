const config = require('../organizations_data');
const faker = require('faker');

exports.seed = async (knex) => {
    // Iterate through clients
    for (const config_client of config.CLIENTS) {
      // Get client
      const client = await knex('clients').where({name: config_client.client_data.name}).first();
      // Get briefs
      const briefs = 
              await knex('briefs')
                      .where({client_id: client.id});

      // Create a requisition for each brief 
      let index = 1;
      for (const brief of briefs) {
        
        // Create requisition
        await knex('requisitions')
                .insert({
                  brief_id: brief.id,
                  status: 'APPROVED',
                  serial_number: client.requisition_current_serial + index,
                })
          
        // Update client serial number
        await knex('clients')
                .update({requisition_current_serial: client.requisition_current_serial + index})
                .where({id: client.id});

        index++;
      }
    }
};
