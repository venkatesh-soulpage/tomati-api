exports.up = function (knex) {
  return knex.schema.alterTable("locations", (table) => {
    table.string("currency_symbol");
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("locations");
};
