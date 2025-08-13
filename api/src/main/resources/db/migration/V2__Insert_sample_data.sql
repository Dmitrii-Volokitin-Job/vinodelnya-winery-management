-- Insert sample persons
INSERT INTO persons (name, note, active) VALUES 
('Simona Popović', 'Head vintner with 15 years experience', true),
('Marko Jovanović', 'Assistant winemaker', true),
('Ana Nikolić', 'Vineyard manager', true),
('Petar Stojanović', 'Seasonal worker', true),
('Milica Stanković', 'Quality control specialist', true);

-- Insert sample categories
INSERT INTO categories (name, description, color, active) VALUES 
('Vineyard Expense', 'Costs related to vineyard maintenance and grape growing', '#2E8B57', true),
('Winery Expense', 'Equipment, facilities, and production costs', '#4682B4', true),
('Labor Cost', 'Worker wages and benefits', '#DAA520', true),
('Marketing', 'Promotional activities and sales expenses', '#DC143C', true),
('Equipment', 'Machinery and tool purchases/maintenance', '#8B4513', true),
('Utilities', 'Electricity, water, and other utilities', '#9932CC', true);

-- Insert sample entries
INSERT INTO entries (date, description, person_id, category_id, work_hours, amount_paid, amount_due) VALUES 
('2025-01-15', 'Vineyard pruning work - winter maintenance', 1, 1, 8.0, 240.00, 0.00),
('2025-01-16', 'Grape sorting and quality inspection', 5, 2, 6.5, 195.00, 0.00),
('2025-01-17', 'Equipment maintenance - pressing machine', 2, 5, 4.0, 0.00, 350.00),
('2025-01-18', 'Social media campaign setup', 3, 4, 3.0, 150.00, 0.00),
('2025-01-20', 'Electricity bill for winery facilities', 1, 6, 0.0, 890.00, 0.00),
('2025-01-22', 'Harvest preparation - equipment check', 4, 1, 5.5, 165.00, 0.00),
('2025-01-23', 'Wine tasting event organization', 1, 4, 7.0, 280.00, 120.00),
('2025-01-25', 'Barrel maintenance and cleaning', 2, 2, 6.0, 180.00, 0.00),
('2025-01-26', 'Fertilizer purchase for spring season', 3, 1, 2.0, 0.00, 450.00),
('2025-01-28', 'Monthly worker safety training', 5, 3, 4.0, 200.00, 0.00);