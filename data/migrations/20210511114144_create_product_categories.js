exports.up = function (knex) {
  return knex.schema.createTable("product_categories", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("product_categories");
};
