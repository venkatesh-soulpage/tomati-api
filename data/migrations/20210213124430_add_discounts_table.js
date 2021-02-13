exports.up = function (knex) {
  return knex.schema.createTable("discounts", (table) => {
    table.increments("id").primary();
    table.string("discount_code").unique();
    table.integer("discount_value");
    table.timestamp("start_date").notNullable();
    table.timestamp("end_date").notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("discounts");
};
