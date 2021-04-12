exports.up = function (knex) {
  return knex.schema.alterTable("outletvenues", (table) => {
    table.string("name").unique().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("outletvenues");
};
