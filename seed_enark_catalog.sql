-- ENARK OS: CATALOG RECONSTITUTION
-- RUN THIS IN SUPABASE SQL EDITOR TO SEED HIGH-FIDELITY PRODUCTS

-- 1. CLEANUP (Optional - Uncomment if you want to wipe current products)
-- DELETE FROM variants;
-- DELETE FROM products;

-- 2. INSERT PRODUCTS
-- PRODUCT 01: THE "NEURAL_OVERDRIVE" HOODIE
INSERT INTO products (id, name, slug, description, base_price, category, is_active, metadata)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
    'NEURAL_OVERDRIVE HOODIE',
    'neural-overdrive-hoodie',
    'A high-density 450 GSM oversized hoodie featuring ultrasonic-welded seams and a reflective neural-network print. Designed for extreme climate resilience and industrial aesthetic focus.',
    12500,
    'STREETWEAR',
    true,
    '{"material": "100% HEAVY COTTON", "gsm": "450", "fit": "OVERSIZED", "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000"}'
) ON CONFLICT (id) DO NOTHING;

-- PRODUCT 02: THE "VOID_WALKER" TROUSERS
INSERT INTO products (id, name, slug, description, base_price, category, is_active, metadata)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'VOID_WALKER CARGO',
    'void-walker-cargo',
    'Technical cargo trousers with 8 modular pockets and adjustable bungee-cords. Constructed from a water-repellent ripstop fabric for operative utility in urban environments.',
    18000,
    'STREETWEAR',
    true,
    '{"material": "REINFORCED RIPSTOP", "gsm": "320", "fit": "TAPERED", "image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1000"}'
) ON CONFLICT (id) DO NOTHING;

-- PRODUCT 03: THE "GHOST_SHELL" TEE
INSERT INTO products (id, name, slug, description, base_price, category, is_active, metadata)
VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'GHOST_SHELL TEE',
    'ghost-shell-tee',
    'A minimalist, heavy-weight cotton tee with a structural fit. Features a low-profile Enark logo in high-density silicone and a technical asset tag on the sleeve.',
    6500,
    'STREETWEAR',
    true,
    '{"material": "STRUCTURAL JERSEY", "gsm": "280", "fit": "BOX_FIT", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000"}'
) ON CONFLICT (id) DO NOTHING;

-- 3. INSERT VARIANTS
-- VARIANTS FOR NEURAL_OVERDRIVE
INSERT INTO variants (id, product_id, size, stock_quantity)
VALUES 
    (uuid_generate_v4(), 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'S', 10),
    (uuid_generate_v4(), 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'M', 15),
    (uuid_generate_v4(), 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'L', 8),
    (uuid_generate_v4(), 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6', 'XL', 5)
ON CONFLICT DO NOTHING;

-- VARIANTS FOR VOID_WALKER
INSERT INTO variants (id, product_id, size, stock_quantity)
VALUES 
    (uuid_generate_v4(), 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '30', 12),
    (uuid_generate_v4(), 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '32', 20),
    (uuid_generate_v4(), 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '34', 15),
    (uuid_generate_v4(), 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '36', 7)
ON CONFLICT DO NOTHING;

-- VARIANTS FOR GHOST_SHELL
INSERT INTO variants (id, product_id, size, stock_quantity)
VALUES 
    (uuid_generate_v4(), 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'S', 25),
    (uuid_generate_v4(), 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'M', 40),
    (uuid_generate_v4(), 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'L', 30)
ON CONFLICT DO NOTHING;
