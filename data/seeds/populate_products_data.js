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
      // Add alternatives for multiple products
      for (const config_brand of config_client.brands) {
        const brand = 
                await knex('brands')
                        .where({
                          name: config_brand.name,
                          client_id: client.id,
                        })
                        .first();
          
        // Add brand alternatives
        for (const alternative of alternatives) {
          await knex('products')
                  .insert({
                    brand_id: brand.id,
                    client_id: client.id,
                    name: `${brand.name} (${alternative})`,
                    description: faker.lorem.sentence(),
                    metric: 'ml',
                    metric_amount: 750,
                    sku: faker.lorem.word() + faker.random.number(999),
                    base_price: faker.random.number(999),
                    is_cocktail: false,
                    product_type: 'PRODUCT',
                    product_subtype: 'SPIRIT',
                  })
        }
      }

    // Add Mixers
    for (const mixer of seed_mixers) {
      // Add brand alternatives
      for (const alternative of alternatives) {
        await knex('products')
          .insert({
            client_id: client.id,
            name: `${mixer.name} (${alternative})`,
            description: faker.lorem.sentence(),
            metric: 'ml',
            metric_amount: 750,
            sku: faker.lorem.word() + faker.random.number(999),
            base_price: faker.random.number(999),
            is_cocktail: false,
            product_type: 'MIXER',
            product_subtype: mixer.product_subtype,
          })
      }
    }

    // Add cocktails 
    const cocktail_amount = 25;
    const db_products = await knex('products').where({client_id: client.id});
    const products = db_products.filter(prod => prod.product_type === 'PRODUCT');
    const mixers = db_products.filter(prod => prod.product_type === 'MIXER');

    for (let cocktail_index = 0; cocktail_index < cocktail_amount; cocktail_index++) {
      // Select random product
      const product_index = randomIntFromInterval(0, products.length -1 )
      const mixer_index = randomIntFromInterval(0, mixers.length -1 )
      const product = products[product_index];
      const mixer = mixers[mixer_index];

      const random_product_quantity = randomIntFromInterval(10, 100);
      const random_mixer_quantity = randomIntFromInterval(10, 100);

      const base_price = ((product.base_price / product.metric_amount) * random_product_quantity) + ((mixer.base_price / mixer.metric_amount) * random_mixer_quantity); 

      const cocktail_id =
        await knex('products')
              .insert({
                client_id: client.id,
                name: `${product.name} - ${mixer.name}`,
                description: faker.lorem.sentence(),
                metric: 'ml',
                metric_amount: random_product_quantity + random_mixer_quantity,
                sku: faker.lorem.word() + faker.random.number(999),
                base_price: base_price.toFixed(2),
                is_cocktail: true,
                product_type: 'COCKTAIL',
                product_subtype: 'COCKTAIL',
              })
              .returning('id')

      // Register product ingredients
      await knex('product_ingredients')
              .insert({
                product_parent_id: Number(cocktail_id),
                product_id: Number(product.id),
                quantity: Number(random_product_quantity),
              })
      
      // Register product ingredients
      await knex('product_ingredients')
              .insert({
                product_parent_id: Number(cocktail_id),
                product_id: Number(mixer.id),
                quantity: Number(random_mixer_quantity),
              })
    }

  }
};
