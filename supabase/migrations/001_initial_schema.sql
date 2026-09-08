-- ============================================
-- Margin Intelligence
-- Migration 001: Initial Schema
-- ============================================


-- ============================================
-- 1. PROFILES
-- Extends Supabase Auth users
-- ============================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,
  avatar_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- 2. BUSINESSES
-- The business whose data we analyze
-- ============================================

create table public.businesses (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    references public.profiles(id)
    on delete restrict,

  name text not null,

  business_type text,
  country text not null default 'BD',
  currency text not null default 'USD',
  timezone text not null default 'Asia/Dhaka',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- 3. PRODUCTS
-- Products sold by the business
-- ============================================

create table public.products (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  name text not null,
  sku text,

  category text,

  selling_price numeric(12,2) not null default 0,
  target_margin numeric(5,2),

  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_selling_price_non_negative
    check (selling_price >= 0),

  constraint products_target_margin_valid
    check (
      target_margin is null
      or (target_margin >= 0 and target_margin <= 100)
    ),

  constraint products_status_valid
    check (status in ('active', 'inactive'))
);


-- ============================================
-- 4. SUPPLIERS
-- Suppliers from whom products are purchased
-- ============================================

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  name text not null,

  contact_name text,
  email text,
  phone text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================
-- 5. PRODUCT_SUPPLIERS
-- Connects products to suppliers
-- Many-to-many relationship
-- ============================================

create table public.product_suppliers (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  supplier_id uuid not null
    references public.suppliers(id)
    on delete cascade,

  is_primary boolean not null default false,

  created_at timestamptz not null default now(),

  constraint product_suppliers_unique
    unique (product_id, supplier_id)
);


-- ============================================
-- INDEXES
-- ============================================

create index businesses_owner_id_idx
  on public.businesses(owner_id);

create index products_business_id_idx
  on public.products(business_id);

create index suppliers_business_id_idx
  on public.suppliers(business_id);

create index product_suppliers_product_id_idx
  on public.product_suppliers(product_id);

create index product_suppliers_supplier_id_idx
  on public.product_suppliers(supplier_id);