exports.up = function (knex) {
  // return knex.schema.alterTable("temp_outlet_registrations", (table) => {
  //   table.integer("plan_id").references("plans.id").alter();
  // });
};

exports.down = function (knex) {
  // knex.schema.dropTable("temp_outlet_registrations");
};
