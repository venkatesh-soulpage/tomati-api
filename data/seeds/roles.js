exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("roles")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("roles").insert([
        { scope: "BRAND", name: "OWNER" },
        { scope: "REGION", name: "OWNER" },
        { scope: "REGION", name: "MANAGER" },
        { scope: "BRAND", name: "MANAGER" },
        { scope: "BRAND", name: "WAREHOUSE_MANAGER" },
        { scope: "AGENCY", name: "OWNER" },
        { scope: "AGENCY", name: "MANAGER" },
        { scope: "AGENCY", name: "STAFF" },
        { scope: "GUEST", name: "VVIP" },
        { scope: "GUEST", name: "VIP" },
        { scope: "GUEST", name: "REGULAR" },
        { scope: "OUTLET", name: "MANAGER" },
        { scope: "OUTLET", name: "WAITER" },
      ]);
    });
};
