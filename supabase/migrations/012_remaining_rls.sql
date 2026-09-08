-- ============================================
-- Margin Intelligence
-- Migration 012: Remaining RLS
-- ============================================

create policy "Users can manage cost profiles in their businesses"
on public.product_cost_profiles
for all
using (
  exists (
    select 1
    from public.products p
    join public.businesses b
      on b.id = p.business_id
    where p.id = product_cost_profiles.product_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products p
    join public.businesses b
      on b.id = p.business_id
    where p.id = product_cost_profiles.product_id
      and b.owner_id = auth.uid()
  )
);


create policy "Users can manage cost allocations in their businesses"
on public.cost_allocations
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = cost_allocations.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    join public.products p
      on p.id = cost_allocations.product_id
    where b.id = cost_allocations.business_id
      and b.owner_id = auth.uid()
      and p.business_id = cost_allocations.business_id
  )
);


create policy "Users can manage insights in their businesses"
on public.insights
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = insights.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = insights.business_id
      and b.owner_id = auth.uid()
  )
);


create policy "Users can view audit logs in their businesses"
on public.audit_logs
for select
using (
  exists (
    select 1
    from public.businesses b
    where b.id = audit_logs.business_id
      and b.owner_id = auth.uid()
  )
);


alter table public.product_cost_profiles enable row level security;

alter table public.cost_allocations enable row level security;

alter table public.insights enable row level security;

alter table public.audit_logs enable row level security;