-- ============================================
-- Margin Intelligence
-- Migration 007: Returns Tables
-- ============================================

create table public.returns (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  sale_id uuid
    references public.sales(id)
    on delete restrict,

  product_id uuid not null
    references public.products(id)
    on delete restrict,

  quantity numeric(12,2) not null,

  reason text,

  refund_amount numeric(12,2) not null default 0,

  return_shipping_cost numeric(12,2) not null default 0,

  restocking_cost numeric(12,2) not null default 0,

  return_date date not null,

  notes text,

  created_at timestamptz not null default now(),

  constraint returns_quantity_positive
    check (quantity > 0),

  constraint returns_refund_non_negative
    check (refund_amount >= 0),

  constraint returns_shipping_non_negative
    check (return_shipping_cost >= 0),

  constraint returns_restocking_non_negative
    check (restocking_cost >= 0)
);


create index returns_business_id_idx
  on public.returns(business_id);

create index returns_sale_id_idx
  on public.returns(sale_id);

create index returns_product_id_idx
  on public.returns(product_id);

create index returns_return_date_idx
  on public.returns(return_date);