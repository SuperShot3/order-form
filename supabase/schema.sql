-- Order Desk - Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- Orders table (matches Excel schema)
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  order_link TEXT,
  customer_name TEXT,
  receiver_name TEXT,
  phone TEXT,
  preferred_contact TEXT,
  delivery_date TEXT,
  time_window TEXT,
  district TEXT,
  full_address TEXT,
  maps_link TEXT,
  bouquet_name TEXT,
  size TEXT,
  image_link TEXT,
  card_text TEXT,
  items_total NUMERIC,
  delivery_fee NUMERIC,
  sell_flowers_for NUMERIC,
  flowers_cost NUMERIC,
  total_profit NUMERIC,
  payment_status TEXT,
  payment_confirmed_time TEXT,
  florist_status INTEGER DEFAULT 0,
  florist_payment NUMERIC,
  driver_assigned TEXT,
  delivery_status TEXT,
  priority TEXT,
  notes TEXT,
  action_required TEXT DEFAULT 'No',
  action_required_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add image_link if missing (for existing installations)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_link TEXT;

-- Add sell_flowers_for (for existing installations)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sell_flowers_for NUMERIC;

-- Add action_required fields (for existing installations)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS action_required TEXT DEFAULT 'No';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS action_required_note TEXT;

-- Index for order_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- Settings table (single row)
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  required_fields JSONB,
  use_ai_parsing BOOLEAN DEFAULT FALSE,
  district_options JSONB,
  time_window_options JSONB,
  size_options JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Add size_options if missing (for existing installations)
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS size_options JSONB;

-- Insert default settings
INSERT INTO app_settings (id, required_fields, use_ai_parsing, district_options, time_window_options, size_options)
VALUES (
  1,
  '["bouquet_name","size","card_text","delivery_date","time_window","district","full_address","maps_link","receiver_name","phone","preferred_contact","items_total"]'::jsonb,
  FALSE,
  '["Nimman","Santitham","Suthep","Wualai","Jed Yod","Chang Khlan","Doi Saket","Hang Dong","Mae Rim"]'::jsonb,
  '["Standard (during the day)","08:00 - 10:00","10:00 - 12:00","12:00 - 14:00","14:00 - 16:00","16:00 - 18:00","18:00 - 20:00","19:00 - 21:00"]'::jsonb,
  '["S","M","L","XL"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  size_options = COALESCE(app_settings.size_options, EXCLUDED.size_options);
