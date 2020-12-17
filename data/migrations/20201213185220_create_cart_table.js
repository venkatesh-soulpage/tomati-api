exports.up = async (knex) => {
  await knex.schema.createTable("carts", (table) => {
    table.increments("id").primary();
    table.integer("account_id").references("accounts.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  return knex.schema.createTable("cart_items", (table) => {
    table.increments("id").primary();
    table.integer("cart_id").references("carts.id");
    table.integer("outletvenuemenu_id").references("outletvenuemenus.id");
    table.integer("outleteventmenu_id").references("outleteventmenus.id");
    table.integer("quantity").defaultTo(0);
    table.boolean("ordered").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("cart");
  return knex.schema.dropTable("cart_items");
};
