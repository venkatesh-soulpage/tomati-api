const config = require('../organizations_data');

exports.seed = async (knex) => {
    for (const config_client of config.CLIENTS) {
      // Get data
      const client = await knex('clients').where({name: config_client.client_data.name}).first();
      const warehouses = await knex('warehouses').where({client_id: client.id});
      const warehouse_ids = warehouses.map(wh => wh.id);
    
      await knex('warehouse_stocks') 
              .whereIn('warehouse_id', warehouse_ids)
              .del();
    }
};
