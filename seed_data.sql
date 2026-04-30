-- SEED DATA FOR ALIENKIND RETAIL OS
-- Run this in your Supabase SQL Editor to populate the dashboard with real data.

-- 1. Seed some sample orders
INSERT INTO orders (email, total_amount, status, shipping_address)
VALUES 
('customer1@example.com', 12500, 'paid', '{"city": "Mumbai", "address": "123 Marine Drive"}'),
('customer2@example.com', 24999, 'pending', '{"city": "Delhi", "address": "456 Hauz Khas"}'),
('customer3@example.com', 8500, 'shipped', '{"city": "Bangalore", "address": "789 Indiranagar"}'),
('customer4@example.com', 15000, 'delivered', '{"city": "Hyderabad", "address": "101 Jubilee Hills"}'),
('customer5@example.com', 4500, 'paid', '{"city": "Chennai", "address": "202 Adyar"}');

-- 2. Seed some staff members (optional, if you want to see them in System Settings)
-- Note: Replace the user_id with your actual user id from auth.users if you want it linked.
INSERT INTO staff_members (name, role)
VALUES 
('Admin Node 01', 'superadmin'),
('Fulfillment Bot', 'fulfillment');

-- 3. Seed some inventory logs
INSERT INTO inventory_logs (variant_id, change_amount, reason)
SELECT id, -1, 'Sample Order' FROM variants LIMIT 3;
