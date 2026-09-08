-- ============================================
-- Margin Intelligence
-- Migration 013: Return Integrity
-- ============================================

drop policy if exists "Users can manage returns in their businesses"
on public.returns;


create policy "Users can manage returns in their businesses"
on public.returns
for all
using (
  exists (
    select 1
    from public.businesses b
    join public.products p
      on p.id = returns.product_id
    left join public.sales s
      on s.id = returns.sale_id
    where b.id = returns.business_id
      and b.owner_id = auth.uid()
      and p.business_id = returns.business_id
      and (
        returns.sale_id is null
        or s.business_id = returns.business_id
      )
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    join public.products p
      on p.id = returns.product_id
    left join public.sales s
      on s.id = returns.sale_id
    where b.id = returns.business_id
      and b.owner_id = auth.uid()
      and p.business_id = returns.business_id
      and (
        returns.sale_id is null
        or s.business_id = returns.business_id
      )
  )
);