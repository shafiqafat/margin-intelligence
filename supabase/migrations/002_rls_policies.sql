-- ============================================
-- Margin Intelligence
-- RLS Policies - Initial Schema
-- ============================================


-- ============================================
-- PROFILES
-- Users can access only their own profile
-- ============================================

create policy "Users can manage their own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);


-- ============================================
-- BUSINESSES
-- Users can access only businesses they own
-- ============================================

create policy "Users can manage their own businesses"
on public.businesses
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);


-- ============================================
-- PRODUCTS
-- Users can access products belonging
-- to businesses they own
-- ============================================

create policy "Users can manage products in their businesses"
on public.products
for all
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = products.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = products.business_id
      and businesses.owner_id = auth.uid()
  )
);


-- ============================================
-- SUPPLIERS
-- Users can access suppliers belonging
-- to businesses they own
-- ============================================

create policy "Users can manage suppliers in their businesses"
on public.suppliers
for all
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = suppliers.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = suppliers.business_id
      and businesses.owner_id = auth.uid()
  )
);


-- ============================================
-- PRODUCT_SUPPLIERS
-- Users can access relationships involving
-- products from businesses they own
-- ============================================

create policy "Users can manage product suppliers in their businesses"
on public.product_suppliers
for all
using (
  exists (
    select 1
    from public.products
    join public.businesses
      on businesses.id = products.business_id
    where products.id = product_suppliers.product_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products
    join public.businesses
      on businesses.id = products.business_id
    where products.id = product_suppliers.product_id
      and businesses.owner_id = auth.uid()
  )
);