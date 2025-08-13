-- Insert sample events
INSERT INTO events (
    visit_date, visit_time, adult_lunch_guests, adult_tasting_guests, children_guests, 
    extra_guests, hot_dish_vegetarian, hot_dish_meat, masterclass, meal_extra_info,
    company, contact_name, contact_phone, special_price_enabled, 
    lunch_group_size, lunch_rate, lunch_total, 
    tasting_group_size, tasting_rate, tasting_total, 
    lunch_and_tasting_total, added_wines_count, added_wines_value,
    extra_charge_comment, extra_charge_amount, grand_total, invoice_issued
) VALUES 
(
    '2025-02-15', '12:00', 8, 8, 2, 1, 'Vegetarian pasta', 'Grilled chicken', false, 'Allergy: nuts',
    'Travel Dreams Ltd', 'Maria Santos', '+381 64 123 4567', false,
    8, 25.00, 200.00,
    8, 15.00, 120.00,
    320.00, 3, 45.00,
    'Extra wine bottle', 30.00, 395.00, false
),
(
    '2025-02-20', '14:30', 12, 15, 0, 2, 'Risotto', 'Beef steak', true, 'VIP group',
    'Elite Tours', 'John Anderson', '+49 176 987 6543', true,
    12, 30.00, 360.00,
    15, 20.00, 300.00,
    660.00, 5, 125.00,
    'Masterclass fee', 100.00, 885.00, true
),
(
    '2025-02-22', '11:00', 6, 6, 1, 0, 'Salad', 'Fish fillet', false, 'Birthday celebration',
    'Family Tours', 'Ana Petrović', '+381 65 555 1234', false,
    6, 22.00, 132.00,
    6, 12.00, 72.00,
    204.00, 2, 40.00,
    '', 0.00, 244.00, false
);