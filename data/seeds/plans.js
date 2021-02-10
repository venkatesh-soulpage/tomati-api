exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("plans")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("plans").insert([
        {
          plan: "Starter - Free",
          outlet_limit: 1,
          event_limit: 1,
          price: 0,
          no_of_outlets: 1,
          no_of_qr_tags: 3,
          subscription_type: "Monthly",
        },
        {
          plan: "Growth",
          outlet_limit: 4,
          event_limit: 4,
          price: 1400,
          no_of_outlets: 5,
          no_of_qr_tags: 5,
          subscription_type: "Monthly",
        },
        {
          plan: "Premium",
          outlet_limit: 10,
          event_limit: 10,
          price: 2900,
          no_of_outlets: 10,
          no_of_qr_tags: 10,
          subscription_type: "Monthly",
        },
        {
          plan: "Starter - Free",
          outlet_limit: 1,
          event_limit: 1,
          price: 0,
          no_of_outlets: 1,
          no_of_qr_tags: 3,
          subscription_type: "Yearly",
        },
        {
          plan: "Growth",
          outlet_limit: 1,
          event_limit: 1,
          price: 19000,
          no_of_outlets: 15,
          no_of_qr_tags: 3,
          subscription_type: "Yearly",
        },
        {
          plan: "Premium",
          outlet_limit: 1,
          event_limit: 1,
          price: 2900,
          no_of_outlets: 15,
          no_of_qr_tags: 3,
          subscription_type: "Yearly",
        },
      ]);
    });
};
