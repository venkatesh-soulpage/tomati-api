exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.string("currency");
    table.json("product_options");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.boolean("is_flat_fee_active");
    table.boolean("is_variable_fee_active");
  });
  await knex.schema.dropTable("menu_product_sides");
  await knex.schema.createTable("menu_product_free_sides", (table) => {
    table.increments("id").primary();
    table.integer("menu_product_id").references("outletvenuemenus.id");
    table.integer("product_side_id").references("outletvenuemenus.id");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
  await knex.schema.createTable("menu_product_paid_sides", (table) => {
    table.increments("id").primary();
    table.integer("menu_product_id").references("outletvenuemenus.id");
    table.integer("product_side_id").references("outletvenuemenus.id");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenuemenus");
  await knex.schema.dropTable("outletvenues");
  await knex.schema.dropTable("menu_product_free_sides");
  await knex.schema.dropTable("menu_product_paid_sides");
};
