-- Create events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    adult_lunch_guests INTEGER DEFAULT 0,
    adult_tasting_guests INTEGER DEFAULT 0,
    children_guests INTEGER DEFAULT 0,
    extra_guests INTEGER DEFAULT 0,
    hot_dish_vegetarian VARCHAR(255),
    hot_dish_meat VARCHAR(255),
    masterclass BOOLEAN DEFAULT false,
    meal_extra_info TEXT,
    company VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    special_price_enabled BOOLEAN DEFAULT false,
    special_lunch_price DECIMAL(10,2),
    lunch_group_size INTEGER DEFAULT 0,
    lunch_rate DECIMAL(10,2) DEFAULT 0.00,
    lunch_total DECIMAL(10,2) DEFAULT 0.00,
    special_tasting_price DECIMAL(10,2),
    tasting_group_size INTEGER DEFAULT 0,
    tasting_rate DECIMAL(10,2) DEFAULT 0.00,
    tasting_total DECIMAL(10,2) DEFAULT 0.00,
    lunch_and_tasting_total DECIMAL(10,2) DEFAULT 0.00,
    added_wines_count INTEGER DEFAULT 0,
    added_wines_value DECIMAL(10,2) DEFAULT 0.00,
    extra_charge_comment TEXT,
    extra_charge_amount DECIMAL(10,2) DEFAULT 0.00,
    grand_total DECIMAL(10,2) DEFAULT 0.00,
    invoice_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_events_visit_date ON events(visit_date);
CREATE INDEX idx_events_company ON events(company);
CREATE INDEX idx_events_contact_name ON events(contact_name);
CREATE INDEX idx_events_special_price_enabled ON events(special_price_enabled);
CREATE INDEX idx_events_invoice_issued ON events(invoice_issued);