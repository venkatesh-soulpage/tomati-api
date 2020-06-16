// Organization Expiration Date
const getExpirationDate = (years) => {
    let expiration_date = new Date();
    expiration_date.setFullYear(expiration_date.getFullYear() + years);
    return expiration_date;
}

module.exports = {
    /* ORGANIZATION */
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
    ],
    /* CLIENTS */
    CLIENTS: [
        {
            client_data: {
                name: 'Nigeria Team (Seed Load)',
                location: 'Nigeria',
                description: 'This is the nigeria team',
                contact_email: 'nigeria@seed.com',
                collaborator_limit: 5,
                briefs_limit: 10,
                brands_limit: 3,
                warehouses_limit: 3,
                locations_limit: 1,
                identity_verifications_limit: 100,
                agencies_limit: 5,
                agency_collaborators_limit: 5,
                brief_attachment_limits: 52428800,
                requisition_current_serial: 100000,
                active: true,
                expiration_date: getExpirationDate(1),
            },
            collaborators: [
                {
                    account: {
                        first_name: 'Nigeria',
                        last_name: 'Brand Owner',
                        email: 'nigeria_brandowner@seed.com',
                        phone_number: '17811111111',
                        is_admin: false,
                        is_email_verified: true, 
                        is_age_verified: true,
                        is_phone_number_verified: true,
                        password: '12345',
                    },
                    role: {
                        scope: 'BRAND',
                        name: 'OWNER',
                    }
                },
                {
                    account: {
                        first_name: 'Nigeria',
                        last_name: 'Brand Manager',
                        email: 'nigeria_brandmanager@seed.com',
                        phone_number: '17811111111',
                        is_admin: false,
                        is_email_verified: true, 
                        is_age_verified: true,
                        is_phone_number_verified: true,
                        password: '12345',
                    },
                    role: {
                        scope: 'BRAND',
                        name: 'MANAGER',
                    }
                },
                {
                    account: {
                        first_name: 'Nigeria',
                        last_name: 'Warehouse Manager',
                        email: 'nigeria_warehousemanager@seed.com',
                        phone_number: '17811111111',
                        is_admin: false,
                        is_email_verified: true, 
                        is_age_verified: true,
                        is_phone_number_verified: true,
                        password: '12345',
                    },
                    role: {
                        scope: 'BRAND',
                        name: 'WAREHOUSE_MANAGER',
                    }
                },
            ],
            venues: [
                {
                    name: 'Nigeria Bar',
                    address: 'Nigeria Street',
                    contact_name: 'Nigeria Bar Owner',
                    contact_email: 'nigeria_venueower@seed.com',
                    contact_phone_number: '17811111111',
                    latitude: 0,
                    longitude: 0
                }, 
                {
                    name: 'Nigeria Club',
                    address: 'Nigeria Street',
                    contact_name: 'Nigeria Club Owner',
                    contact_email: 'nigeria_venueower@seed.com',
                    contact_phone_number: '17811111111',
                    latitude: 0,
                    longitude: 0
                }, 
            ]
            
        },
        /* {
            client_data: {
                name: 'Brazil Team (Seed Load)',
                location: 'Brazil',
                description: 'This is the brazil team',
                contact_email: 'brazil@seed.com',
                collaborator_limit: 5,
                briefs_limit: 10,
                brands_limit: 3,
                warehouses_limit: 3,
                locations_limit: 1,
                identity_verifications_limit: 100,
                agencies_limit: 5,
                agency_collaborators_limit: 5,
                brief_attachment_limits: 52428800,
                requisition_current_serial: 100000,
                active: true,
                expiration_date: getExpirationDate(1),
            },
            collaborators: [
                {
                    account: {
                        first_name: 'Brazil',
                        last_name: 'Brand Owner',
                        email: 'brazil_brandowner@seed.com',
                        phone_number: '17811111111',
                        is_admin: false,
                        is_email_verified: true, 
                        is_age_verified: true,
                        is_phone_number_verified: true,
                        password: '12345',
                    },
                    role: {
                        scope: 'BRAND',
                        name: 'OWNER',
                    }
                },
                {
                    account: {
                        first_name: 'Brazil',
                        last_name: 'Brand Manager',
                        email: 'brazil_brandmanager@seed.com',
                        phone_number: '17811111111',
                        is_admin: false,
                        is_email_verified: true, 
                        is_age_verified: true,
                        is_phone_number_verified: true,
                        password: '12345',
                    },
                    role: {
                        scope: 'BRAND',
                        name: 'MANAGER',
                    }
                },
                {
                    account: {
                        first_name: 'Brazil',
                        last_name: 'Warehouse Manager',
                        email: 'brazil_warehousemanager@seed.com',
                        phone_number: '17811111111',
                        is_admin: false,
                        is_email_verified: true, 
                        is_age_verified: true,
                        is_phone_number_verified: true,
                        password: '12345',
                    },
                    role: {
                        scope: 'BRAND',
                        name: 'WAREHOUSE_MANAGER',
                    }
                },
            ]
            
        }, */
    ]
}