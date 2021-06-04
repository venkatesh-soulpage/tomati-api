exports.up = function (knex) {
  return knex.schema.alterTable("product_categories", (table) => {
    table.integer("sequence").unique();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("product_categories");
};
