const config = require('../organizations_data');
const faker = require('faker');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  return password_hash;
}


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var randomSample = function(arr,num){ return arr.map(a => [a,Math.random()]).sort((a,b) => {return a[1] < b[1] ? -1 : 1;}).slice(0,num).map(a => a[0]); }

function getRandomCheckoutDate(hours) {
  let checkout_date = new Date();
  checkout_date.setHours(checkout_date.getHours() + hours);
  return checkout_date;
}

exports.seed = async (knex) => {
    for (const config_client of config.CLIENTS) {
      // Get data
      const client = await knex('clients').where({name: config_client.client_data.name}).first();
    
      // Convert brief events into actual event
      // 1 - Get the briefs
      const briefs = await knex('briefs').where({client_id: client.id});
      // Iterate through all the briefs and get the brief events
      for (const brief of briefs) {
        // Get the brief events
        const brief_events = await knex('brief_events').where({brief_id: brief.id});
        // Iterate through all the brief_events and create an actual event
        for (const brief_event of brief_events) {
          // Create a event for each brief event
           const event_id =   
              await knex('events')
                  .insert({
                    brief_event_id: brief_event.id,
                    setup_at: brief_event.setup_time,
                    started_at: brief_event.start_time,
                    ended_at: brief_event.end_time,
                    master_code: Math.random().toString(36).substring(7).toUpperCase(),
                    is_master_code_enabled: true,
                    credits_left: 10000,
                  })
                  .returning('id')

          // Add guests
          const guest_numbers = randomIntFromInterval(10, 50);

          const role = 
              await knex('roles')
                .where({
                  scope: 'GUEST',
                  name: 'REGULAR'
                })
                .first();

          // Add event products
          const products =
                 await knex('products')
                        .where({
                          client_id: client.id,
                          is_cocktail: true,
                        })
            
          const event_products_amount = randomIntFromInterval(1, 5);
          const random_products = randomSample(products, event_products_amount);

          for (let random_product of random_products) {
            await knex('event_products')
                    .insert({
                      event_id: Number(event_id),
                      product_id: Number(random_product.id),
                      price: Math.round(random_product.base_price),
                      active: true
                    })
          }

          
          
          for (let guest_index = 0; guest_index < guest_numbers; guest_index++) {
            // Get collaborator role
            let account = {
                first_name: faker.name.firstName(),
                last_name: faker.name.lastName(),
                email: faker.internet.email(),
                phone_number: faker.phone.phoneNumber(),
                is_admin: false,
                is_email_verified: true, 
                is_age_verified: true,
                is_phone_number_verified: true,
                age_verification_status: 'APPROVED',
                password: '12345',
            }

            const password_hash = await hashPassword(account.password);
            account.password_hash = password_hash;
            delete account.password;

            // Create account 
            const account_id = 
              await knex('accounts')
                      .insert(account)
                      .returning('id');

            // Create a wallet
            await knex('wallets')
                    .insert({
                      account_id: Number(account_id),
                      loyalty_points: 0,
                      balance: 1000,
                    })

            // Create the collaborator
            const checked_in = Math.random() >= 0.5;
            const check_in_time = checked_in ? getRandomCheckoutDate(randomIntFromInterval(1, 3)) : null;
            const check_out_time = (Math.random() >= 0.5 && check_in_time) ? getRandomCheckoutDate(4, 8) : null;
            
            await knex('event_guests')
                    .insert({
                        account_id: Number(account_id),
                        role_id: Number(role.id),
                        event_id: Number(event_id),
                        first_name: account.first_name,
                        last_name: account.last_name,
                        email: account.email,
                        phone_number: account.phone_number,
                        checked_in,
                        check_in_time,
                        check_out_time,
                        code: Math.random().toString(36).substring(7).toUpperCase()
                    })     
          }
        }
      }
    }
};
