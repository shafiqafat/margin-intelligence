-- ============================================
-- Margin Intelligence
-- Migration 003: Purchase Tables
-- ============================================


-- ============================================
-- 1. PURCHASES
-- One record represents one supplier purchase
-- ============================================

create table public.purchases (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  supplier_id uuid not null
    references public.suppliers(id)
    on delete restrict,

  purchase_date date not null,

  reference text,

  subtotal numeric(12,2) not null default 0,
  shipping_cost numeric(12,2) not null default 0,
  additional_cost numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0,

  notes text,

  created_at timestamptz not null default now(),

  constraint purchases_subtotal_non_negative
    check (subtotal >= 0),

  constraint purchases_shipping_non_negative
    check (shipping_cost >= 0),

  constraint purchases_additional_cost_non_negative
    check (additional_cost >= 0),

  constraint purchases_total_non_negative
    check (total_cost >= 0)
);


-- ============================================
-- 2. PURCHASE ITEMS
-- Products contained inside a purchase
-- ============================================

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),

  purchase_id uuid not null
    references public.purchases(id)
    on delete cascade,

  product_id uuid not null
    references public.products(id)
    on delete restrict,

  quantity numeric(12,2) not null,

  unit_cost numeric(12,2) not null,

  total_cost numeric(12,2) not null,

  created_at timestamptz not null default now(),

  constraint purchase_items_quantity_positive
    check (quantity > 0),

  constraint purchase_items_unit_cost_non_negative
    check (unit_cost >= 0),

  constraint purchase_items_total_cost_non_negative
    check (total_cost >= 0)
);


-- ============================================
-- INDEXES
-- ============================================

create index purchases_business_id_idx
  on public.purchases(business_id);

create index purchases_supplier_id_idx
  on public.purchases(supplier_id);

create index purchases_purchase_date_idx
  on public.purchases(purchase_date);

create index purchase_items_purchase_id_idx
  on public.purchase_items(purchase_id);

create index purchase_items_product_id_idx
  on public.purchase_items(product_id);