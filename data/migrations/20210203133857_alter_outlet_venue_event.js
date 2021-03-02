exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenues", (table) => {
    table.string("address").alter();
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.string("address").alter();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("outletevents");
  await knex.schema.dropTable("outletvenues");
};
