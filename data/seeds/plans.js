exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("plans")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("plans").insert([
        {
          plan: "starter",
          outlet_limit: 1,
          event_limit: 4,
          subscription_type: "monthly",
          price: 0,
          outlet_addon_price: 25,
          qr_tags_addon_price: 7,
          event_addon_price: 25,
          user_addon_price: 3,
          user_limit: 5,
          qr_tags_limit: 0,
        },
        {
          plan: "growth-monthly",
          outlet_limit: 3,
          event_limit: 8,
          subscription_type: "monthly",
          price: 39,
          outlet_addon_price: 20,
          qr_tags_addon_price: 7,
          event_addon_price: 20,
          user_addon_price: 2,
          user_limit: 15,
          qr_tags_limit: 0,
        },
        {
          plan: "premium-monthly",
          outlet_limit: 10,
          event_limit: 12,
          subscription_type: "monthly",
          price: 79,
          outlet_addon_price: 16,
          qr_tags_addon_price: 7,
          event_addon_price: 16,
          user_addon_price: 2,
          user_limit: 50,
          qr_tags_limit: 0,
        },
        {
          plan: "growth-yearly",
          outlet_limit: 3,
          event_limit: 8,
          subscription_type: "yearly",
          price: 374,
          outlet_addon_price: 20,
          qr_tags_addon_price: 7,
          event_addon_price: 20,
          user_addon_price: 2,
          user_limit: 35,
          qr_tags_limit: 0,
        },
        {
          plan: "premium-yearly",
          outlet_limit: 10,
          event_limit: 12,
          subscription_type: "yearly",
          price: 758,
          outlet_addon_price: 16,
          qr_tags_addon_price: 7,
          event_addon_price: 16,
          user_addon_price: 2,
          user_limit: 50,
          qr_tags_limit: 0,
        },
      ]);
    });
};
