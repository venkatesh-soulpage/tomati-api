exports.up = async (knex) => {
  return knex.schema.alterTable("outletvenues", (table) => {
    table.string("phone_number");
  });
};

exports.down = async (knex) => {
  return knex.schema.table("outletvenues", (table) => {
    table.dropColumn("phone_number");
  });
};
