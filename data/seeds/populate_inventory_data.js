const config = require('../organizations_data');
const faker = require('faker');

const alternatives = ['Alternative A', 'Alternative B', 'Alternative C'];
const seed_mixers = [
  {
    name: 'Soda',
    product_subtype: 'SODA'
  }, 
  {
    name: 'Packed Juice',
    product_subtype: 'PACKED_JUICE'
  }, 
  {
    name: 'Fresh Juice',
    product_subtype: 'FRESH_JUICE'
  }
]


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.seed = async (knex) => {
  // Add products
  for (const config_client of config.CLIENTS) {
      // Get client
      const client = await knex('clients').where({name: config_client.client_data.name}).first();

      const warehouses = await knex('warehouses').where({client_id: client.id});

      const products = await knex('products')
                              .where({
                                client_id: client.id,
                                is_cocktail: false,
                              })

      for (const warehouse of warehouses) {
        for (const product of products) {
          await knex('warehouse_stocks')
                  .insert({
                    warehouse_id: warehouse.id,
                    product_id: product.id,
                    quantity: 100,
                  })
        }
      }
    
  }
};
