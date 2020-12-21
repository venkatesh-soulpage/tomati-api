exports.up = async (knex) => {
  await knex.schema.createTable("carts", (table) => {
    table.increments("id").primary();
    table.integer("account_id").references("accounts.id").onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  return knex.schema.createTable("cart_items", (table) => {
    table.increments("id").primary();
    table.integer("cart_id").references("carts.id").onDelete("CASCADE");
    table
      .integer("outletvenuemenu_id")
      .references("outletvenuemenus.id")
      .onDelete("CASCADE");
    table
      .integer("outleteventmenu_id")
      .references("outleteventmenus.id")
      .onDelete("CASCADE");
    table.integer("quantity").defaultTo(0);
    table.boolean("ordered").defaultTo(false);
    table.boolean("billed").defaultTo(false);
    table.integer("updated_by").references("accounts.id").onDelete("CASCADE");
    table.json("data").nullable();
    table.string("payment_type");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("cart");
  return knex.schema.dropTable("cart_items");
};
