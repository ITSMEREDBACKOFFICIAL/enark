-- Luxury D2C E-commerce Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Traditional', 'Formal', 'Streetwear')),
    base_price NUMERIC(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. VARIANTS (Size, Color)
CREATE TABLE variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price_override NUMERIC(12, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SIZE GUIDES
CREATE TABLE size_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    content JSONB NOT NULL, -- e.g., {"S": {"chest": "38", "length": "28"}, "M": {...}}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCT SIZE GUIDES (Mapping)
CREATE TABLE product_size_guides (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size_guide_id UUID REFERENCES size_guides(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, size_guide_id)
);

-- 5. ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Optional for guest checkout
    email TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES variants(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL
);

-- 7. INVENTORY LOGS
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES variants(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. DROP MODE CONFIG
CREATE TABLE app_config (
    id TEXT PRIMARY KEY DEFAULT 'main',
    is_drop_mode BOOLEAN DEFAULT false,
    drop_password TEXT,
    drop_countdown_to TIMESTAMP WITH TIME ZONE,
    free_shipping_threshold NUMERIC(12, 2) DEFAULT 5000
);

-- Seed initial config
INSERT INTO app_config (id) VALUES ('main') ON CONFLICT DO NOTHING;

-- RLS (Row Level Security) - Basic setup
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (is_active = true);

ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public variants are viewable by everyone" ON variants FOR SELECT USING (true);

-- Functions for Atomic Inventory Update
CREATE OR REPLACE FUNCTION decrement_inventory(v_id UUID, qty INT)
RETURNS VOID AS $$
BEGIN
    UPDATE variants
    SET stock_quantity = stock_quantity - qty
    WHERE id = v_id AND stock_quantity >= qty;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for variant %', v_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
