const config = require('../organizations_data');

exports.seed = async (knex) => {
  // Delete requisitions and reset current requisition
  for (const config_client of config.CLIENTS) {
    const client = await knex('clients').where({name: config_client.client_data.name}).first();

    if (client) {
        // Update current requisition serial
        await knex('clients')
                .update({requisition_current_serial: 100000})
                .where({id: client.id});

        // Get briefs to delete requisition
        const briefs =
                await knex('briefs')
                .where({client_id: client.id});

        const briefs_ids = briefs.map(brief => brief.id);
        
        const requisitions = 
        await knex('requisitions')
                .whereIn('brief_id', briefs_ids)

        const requisition_ids = requisitions.map(req => req.id);

        const requisition_deliveries =
                await knex('requisition_deliveries')
                        .whereIn('requisition_id', requisition_ids)
                
        const requisition_deliveries_ids = 
                requisition_deliveries.map(req_del => req_del.id);

        // Delete requisition delivereis
        await knex('requisition_delivery_products')
                .whereIn('requisition_delivery_id', requisition_deliveries_ids)
                .del() 
        
        await knex('requisition_deliveries')
                .whereIn('requisition_id', requisition_ids)
                .del()
        
        await knex('requisition_orders')
                .whereIn('requisition_id', requisition_ids)
                .del();

        await knex('requisitions')
                .whereIn('id', requisition_ids)
                .del();
        }  
              
        }
};
