exports.up = async (knex) => {
  await knex.schema.createTable("menu_product_sides", (table) => {
    table.increments("id").primary();
    table.integer("menu_product_id").references("outletvenuemenus.id");
    table.integer("product_side_id").references("outletvenuemenus.id");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.boolean("is_free_side");
    table.boolean("is_paid_side");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.boolean("is_published").defaultTo(true);
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.integer("delivery_radius");
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable("menu_product_sides");
  await knex.schema.dropTable("outletvenuemenus");
  await knex.schema.dropTable("outletvenues");
};
