-- ============================================
-- Margin Intelligence
-- Migration 006: Sales RLS
-- ============================================

create policy "Users can manage sales in their businesses"
on public.sales
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = sales.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = sales.business_id
      and b.owner_id = auth.uid()
  )
);


create policy "Users can manage sale items in their businesses"
on public.sale_items
for all
using (
  exists (
    select 1
    from public.sales s
    join public.businesses b
      on b.id = s.business_id
    where s.id = sale_items.sale_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.sales s
    join public.businesses b
      on b.id = s.business_id
    join public.products p
      on p.id = sale_items.product_id
    where s.id = sale_items.sale_id
      and b.owner_id = auth.uid()
      and p.business_id = s.business_id
  )
);


alter table public.sales enable row level security;

alter table public.sale_items enable row level security;