exports.up = function (knex) {
  return knex.schema.alterTable("accounts", (table) => {
    table.string("previous_status");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("accounts");
};
