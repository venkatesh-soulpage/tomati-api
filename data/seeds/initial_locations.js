var countries_data = require('../../public/assets/countries.json');
var states_data = require('../../public/assets/states.json');
var cities_data = require('../../public/assets/cities.json');

exports.seed = async (knex) => {
  // Insert the country locations
  await knex('locations')
          .insert(countries_data);
  
  // Add all the states 
  const countries = await knex('locations').where({is_country: true});
  for (const country of countries) {
    const country_states = 
        states_data.filter(state => state.parent_name === country.name)
        .map(state => {
          return {
            name: state.name,
            is_country: false,
            currency: state.currency,
            parent_location: country.id,
          }
        })
      
    await knex('locations')
            .insert(country_states);
  }

  // Add all the cities
  const states = await knex('locations').where({is_country: false});
  for (const state of states) {
    const state_cities = 
        cities_data.filter(city => city.parent_name === state.name)
        .map(city => {
          return {
            name: city.name,
            is_country: false,
            currency: city.currency,
            parent_location: state.id,
          }
        })
      
    await knex('locations')
            .insert(state_cities);
  }
};
