exports.up = function (knex) {
  return knex.schema.alterTable("product_menu_category", (table) => {
    table.integer("outlet_venue_id").references("outletvenues.id");
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("product_menu_category");
};
