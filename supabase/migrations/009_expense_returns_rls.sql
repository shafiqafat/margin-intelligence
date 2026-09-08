-- ============================================
-- Margin Intelligence
-- Migration 009: Returns & Expenses RLS
-- ============================================

create policy "Users can manage returns in their businesses"
on public.returns
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = returns.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    join public.products p
      on p.id = returns.product_id
    where b.id = returns.business_id
      and b.owner_id = auth.uid()
      and p.business_id = returns.business_id
  )
);


create policy "Users can manage cost categories in their businesses"
on public.cost_categories
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = cost_categories.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = cost_categories.business_id
      and b.owner_id = auth.uid()
  )
);


create policy "Users can manage expenses in their businesses"
on public.expenses
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = expenses.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    left join public.cost_categories c
      on c.id = expenses.category_id
    left join public.products p
      on p.id = expenses.product_id
    where b.id = expenses.business_id
      and b.owner_id = auth.uid()
      and (
        c.id is null
        or c.business_id = expenses.business_id
      )
      and (
        p.id is null
        or p.business_id = expenses.business_id
      )
  )
);


alter table public.returns enable row level security;

alter table public.cost_categories enable row level security;

alter table public.expenses enable row level security;