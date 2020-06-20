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
            ],
            brands: [
                {
                    name: 'Mezcal Brand',
                    product_type: 'Mezcal',
                    product_subtype: 'Mezcal',
                    description: 'A Mezcal brand'
                },
                {
                    name: 'Tequila Brand',
                    product_type: 'Tequila',
                    product_subtype: 'Tequila',
                    description: 'A Tequila brand'
                },
                {
                    name: 'Gin Brand',
                    product_type: 'Gin',
                    product_subtype: 'Gin',
                    description: 'A Gin brand'
                },
            ],
            warehouses: [
                {
                    name: 'Warehouse #1',
                    address: 'Warehouse #1 Address',
                },
                {
                    name: 'Warehouse #2',
                    address: 'Warehouse #2 Address'
                },
            ], 
            agencies: [
                {
                    agency_data: {
                        name: 'Nigeria Agency',
                        description: 'Nigeria Agency Description',
                        contact_email: 'nigeria_agency@seed.com',
                        sla_terms: 'Placeholder sla',
                        sla_hours_before_event_creation: 24,
                        sla_hours_before_event_update: 24,
                        sla_accepted: true
                    },
                    collaborators: [
                        {
                            account: {
                                first_name: 'Nigeria',
                                last_name: 'Agency Owner',
                                email: 'nigeria_agencyowner@seed.com',
                                phone_number: '17811111111',
                                is_admin: false,
                                is_email_verified: true, 
                                is_age_verified: true,
                                is_phone_number_verified: true,
                                password: '12345',
                            },
                            role: {
                                scope: 'AGENCY',
                                name: 'OWNER',
                            }
                        },
                        {
                            account: {
                                first_name: 'Nigeria',
                                last_name: 'Agency Manager',
                                email: 'nigeria_agencymanager@seed.com',
                                phone_number: '17811111111',
                                is_admin: false,
                                is_email_verified: true, 
                                is_age_verified: true,
                                is_phone_number_verified: true,
                                password: '12345',
                            },
                            role: {
                                scope: 'AGENCY',
                                name: 'MANAGER',
                            }
                        },
                    ]
                }
            ]
        },
        {
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
            ],
            venues: [
                {
                    name: 'Brazil Bar',
                    address: 'Brazil Street',
                    contact_name: 'Nigeria Bar Owner',
                    contact_email: 'nigeria_venueower@seed.com',
                    contact_phone_number: '17811111111',
                    latitude: 0,
                    longitude: 0
                }, 
                {
                    name: 'Brazil Club',
                    address: 'Brazil Street',
                    contact_name: 'Brazil Club Owner',
                    contact_email: 'brazil_venueower@seed.com',
                    contact_phone_number: '17811111111',
                    latitude: 0,
                    longitude: 0
                }, 
            ],
            brands: [
                {
                    name: 'Mezcal Brand',
                    product_type: 'Mezcal',
                    product_subtype: 'Mezcal',
                    description: 'A Mezcal brand'
                },
                {
                    name: 'Tequila Brand',
                    product_type: 'Tequila',
                    product_subtype: 'Tequila',
                    description: 'A Tequila brand'
                },
                {
                    name: 'Gin Brand',
                    product_type: 'Gin',
                    product_subtype: 'Gin',
                    description: 'A Gin brand'
                },
            ],
            warehouses: [
                {
                    name: 'Warehouse #1',
                    address: 'Warehouse #1 Address',
                },
                {
                    name: 'Warehouse #2',
                    address: 'Warehouse #2 Address'
                },
            ], 
            agencies: [
                {
                    agency_data: {
                        name: 'Brazil Agency',
                        description: 'Brazil Agency Description',
                        contact_email: 'brazil_agency@seed.com',
                        sla_terms: 'Placeholder sla',
                        sla_hours_before_event_creation: 24,
                        sla_hours_before_event_update: 24,
                        sla_accepted: true
                    },
                    collaborators: [
                        {
                            account: {
                                first_name: 'Brazil',
                                last_name: 'Agency Owner',
                                email: 'brazil_agencyowner@seed.com',
                                phone_number: '17811111111',
                                is_admin: false,
                                is_email_verified: true, 
                                is_age_verified: true,
                                is_phone_number_verified: true,
                                password: '12345',
                            },
                            role: {
                                scope: 'AGENCY',
                                name: 'OWNER',
                            }
                        },
                        {
                            account: {
                                first_name: 'Brazil',
                                last_name: 'Agency Manager',
                                email: 'brazil_agencymanager@seed.com',
                                phone_number: '17811111111',
                                is_admin: false,
                                is_email_verified: true, 
                                is_age_verified: true,
                                is_phone_number_verified: true,
                                password: '12345',
                            },
                            role: {
                                scope: 'AGENCY',
                                name: 'MANAGER',
                            }
                        },
                    ]
                }
            ]
        },
    ]
}