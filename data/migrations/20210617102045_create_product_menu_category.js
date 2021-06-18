exports.up = async (knex) => {
  await knex.schema.createTable("product_menu_category", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
    table.integer("sequence").unique();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
  await knex.schema.createTable("menu_category", (table) => {
    table.increments("id").primary();
    table.integer("menu_product_id").references("outletvenuemenus.id");
    table.integer("menu_category").references("product_menu_category.id");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("product_menu_category");
  await knex.schema.dropTable("menu_category");
};
