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
          if (!event) return;

          const guests = await knex('event_guests').where({event_id: event.id});
          // Start event 
          await knex('events')
                  .where({id: event.id})
                  .update({
                    started_at: brief_event.start_time,
                  })
          
          // Simulate orders and transactions for each guest
          for (const guest of guests) {

            const wallet = await knex('wallets').where({account_id: guest.account_id}).first();

            if (wallet) {

              // Delete wallet orders
              const wallet_orders =
                await knex('wallet_orders')
                        .where({
                          wallet_id: Number(wallet.id),
                        })
              
              const wallet_orders_ids = wallet_orders.map(wallet_order => wallet_order.id);

              // Delete all transactions with this wallet orders
              await knex('wallet_order_transactions')
                      .whereIn('wallet_order_id', wallet_orders_ids)
                      .del();

              // Delete all wallet orders
              await knex('wallet_orders')
                      .whereIn('id', wallet_orders_ids)
                      .del();

              // Reset Wallet
              await knex('wallets')
                      .where({id: wallet.id})
                      .update({
                        balance: 1000,
                      })
            }
          }
        }
      }
  }

};
