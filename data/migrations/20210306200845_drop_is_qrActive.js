exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenues", (table) => {
    table.dropColumn("is_qr_active");
  });
};

exports.down = async (knex) => {
  await knex.schema.table("outletvenues", (table) => {
    table.dropColumn("is_qr_active");
  });
};
