-- Rebuild Friendly database (tables + RLS) after Supabase project reset
-- Run this in Supabase Dashboard → SQL Editor.

-- Extensions (for gen_random_uuid)
create extension if not exists pgcrypto;

-- =========================
-- Profiles (optional, but useful)
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text,
  full_name text,
  avatar_url text
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================
-- Surveys (saved per user)
-- =========================
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hobbies text[] not null,
  zip_code text not null
);

create index if not exists surveys_user_created_at_idx
  on public.surveys (user_id, created_at desc);

alter table public.surveys enable row level security;

drop policy if exists "surveys_select_own" on public.surveys;
create policy "surveys_select_own"
  on public.surveys
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "surveys_insert_own" on public.surveys;
create policy "surveys_insert_own"
  on public.surveys
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "surveys_update_own" on public.surveys;
create policy "surveys_update_own"
  on public.surveys
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "surveys_delete_own" on public.surveys;
create policy "surveys_delete_own"
  on public.surveys
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =========================
-- Survey Activities (OpenAI output, cached per survey)
-- =========================
create table if not exists public.survey_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  survey_id uuid not null references public.surveys(id) on delete cascade,
  activities jsonb not null,
  openai_model text,
  unique (survey_id)
);

create index if not exists survey_activities_user_created_at_idx
  on public.survey_activities (user_id, created_at desc);

alter table public.survey_activities enable row level security;

drop policy if exists "survey_activities_select_own" on public.survey_activities;
create policy "survey_activities_select_own"
  on public.survey_activities
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "survey_activities_insert_own" on public.survey_activities;
create policy "survey_activities_insert_own"
  on public.survey_activities
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.surveys s
      where s.id = survey_id
        and s.user_id = auth.uid()
    )
  );

