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
          chargebee_plan_id: "tomati-starter-",
          chargebee_collaborators_addon_id: "free-collaborators-starter-",
          chargebee_qr_addon_id: "qr-menu-tags",
          chargebee_events_addon_id: "free-event-starter",
          chargebee_outlets_addon_id: "starter-outlet-free",
        },
      ]);
    });
};
