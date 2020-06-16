// Organization Expiration Date
const getExpirationDate = (years) => {
    let expiration_date = new Date();
    expiration_date.setFullYear(expiration_date.getFullYear() + years);
    return expiration_date;
}



module.exports = {
    // Organization
    ORGANIZATION_NAME: 'Seed Organization',
    ORGANIZATON_DESCRIPTION: 'This is a description for a seed organization',
    ORGANIZATION_CONTACT_EMAIL: 'organization@seed.com',
    EXPIRATION_DATE: getExpirationDate(1),
    LOCATIONS_LIMIT: 5,
    // Organization Locations
    ORGANIZATION_LOCATIONS: ['Nigeria', 'Brazil', 'France', 'Spain', 'United Arab Emirates'],
}