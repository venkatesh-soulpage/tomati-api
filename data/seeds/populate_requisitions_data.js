const config = require('../organizations_data');
const faker = require('faker');

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var randomSample = function(arr,num){ return arr.map(a => [a,Math.random()]).sort((a,b) => {return a[1] < b[1] ? -1 : 1;}).slice(0,num).map(a => a[0]); }

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

        const brief_brands = 
        await knex('brief_brands')
                .where({brief_id: brief.id });

        const brief_brands_id = brief_brands.map(brief_brand => brief_brand.brand_id);
        
        // Create requisition
        const requisition_id = 
          await knex('requisitions')
                  .insert({
                    brief_id: brief.id,
                    status: 'APPROVED',
                    serial_number: client.requisition_current_serial + index,
                  })
                  .returning('id');
              
        // Add random requisition orders
        // Get products 
        const products = 
          await knex('products')
                .where({
                  client_id: client.id,
                  is_cocktail: false
                })
                .where(function() {
                  this
                    .whereIn('brand_id', brief_brands_id)
                    .orWhere('product_type', '!=', 'PRODUCT') 
                });

        const brief_events =
            await knex('brief_events') 
                    .where({brief_id: brief.id});
            
        // Add products to each brief event 
        for (const brief_event of brief_events) {
           const random_products = randomSample(products, 5);
           for (const random_product of random_products) {
             await knex('requisition_orders')
                    .insert({
                      requisition_id: Number(requisition_id),
                      brief_event_id: brief_event.id,
                      product_id: random_product.id,
                      is_display: false,
                      price: random_product.base_price,
                      units: randomIntFromInterval(10, 30),
                    })
           }
        }
                
        // Update client serial number
        await knex('clients')
                .update({requisition_current_serial: client.requisition_current_serial + index})
                .where({id: client.id});

        index++;
      }
    }
};
