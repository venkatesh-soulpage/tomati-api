exports.up = function (knex) {
  return knex.schema.createTable("menu_product_category", (table) => {
    table.increments("id").primary();
    table.integer("menu_product_id").references("outletvenuemenus.id");
    table.integer("menu_product_category").references("product_category.id");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("menue_product_category");
};
