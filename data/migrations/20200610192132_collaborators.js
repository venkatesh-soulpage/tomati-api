
exports.up = async (knex) => {

    await knex.schema.createTable('collaborators', table => {
        table.increments('id').primary()
        table.integer('account_id').references('accounts.id')
        table.integer('client_id').references('clients.id')
        table.integer('agency_id').references('agencies.id')
        table.integer('regional_organization_id').references('regional_organizations.id')
        table.integer('role_id').references('roles.id').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })

    const client_collaborators =
        await knex('client_collaborators')
            .then(rows => {
                return rows.map(collaborator => {
                    delete collaborator.id;
                    return {...collaborator}
                })
            })
                
    await knex('collaborators')
            .insert(client_collaborators);
        
    const agency_collaborators = 
        await knex('agency_collaborators')
                .then(rows => {
                    return rows.map(collaborator => {
                        delete collaborator.id;
                        return {...collaborator}
                    })
                })
    
    await knex('collaborators')
            .insert(agency_collaborators);

    await knex.raw('DROP TABLE client_collaborators CASCADE');
    return knex.raw('DROP TABLE agency_collaborators CASCADE');

}

exports.down = async (knex) => {

    // Readd client collaborators
    await knex.schema.createTable('client_collaborators', table => {
        table.increments('id').primary()
        table.integer('role_id').references('roles.id')
        table.integer('account_id').references('accounts.id')
        table.integer('client_id').references('clients.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })

    const client_collaborators =
        await knex('collaborators')
            .then(rows => {
                return rows
                    .filter(row => row.client_id)
                    .map(collaborator => {
                        delete collaborator.id;
                        delete collaborator.agency_id;
                        delete collaborator.regional_organization_id;
                        return {...collaborator}
                    })
            })


    await knex('client_collaborators')
            .insert(client_collaborators);
        
    // Readd agency collaborators
    await knex.schema.createTable('agency_collaborators', table => {
        table.increments('id').primary()
        table.integer('role_id').references('roles.id')
        table.integer('account_id').references('accounts.id')
        table.integer('client_id').references('clients.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })

    const agency_collaborators =
        await knex('collaborators')
            .then(rows => {
                return rows
                    .filter(row => row.agency_id)
                    .map(collaborator => {
                        delete collaborator.id;
                        delete collaborator.client_id;
                        delete collaborator.regional_organization_id;
                        return {...collaborator}
                    })
            })

    await knex('agency_collaborators')
            .insert(agency_collaborators);


    return knex.schema.dropTable('collaborators')
}

