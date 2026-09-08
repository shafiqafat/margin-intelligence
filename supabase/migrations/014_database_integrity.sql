-- ============================================
-- Margin Intelligence
-- Migration 014: Database Integrity Utilities
-- ============================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger set_businesses_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();


create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();


create trigger set_sales_updated_at
before update on public.sales
for each row
execute function public.set_updated_at();


create trigger set_expenses_updated_at
before update on public.expenses
for each row
execute function public.set_updated_at();


create trigger set_product_cost_profiles_updated_at
before update on public.product_cost_profiles
for each row
execute function public.set_updated_at();