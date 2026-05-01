create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  product_name text not null default 'TASUKU AI',
  industry_label text not null default '',
  enabled_features text[] not null default array[]::text[],
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.companies (id, slug, name, product_name, industry_label, enabled_features)
values (
  '00000000-0000-0000-0000-000000000001',
  'tasuku-sr',
  'TASUKU AI 社労士版',
  'TASUKU AI',
  '社労士 AI アシスタント',
  array[
    'dashboard',
    'chat',
    'receipt',
    'law-alerts',
    'subsidy',
    'clients',
    'gas',
    'email',
    'minutes',
    'invoice',
    'customers',
    'estimate',
    'reservation',
    'history',
    'settings',
    'admin'
  ]
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  product_name = excluded.product_name,
  industry_label = excluded.industry_label,
  enabled_features = excluded.enabled_features,
  updated_at = now();

create table if not exists public.company_memberships (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table if not exists public.company_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_ai_configs (
  company_id uuid primary key references public.companies(id) on delete cascade,
  assistant_name text not null default 'AIアシスタント',
  assistant_description text not null default '',
  system_prompt text,
  suggested_questions text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.company_settings (company_id, settings)
values (
  '00000000-0000-0000-0000-000000000001',
  jsonb_build_object(
    'companyName', 'TASUKU AI 社労士版',
    'userName', '',
    'description', '社会保険労務士事務所向けのAI業務支援システムです。',
    'preferredStyle', 'standard',
    'products', '法改正アラート' || chr(10) || '助成金マッチング' || chr(10) || '領収書AI仕分け' || chr(10) || 'AIチャット',
    'prohibitedWords', '絶対、必ず、保証、最高、日本一',
    'signature', ''
  )
)
on conflict (company_id) do nothing;

insert into public.company_ai_configs (
  company_id,
  assistant_name,
  assistant_description,
  system_prompt,
  suggested_questions
)
values (
  '00000000-0000-0000-0000-000000000001',
  '社労士AIアシスタント',
  '労働法・社会保険・助成金について質問できます',
  'あなたは社会保険労務士事務所向けのAIアシスタントです。労働法、社会保険、助成金、就業規則、給与計算、法改正対応について、実務で使える形で回答してください。',
  array[
    'キャリアアップ助成金の申請要件を教えてください',
    '育児休業給付金の計算方法は？',
    '2026年の社会保険適用拡大について説明して',
    '就業規則の変更手続きを教えてください',
    '時間外労働の割増賃金の計算方法は？'
  ]
)
on conflict (company_id) do update set
  assistant_name = excluded.assistant_name,
  assistant_description = excluded.assistant_description,
  system_prompt = excluded.system_prompt,
  suggested_questions = excluded.suggested_questions,
  updated_at = now();

insert into public.company_memberships (company_id, user_id, role)
select
  '00000000-0000-0000-0000-000000000001',
  id,
  case
    when coalesce(raw_app_meta_data->>'role', raw_user_meta_data->>'role') = 'admin' then 'admin'
    else 'staff'
  end
from auth.users
on conflict (company_id, user_id) do nothing;

create or replace function public.handle_new_user_company_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_company_id uuid;
  target_role text;
begin
  target_company_id := coalesce(
    nullif(new.raw_user_meta_data->>'company_id', '')::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid
  );
  target_role := case
    when coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role') = 'admin' then 'admin'
    else 'staff'
  end;

  insert into public.company_memberships (company_id, user_id, role)
  values (target_company_id, new.id, target_role)
  on conflict (company_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_company_membership on auth.users;
create trigger on_auth_user_created_company_membership
after insert on auth.users
for each row execute function public.handle_new_user_company_membership();

alter table if exists public.receipts add column if not exists company_id uuid;
update public.receipts
set company_id = '00000000-0000-0000-0000-000000000001'
where company_id is null;
alter table if exists public.receipts alter column company_id set default '00000000-0000-0000-0000-000000000001';
alter table if exists public.receipts alter column company_id set not null;
create index if not exists receipts_company_id_idx on public.receipts(company_id);

alter table if exists public.clients add column if not exists company_id uuid;
update public.clients
set company_id = '00000000-0000-0000-0000-000000000001'
where company_id is null;
alter table if exists public.clients alter column company_id set default '00000000-0000-0000-0000-000000000001';
alter table if exists public.clients alter column company_id set not null;
create index if not exists clients_company_id_idx on public.clients(company_id);

alter table if exists public.law_alert_statuses add column if not exists company_id uuid;
alter table if exists public.law_alert_statuses add column if not exists alert_id text;
update public.law_alert_statuses
set
  company_id = coalesce(company_id, '00000000-0000-0000-0000-000000000001'),
  alert_id = coalesce(alert_id, id)
where company_id is null or alert_id is null;
alter table if exists public.law_alert_statuses alter column company_id set default '00000000-0000-0000-0000-000000000001';
alter table if exists public.law_alert_statuses alter column company_id set not null;
alter table if exists public.law_alert_statuses alter column alert_id set not null;
create index if not exists law_alert_statuses_company_id_idx on public.law_alert_statuses(company_id);

do $$
begin
  if to_regclass('public.receipts') is not null
     and not exists (select 1 from pg_constraint where conname = 'receipts_company_id_fkey') then
    alter table public.receipts
      add constraint receipts_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;

  if to_regclass('public.clients') is not null
     and not exists (select 1 from pg_constraint where conname = 'clients_company_id_fkey') then
    alter table public.clients
      add constraint clients_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;

  if to_regclass('public.law_alert_statuses') is not null
     and not exists (select 1 from pg_constraint where conname = 'law_alert_statuses_company_id_fkey') then
    alter table public.law_alert_statuses
      add constraint law_alert_statuses_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete cascade;
  end if;

  if to_regclass('public.law_alert_statuses') is not null
     and not exists (select 1 from pg_constraint where conname = 'law_alert_statuses_company_alert_unique') then
    alter table public.law_alert_statuses
      add constraint law_alert_statuses_company_alert_unique
      unique (company_id, alert_id);
  end if;
end $$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_memberships
    where company_id = target_company_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_company_admin(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_memberships
    where company_id = target_company_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.company_settings enable row level security;
alter table public.company_ai_configs enable row level security;

drop policy if exists tenant_select_companies on public.companies;
create policy tenant_select_companies
on public.companies
for select
to authenticated
using (public.is_company_member(id));

drop policy if exists tenant_select_memberships on public.company_memberships;
create policy tenant_select_memberships
on public.company_memberships
for select
to authenticated
using (user_id = auth.uid() or public.is_company_admin(company_id));

drop policy if exists tenant_insert_memberships on public.company_memberships;
create policy tenant_insert_memberships
on public.company_memberships
for insert
to authenticated
with check (public.is_company_admin(company_id));

drop policy if exists tenant_update_memberships on public.company_memberships;
create policy tenant_update_memberships
on public.company_memberships
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

drop policy if exists tenant_delete_memberships on public.company_memberships;
create policy tenant_delete_memberships
on public.company_memberships
for delete
to authenticated
using (public.is_company_admin(company_id));

drop policy if exists tenant_select_company_settings on public.company_settings;
create policy tenant_select_company_settings
on public.company_settings
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists tenant_upsert_company_settings on public.company_settings;
create policy tenant_upsert_company_settings
on public.company_settings
for all
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

drop policy if exists tenant_select_company_ai_configs on public.company_ai_configs;
create policy tenant_select_company_ai_configs
on public.company_ai_configs
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists tenant_update_company_ai_configs on public.company_ai_configs;
create policy tenant_update_company_ai_configs
on public.company_ai_configs
for all
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

do $$
begin
  if to_regclass('public.receipts') is not null then
    execute 'alter table public.receipts enable row level security';
    execute 'drop policy if exists tenant_select_receipts on public.receipts';
    execute 'create policy tenant_select_receipts on public.receipts for select to authenticated using (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_insert_receipts on public.receipts';
    execute 'create policy tenant_insert_receipts on public.receipts for insert to authenticated with check (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_update_receipts on public.receipts';
    execute 'create policy tenant_update_receipts on public.receipts for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_delete_receipts on public.receipts';
    execute 'create policy tenant_delete_receipts on public.receipts for delete to authenticated using (public.is_company_member(company_id))';
  end if;

  if to_regclass('public.clients') is not null then
    execute 'alter table public.clients enable row level security';
    execute 'drop policy if exists tenant_select_clients on public.clients';
    execute 'create policy tenant_select_clients on public.clients for select to authenticated using (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_insert_clients on public.clients';
    execute 'create policy tenant_insert_clients on public.clients for insert to authenticated with check (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_update_clients on public.clients';
    execute 'create policy tenant_update_clients on public.clients for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_delete_clients on public.clients';
    execute 'create policy tenant_delete_clients on public.clients for delete to authenticated using (public.is_company_member(company_id))';
  end if;

  if to_regclass('public.law_alert_statuses') is not null then
    execute 'alter table public.law_alert_statuses enable row level security';
    execute 'drop policy if exists tenant_select_law_alert_statuses on public.law_alert_statuses';
    execute 'create policy tenant_select_law_alert_statuses on public.law_alert_statuses for select to authenticated using (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_insert_law_alert_statuses on public.law_alert_statuses';
    execute 'create policy tenant_insert_law_alert_statuses on public.law_alert_statuses for insert to authenticated with check (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_update_law_alert_statuses on public.law_alert_statuses';
    execute 'create policy tenant_update_law_alert_statuses on public.law_alert_statuses for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id))';
    execute 'drop policy if exists tenant_delete_law_alert_statuses on public.law_alert_statuses';
    execute 'create policy tenant_delete_law_alert_statuses on public.law_alert_statuses for delete to authenticated using (public.is_company_member(company_id))';
  end if;
end $$;

grant select on public.companies to authenticated;
grant select, insert, update, delete on public.company_memberships to authenticated;
grant select, insert, update, delete on public.company_settings to authenticated;
grant select, insert, update, delete on public.company_ai_configs to authenticated;
