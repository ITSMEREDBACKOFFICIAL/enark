-- ALIENKIND OS: SCHEMA 2.0 (PROFESSIONAL RETAIL SUITE)

-- 1. TAX & GST ENGINE
CREATE TABLE tax_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name TEXT NOT NULL, -- e.g., 'India-GST', 'EU-VAT'
    tax_rate NUMERIC(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DISCOUNTS & RETENTION
CREATE TABLE discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
    value NUMERIC(12, 2) NOT NULL,
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    max_uses INT DEFAULT 100,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- 3. ABANDONED CART TRACKING (Cart Events)
CREATE TABLE cart_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    items JSONB NOT NULL,
    total_value NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'recovered', 'expired')),
    last_interacted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recovery_email_sent BOOLEAN DEFAULT false
);

-- 4. STAFF & ROLE-BASED ACCESS (RBAC)
CREATE TABLE staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'manager', 'fulfillment')),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CRM & CUSTOMER INTELLIGENCE
CREATE TABLE customer_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    total_spent NUMERIC(12, 2) DEFAULT 0,
    order_count INT DEFAULT 0,
    is_vip BOOLEAN DEFAULT false,
    admin_notes TEXT,
    last_order_at TIMESTAMP WITH TIME ZONE
);

-- 6. PROFITABILITY EXTENSION (Update Variants Table)
ALTER TABLE variants ADD COLUMN IF NOT EXISTS cost_per_item NUMERIC(12, 2) DEFAULT 0;

-- 7. FULFILLMENT & TRACKING (Update Orders Table)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'returned'));

-- 8. SYSTEM CONFIG (Storefront Text Switcher)
CREATE TABLE app_config (
    id TEXT PRIMARY KEY DEFAULT 'main',
    marquee_text TEXT DEFAULT 'ALIENKIND // SYSTEM ONLINE // NEW DROP LIVE',
    announcement_banner TEXT DEFAULT 'FREE SHIPPING ON ORDERS OVER 5000',
    is_maintenance_mode BOOLEAN DEFAULT false
);
