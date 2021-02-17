exports.up = function (knex) {
  return knex.schema.createTable("addons", (table) => {
    table.increments("id").primary();
    table.string("name");
    table.string("chargebee_addon_id");
    table.integer("price_per_unit");
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("addons");
};
