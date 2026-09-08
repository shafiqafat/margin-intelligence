-- ============================================
-- Margin Intelligence
-- Migration 005: Sales Tables
-- ============================================

create table public.sales (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  sale_date date not null,

  reference text,

  shipping_revenue numeric(12,2) not null default 0,

  delivery_cost numeric(12,2) not null default 0,

  payment_fee numeric(12,2) not null default 0,

  discount numeric(12,2) not null default 0,

  total_revenue numeric(12,2) not null default 0,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sales_shipping_revenue_non_negative
    check (shipping_revenue >= 0),

  constraint sales_delivery_cost_non_negative
    check (delivery_cost >= 0),

  constraint sales_payment_fee_non_negative
    check (payment_fee >= 0),

  constraint sales_discount_non_negative
    check (discount >= 0),

  constraint sales_total_revenue_non_negative
    check (total_revenue >= 0)
);


create table public.sale_items (
  id uuid primary key default gen_random_uuid(),

  sale_id uuid not null
    references public.sales(id)
    on delete cascade,

  product_id uuid not null
    references public.products(id)
    on delete restrict,

  quantity numeric(12,2) not null,

  unit_price numeric(12,2) not null,

  discount numeric(12,2) not null default 0,

  total_price numeric(12,2) not null,

  created_at timestamptz not null default now(),

  constraint sale_items_quantity_positive
    check (quantity > 0),

  constraint sale_items_unit_price_non_negative
    check (unit_price >= 0),

  constraint sale_items_discount_non_negative
    check (discount >= 0),

  constraint sale_items_total_price_non_negative
    check (total_price >= 0)
);


create index sales_business_id_idx
  on public.sales(business_id);

create index sales_sale_date_idx
  on public.sales(sale_date);

create index sale_items_sale_id_idx
  on public.sale_items(sale_id);

create index sale_items_product_id_idx
  on public.sale_items(product_id);