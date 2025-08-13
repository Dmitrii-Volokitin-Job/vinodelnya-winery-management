-- Add more persons
INSERT INTO persons (name, note, active) VALUES 
('Stefan Mirković', 'Vineyard supervisor and grape specialist', true),
('Jovana Đorđević', 'Wine cellar master', true),
('Nikola Pavlović', 'Equipment technician', true),
('Tamara Ilić', 'Marketing and sales coordinator', true),
('Dragan Milosavljević', 'Seasonal harvest worker', true),
('Sofija Janković', 'Laboratory analyst - wine quality', true),
('Miloš Stević', 'Tour guide and sommelier', true),
('Jelena Vasić', 'Accounting and finance', true);

-- Add more categories  
INSERT INTO categories (name, description, color, active) VALUES 
('Transportation', 'Vehicle fuel, maintenance, and transport costs', '#FF6B35', true),
('Insurance', 'Property and equipment insurance costs', '#004E89', true),
('Legal & Compliance', 'Permits, licenses, and legal fees', '#8B2635', true),
('Research & Development', 'New wine varieties and production methods', '#6A994E', true),
('Events & Tourism', 'Wine tastings, tours, and promotional events', '#F72585', true),
('Packaging & Bottling', 'Bottles, labels, corks, and packaging materials', '#7209B7', true);

-- Add comprehensive entries data for past 3 months
INSERT INTO entries (date, description, person_id, category_id, work_hours, amount_paid, amount_due) VALUES 
-- January 2025
('2025-01-02', 'New Year vineyard inspection and planning', 1, 1, 4.0, 120.00, 0.00),
('2025-01-03', 'Wine cellar temperature monitoring setup', 7, 2, 6.0, 180.00, 0.00),
('2025-01-05', 'Equipment calibration - pH meters and thermometers', 8, 5, 3.5, 105.00, 0.00),
('2025-01-08', 'Social media campaign - winter wine collection', 9, 4, 5.0, 200.00, 0.00),
('2025-01-10', 'Monthly electricity and heating bills', 1, 6, 0.0, 1250.00, 0.00),
('2025-01-12', 'Pruning tools maintenance and sharpening', 6, 5, 4.0, 0.00, 280.00),
('2025-01-15', 'Winter pruning - section A vineyard', 1, 1, 8.0, 240.00, 0.00),
('2025-01-15', 'Winter pruning - section B vineyard', 6, 1, 8.0, 240.00, 0.00),
('2025-01-15', 'Winter pruning - section C vineyard', 10, 1, 8.0, 240.00, 0.00),
('2025-01-16', 'Wine tasting room preparation', 12, 11, 6.0, 180.00, 0.00),
('2025-01-18', 'Quarterly insurance payment', 13, 8, 1.0, 2400.00, 0.00),
('2025-01-20', 'New wine bottle order - 10,000 units', 1, 12, 2.0, 0.00, 3500.00),
('2025-01-22', 'Vehicle fuel and maintenance', 6, 7, 1.5, 180.00, 0.00),
('2025-01-25', 'Wine quality testing - lab analysis', 11, 10, 5.0, 150.00, 0.00),
('2025-01-28', 'Annual winery permit renewal', 9, 9, 3.0, 0.00, 850.00),
('2025-01-30', 'Monthly staff training - safety protocols', 1, 3, 4.0, 400.00, 0.00),

-- February 2025
('2025-02-01', 'Vineyard soil analysis and testing', 6, 1, 6.0, 180.00, 0.00),
('2025-02-03', 'New fermentation tank installation', 7, 2, 8.0, 320.00, 0.00),
('2025-02-05', 'Cork supplier quality inspection', 11, 12, 4.0, 120.00, 0.00),
('2025-02-08', 'Wine tour guide training program', 12, 11, 6.0, 300.00, 0.00),
('2025-02-10', 'Monthly utility bills - February', 1, 6, 0.0, 980.00, 0.00),
('2025-02-12', 'Label design and printing order', 9, 12, 3.0, 0.00, 650.00),
('2025-02-15', 'Grape variety research - new plantings', 11, 10, 7.0, 350.00, 0.00),
('2025-02-18', 'Equipment upgrade - bottling line', 8, 5, 8.0, 0.00, 4200.00),
('2025-02-20', 'Wine festival preparation', 9, 11, 8.0, 400.00, 0.00),
('2025-02-22', 'Vineyard fence repair - storm damage', 6, 1, 6.0, 180.00, 150.00),
('2025-02-25', 'Monthly accounting and bookkeeping', 13, 3, 4.0, 200.00, 0.00),
('2025-02-28', 'End of month inventory count', 1, 2, 5.0, 150.00, 0.00),

-- March 2025
('2025-03-01', 'Spring vineyard preparation', 6, 1, 8.0, 240.00, 0.00),
('2025-03-03', 'Wine aging barrels inspection', 7, 2, 6.0, 180.00, 0.00),
('2025-03-05', 'Marketing materials design and print', 9, 4, 5.0, 250.00, 200.00),
('2025-03-08', 'International Women''s Day wine tasting event', 12, 11, 8.0, 400.00, 0.00),
('2025-03-10', 'Quarterly equipment maintenance', 8, 5, 7.0, 280.00, 0.00),
('2025-03-12', 'New grape variety planting preparation', 6, 1, 8.0, 240.00, 0.00),
('2025-03-15', 'Wine quality certification process', 11, 10, 6.0, 300.00, 0.00),
('2025-03-18', 'Tourism season preparation meeting', 9, 11, 3.0, 150.00, 0.00),
('2025-03-20', 'Spring cleaning of wine cellar', 7, 2, 8.0, 240.00, 0.00),
('2025-03-22', 'Vehicle insurance renewal', 1, 8, 1.0, 1200.00, 0.00),
('2025-03-25', 'Wine bottle labeling - spring collection', 10, 12, 6.0, 180.00, 0.00),
('2025-03-28', 'Monthly financial report preparation', 13, 3, 5.0, 250.00, 0.00),
('2025-03-30', 'Grape vine health assessment', 6, 1, 7.0, 210.00, 0.00);