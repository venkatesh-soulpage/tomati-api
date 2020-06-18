const config = require('../organizations_data');

var randomSample = function(arr,num){ return arr.map(a => [a,Math.random()]).sort((a,b) => {return a[1] < b[1] ? -1 : 1;}).slice(0,num).map(a => a[0]); }

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const randomString = (len) => {
  var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return [...Array(len)].reduce(a=>a+p[~~(Math.random()*p.length)],'');
}

exports.seed = async (knex) => {
  for (const config_client of config.CLIENTS) {
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
          const event = await knex('events').where({brief_event_id: brief_event.id}).first();

          const guests = await knex('event_guests').where({event_id: event.id});
          const event_products = await knex('event_products').where({event_id: event.id});

          // Start event 
          await knex('events')
                  .where({id: event.id})
                  .update({
                    started_at: new Date(),
                  })
          
          // Simulate orders and transactions for each guest
          for (const guest of guests) {

            const wallet = await knex('wallets').where({account_id: guest.account_id}).first();
            const random_sample_amount = randomIntFromInterval(1, event_products.length);
            const random_event_products = randomSample(event_products, random_sample_amount);
            const total_amount = random_event_products.reduce((acc, curr) => acc + Number(curr.price), 0);

            // Create wallet order
            const wallet_order_id = 
                    await knex('wallet_orders')
                            .insert({
                              wallet_id: Number(wallet.id),
                              total_amount: Number(total_amount),
                              order_identifier: randomString(10),
                              status: 'RECEIVED',
                              type: 'BUY',
                            })
                            .returning('id')
            
            // Record all the individual transactions
            for (const random_event_product of random_event_products) {
              await knex('wallet_order_transactions')
                      .insert({
                        wallet_order_id: Number(wallet_order_id),
                        event_product_id: Number(random_event_product.id),
                      })
            }

            // Substract the amount from guest wallet
            await knex('wallets')
                    .where({id: wallet.id})
                    .update({
                      balance: Number(wallet.balance) - Number(total_amount),
                    })


          }
        }
      }
  }

};
