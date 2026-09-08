-- ============================================
-- Margin Intelligence
-- Migration 008: Expenses & Cost Categories
-- ============================================

create table public.cost_categories (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  name text not null,

  type text not null,

  created_at timestamptz not null default now(),

  constraint cost_categories_type_valid
    check (type in ('direct', 'overhead'))
);


create table public.expenses (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  category_id uuid
    references public.cost_categories(id)
    on delete restrict,

  product_id uuid
    references public.products(id)
    on delete restrict,

  description text not null,

  amount numeric(12,2) not null,

  expense_date date not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint expenses_amount_non_negative
    check (amount >= 0)
);


create index cost_categories_business_id_idx
  on public.cost_categories(business_id);

create index expenses_business_id_idx
  on public.expenses(business_id);

create index expenses_category_id_idx
  on public.expenses(category_id);

create index expenses_product_id_idx
  on public.expenses(product_id);

create index expenses_expense_date_idx
  on public.expenses(expense_date);