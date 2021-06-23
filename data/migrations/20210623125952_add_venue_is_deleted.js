exports.up = function (knex) {
  return knex.schema.alterTable("outletvenues", (table) => {
    table.boolean("is_live").defaultTo(true);
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("outletvenues");
};
