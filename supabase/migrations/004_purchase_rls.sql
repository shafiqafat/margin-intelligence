-- ============================================
-- Margin Intelligence
-- Migration 004: Purchase RLS Policies
-- ============================================


-- ============================================
-- PURCHASES
-- ============================================

create policy "Users can manage purchases in their businesses"
on public.purchases
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = purchases.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    join public.suppliers s
      on s.id = purchases.supplier_id
    where b.id = purchases.business_id
      and b.owner_id = auth.uid()
      and s.business_id = purchases.business_id
  )
);


-- ============================================
-- PURCHASE ITEMS
-- ============================================

create policy "Users can manage purchase items in their businesses"
on public.purchase_items
for all
using (
  exists (
    select 1
    from public.purchases p
    join public.businesses b
      on b.id = p.business_id
    where p.id = purchase_items.purchase_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.purchases p
    join public.businesses b
      on b.id = p.business_id
    join public.products pr
      on pr.id = purchase_items.product_id
    where p.id = purchase_items.purchase_id
      and b.owner_id = auth.uid()
      and pr.business_id = p.business_id
  )
);


-- ============================================
-- ENABLE RLS
-- ============================================

alter table public.purchases enable row level security;

alter table public.purchase_items enable row level security;