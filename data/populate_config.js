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
    // Organization Collaborators
    ORGANIZATION_COLLABORATORS: [
        {   
            account: {
                first_name: 'Regional',
                last_name: 'Manager',
                email: 'organization@seed.com',
                phone_number: '17811111111',
                is_admin: false,
                is_email_verified: true, 
                is_age_verified: true,
                is_phone_number_verified: true,
                password: '12345',
            },
            role: {
                scope: 'REGION',
                name: 'OWNER',
            }
        }
    ]
}