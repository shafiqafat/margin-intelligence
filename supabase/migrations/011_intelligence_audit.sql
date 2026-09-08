-- ============================================
-- Margin Intelligence
-- Migration 011: Intelligence & Audit Logs
-- ============================================

create table public.insights (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  type text not null,

  severity text not null default 'info',

  title text not null,

  description text not null,

  financial_impact numeric(12,2),

  entity_type text,

  entity_id uuid,

  status text not null default 'new',

  detected_at timestamptz not null default now(),

  resolved_at timestamptz,

  created_at timestamptz not null default now(),

  constraint insights_severity_valid
    check (
      severity in ('info', 'warning', 'risk', 'opportunity')
    ),

  constraint insights_status_valid
    check (
      status in (
        'new',
        'viewed',
        'investigating',
        'action_taken',
        'resolved'
      )
    )
);


create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  business_id uuid not null
    references public.businesses(id)
    on delete restrict,

  user_id uuid
    references auth.users(id)
    on delete set null,

  action text not null,

  entity_type text not null,

  entity_id uuid,

  old_data jsonb,

  new_data jsonb,

  created_at timestamptz not null default now()
);


create index insights_business_id_idx
  on public.insights(business_id);

create index insights_status_idx
  on public.insights(status);

create index insights_severity_idx
  on public.insights(severity);

create index insights_detected_at_idx
  on public.insights(detected_at);

create index insights_entity_idx
  on public.insights(entity_type, entity_id);

create index audit_logs_business_id_idx
  on public.audit_logs(business_id);

create index audit_logs_entity_idx
  on public.audit_logs(entity_type, entity_id);

create index audit_logs_created_at_idx
  on public.audit_logs(created_at);