exports.up = async (knex) => {
  return knex.schema.alterTable("outleteventmenus", (table) => {
    table.string("outlet_category");
  });
};

exports.down = async (knex) => {
  return knex.schema.table("outleteventmenus", (table) => {
    table.dropColumn("outlet_category");
  });
};
