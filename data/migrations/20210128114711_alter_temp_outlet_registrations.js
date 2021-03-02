exports.up = async (knex) => {
  return knex.schema.alterTable("temp_outlet_registrations", (table) => {
    table.enum("payment_type", ["online", "offline"]);
  });
};

exports.down = async (knex) => {
  return knex.schema.table("temp_outlet_registrations", (table) => {
    table.enum("payment_type", ["online", "offline"]);
  });
};
