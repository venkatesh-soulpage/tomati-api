exports.up = function (knex) {
  return knex.schema.createTable("ordersinfo", (table) => {
    table.increments("id").primary();
    table.string("customer_name").notNullable();
    table
      .integer("outletvenuemenu_id")
      .references("outletvenuemenus.id")
      .onDelete("CASCADE");
    table
      .integer("outleteventmenu_id")
      .references("outleteventmenus.id")
      .onDelete("CASCADE");
    table.integer("quantity").notNullable();
    table.boolean("ordered").defaultTo(false);
    table.boolean("billed").defaultTo(false);
    table.integer("updated_by").references("accounts.id").onDelete("CASCADE");
    table.json("data").nullable();
    table.string("payment_type");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("ordersinfo");
};
