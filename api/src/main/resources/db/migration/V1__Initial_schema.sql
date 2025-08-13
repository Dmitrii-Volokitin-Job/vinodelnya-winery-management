-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create persons table
CREATE TABLE persons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    note TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color code
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create entries table
CREATE TABLE entries (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    person_id BIGINT NOT NULL REFERENCES persons(id),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    work_hours DECIMAL(5,2),
    amount_paid DECIMAL(10,2),
    amount_due DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_person_id ON entries(person_id);
CREATE INDEX idx_entries_category_id ON entries(category_id);
CREATE INDEX idx_persons_name ON persons(name);
CREATE INDEX idx_categories_name ON categories(name);

-- Users will be created by DataInitializer with proper bcrypt encryption