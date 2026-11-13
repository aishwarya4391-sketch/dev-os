-- =============================================================================
-- MRA Specialist UI — Supabase schema (sign-in only)
-- Paste into the Supabase SQL Editor on a fresh project. Safe to re-run.
--
-- Scope: Supabase is used for AUTH ONLY (engineering-doc §7.3). Menu data,
-- memory and audit live in the Azure web app and Airtable, so there are no
-- menu tables here. This file provides:
--   1. Role enum + validation of app_metadata.role
--   2. Default role ('specialist') assigned on sign-up
--   3. A lead/admin-only function to change another user's role
--   4. A read-only profile mirror (public.user_profiles) with RLS
-- The web app verifies the JWT and reads role from app_metadata.role.
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Role enum ---------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'mra_role') then
    create type public.mra_role as enum ('specialist', 'lead', 'admin');
  end if;
end$$;

-- 2. Profiles mirror (display only; the JWT app_metadata is authoritative) ----
create table if not exists public.user_profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        public.mra_role not null default 'specialist',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists user_profiles_role_idx on public.user_profiles (role);

-- 3. updated_at trigger -------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- 4. On sign-up: create profile and stamp default role in app_metadata --------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.user_profiles (user_id, email, role)
  values (new.id, new.email, 'specialist')
  on conflict (user_id) do nothing;

  update auth.users
     set raw_app_meta_data =
           coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'specialist')
   where id = new.id
     and (raw_app_meta_data ->> 'role') is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Role change function (lead/admin only; leads cannot grant admin) ---------
create or replace function public.set_user_role(target_user uuid, new_role public.mra_role)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_role text := coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '');
begin
  if caller_role not in ('lead', 'admin') then
    raise exception 'forbidden: only lead or admin can change roles' using errcode = '42501';
  end if;
  if new_role = 'admin' and caller_role <> 'admin' then
    raise exception 'forbidden: only admin can grant admin' using errcode = '42501';
  end if;

  update auth.users
     set raw_app_meta_data =
           coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new_role::text)
   where id = target_user;

  update public.user_profiles set role = new_role where user_id = target_user;
end;
$$;

revoke all on function public.set_user_role(uuid, public.mra_role) from public;
grant execute on function public.set_user_role(uuid, public.mra_role) to authenticated;

-- 6. Row Level Security -------------------------------------------------------
alter table public.user_profiles enable row level security;

drop policy if exists "profiles_select_own" on public.user_profiles;
create policy "profiles_select_own"
  on public.user_profiles for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "profiles_select_leads" on public.user_profiles;
create policy "profiles_select_leads"
  on public.user_profiles for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('lead', 'admin'));

-- No insert/update/delete policies: writes happen only through the triggers
-- and set_user_role() above (both security definer).

-- 7. Bootstrap the first admin (run once, replace the email) ------------------
-- update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--  where email = 'you@example.com';
-- update public.user_profiles set role = 'admin' where email = 'you@example.com';
