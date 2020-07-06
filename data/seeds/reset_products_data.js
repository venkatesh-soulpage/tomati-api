const config = require('../organizations_data');

exports.seed = async (knex) => {

  for (const config_client of config.CLIENTS) {
      // Get client
      const client = await knex('clients').where({name: config_client.client_data.name}).first();

      if (client) {
                const products = 
                        await knex('products')
                                .where({client_id: client.id});

                const products_ids = products.map(product => product.id);

                await knex('product_ingredients')
                        .whereIn('product_parent_id', products_ids)
                        .del();

                // Delete products
                await knex('products')
                        .where({client_id: client.id})
                        .del();
      }
      
  }
};
