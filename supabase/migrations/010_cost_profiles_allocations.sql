-- ============================================
-- Margin Intelligence
-- Migration 010: Cost Profiles & Allocations
-- ============================================

create table public.product_cost_profiles (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  expected_purchase_cost numeric(12,2) not null default 0,

  expected_shipping_cost numeric(12,2) not null default 0,

  expected_packaging_cost numeric(12,2) not null default 0,

  expected_payment_fee numeric(12,2) not null default 0,

  expected_delivery_cost numeric(12,2) not null default 0,

  target_margin numeric(5,2),

  effective_from date not null default current_date,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint product_cost_profiles_purchase_cost_non_negative
    check (expected_purchase_cost >= 0),

  constraint product_cost_profiles_shipping_non_negative
    check (expected_shipping_cost >= 0),

  constraint product_cost_profiles_packaging_non_negative
    check (expected_packaging_cost >= 0),

  constraint product_cost_profiles_payment_fee_non_negative
    check (expected_payment_fee >= 0),

  constraint product_cost_profiles_delivery_non_negative
    check (expected_delivery_cost >= 0),

  constraint product_cost_profiles_target_margin_valid
    check (
      target_margin is null
      or (target_margin >= 0 and target_margin <= 100)
    )
);


create table public.cost_allocations (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  source_type text not null,

  source_id uuid not null,

  product_id uuid not null
    references public.products(id)
    on delete restrict,

  amount numeric(12,2) not null,

  allocation_method text not null,

  created_at timestamptz not null default now(),

  constraint cost_allocations_amount_non_negative
    check (amount >= 0)
);


create index product_cost_profiles_product_id_idx
  on public.product_cost_profiles(product_id);

create index product_cost_profiles_effective_from_idx
  on public.product_cost_profiles(effective_from);

create index cost_allocations_business_id_idx
  on public.cost_allocations(business_id);

create index cost_allocations_source_idx
  on public.cost_allocations(source_type, source_id);

create index cost_allocations_product_id_idx
  on public.cost_allocations(product_id);