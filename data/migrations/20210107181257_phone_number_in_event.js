exports.up = async (knex) => {
  return knex.schema.alterTable("outletevents", (table) => {
    table.string("phone_number");
  });
};

exports.down = async (knex) => {
  return knex.schema.table("outletevents", (table) => {
    table.dropColumn("phone_number");
  });
};
