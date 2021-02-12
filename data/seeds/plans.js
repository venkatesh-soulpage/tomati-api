exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("plans")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("plans").insert([
        {
          plan: "Starter",
          outlet_limit: 1,
          event_limit: 4,
          subscription_type: "Monthly",
          price: 0,
          outlet_addon_price: 25,
          qr_tags_addon_price: 7,
          event_addon_price: 25,
          user_addon_price: 4,
          user_limit: 5,
          qr_tags_limit: 0,
        },
        {
          plan: "Growth",
          outlet_limit: 3,
          event_limit: 8,
          subscription_type: "Monthly",
          price: 39,
          outlet_addon_price: 25,
          qr_tags_addon_price: 7,
          event_addon_price: 25,
          user_addon_price: 5,
          user_limit: 15,
          qr_tags_limit: 0,
        },
        {
          plan: "Premium",
          outlet_limit: 10,
          event_limit: 12,
          subscription_type: "Monthly",
          price: 79,
          outlet_addon_price: 25,
          qr_tags_addon_price: 7,
          event_addon_price: 25,
          user_addon_price: 5,
          user_limit: 50,
          qr_tags_limit: 0,
        },
      ]);
    });
};
