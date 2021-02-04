exports.up = async (knex) => {
  await knex.schema.alterTable("statistics", (table) => {
    table.dropColumn("count");
  });

  return await knex.schema.alterTable("statistics", (table) => {
    table.json("count");
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable("statistics", (table) => {
    table.dropColumn("count");
  });

  return await knex.schema.alterTable("statistics", (table) => {
    table.json("count");
  });
};
