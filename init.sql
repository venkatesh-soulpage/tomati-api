CREATE TABLE locations (
  ID SERIAL PRIMARY KEY,
  country_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
  ID SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(ID),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN NOT NULL,
  is_email_verified BOOLEAN NOT NULL,
  is_age_verified BOOLEAN NOT NULL,
  age_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tokens (
  ID SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

CREATE TABLE roles (
  ID SERIAL PRIMARY KEY,
  scope VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

CREATE TABLE clients (
  ID SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(ID),
  owner_id INTEGER REFERENCES accounts(ID),
  name VARCHAR(255) NOT NULL,  
  description VARCHAR(255),  
  contact_email VARCHAR(255),  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)