exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenues", (table) => {
    table.string("logo_img");
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.string("logo_img");
  });
};

exports.down = async (knex) => {
  await knex.schema.table("outletevents", (table) => {
    table.dropColumn("logo_img");
  });
  await knex.schema.table("outletvenues", (table) => {
    table.dropColumn("logo_img");
  });
};
