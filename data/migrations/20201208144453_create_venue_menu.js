exports.up = function (knex) {
  return knex.schema.createTable("outletvenuemenus", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("price").notNullable();
    table.string("description");
    table.string("menu_category");
    table.string("product_category");
    table.string("product_type");
    table.string("actual_name");
    table.string("portfolio");
    table.string("ingredient_1");
    table.string("ingredient_1_quantity");
    table.string("ingredient_2");
    table.string("ingredient_2_quantity");
    table.string("ingredient_3");
    table.string("ingredient_3_quantity");
    table.string("ingredient_4");
    table.string("ingredient_4_quantity");
    table.string("ingredient_5");
    table.string("ingredient_5_quantity");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("outletvenuemenus");
};
