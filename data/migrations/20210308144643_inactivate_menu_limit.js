exports.up = function (knex) {
  return knex.schema.createTable("menu_status_count", (table) => {
    table.increments("id").primary();
    table.integer("account_id").references("accounts.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("menu_status_count");
};
