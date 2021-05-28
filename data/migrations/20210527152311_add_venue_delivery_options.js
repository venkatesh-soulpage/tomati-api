exports.up = function (knex) {
  return knex.schema.alterTable("outletvenues", (table) => {
    table.json("delivery_options");
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("outletvenues");
};
