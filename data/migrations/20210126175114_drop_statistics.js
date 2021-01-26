exports.up = async (knex) => {
  await knex.schema.dropTable("statistics");
  await knex.schema.alterTable("outletvenues", (table) => {
    table.json("stats");
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.json("stats");
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("outletvenues");
  knex.schema.dropTable("outletevents");
};
