exports.up = async (knex) => {
  await knex.schema.alterTable("outletevents", (table) => {
    table.boolean("qr_isActive").defaultTo(false);
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("outletevents");
};
