create extension if not exists pgcrypto with schema extensions;

create table if not exists public.campus_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 100),
  email text not null,
  role text not null default 'student' check (role in ('student', 'professor', 'officer', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.campus_announcements (
  id text primary key,
  author_role text not null check (author_role in ('professor', 'officer', 'admin')),
  archived boolean not null default false,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.class_schedules (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_events (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_history (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.announcement_acknowledgments (
  announcement_id text not null references public.campus_announcements(id) on delete cascade,
  user_id uuid not null references public.campus_profiles(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create table if not exists public.campus_role_keys (
  key_hash bytea primary key,
  role text not null check (role in ('professor', 'officer', 'admin')),
  redeemed_by uuid unique references public.campus_profiles(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.current_campus_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.campus_profiles
  where id = (select auth.uid()) and active
$$;

create or replace function public.create_campus_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.campus_profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    lower(new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_campus_profile on auth.users;
create trigger on_auth_user_created_campus_profile
  after insert on auth.users
  for each row execute function public.create_campus_profile();

create or replace function public.sync_campus_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.campus_profiles
  set email = lower(new.email)
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_campus_email on auth.users;
create trigger on_auth_user_updated_campus_email
  after update of email on auth.users
  for each row execute function public.sync_campus_profile_email();

create or replace function public.redeem_campus_role_key(p_key text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.campus_profiles%rowtype;
  v_key public.campus_role_keys%rowtype;
begin
  if v_uid is null then raise exception 'Sign in before redeeming a role key.'; end if;
  select * into v_profile from public.campus_profiles where id = v_uid for update;
  if not found or not v_profile.active then raise exception 'This account is unavailable.'; end if;
  if v_profile.role <> 'student' then raise exception 'Only student accounts can redeem an access key.'; end if;
  select * into v_key
  from public.campus_role_keys
  where key_hash = extensions.digest(convert_to(upper(trim(p_key)), 'UTF8'), 'sha256')
    and redeemed_by is null
  for update;
  if not found then raise exception 'That key is invalid or has already been used.'; end if;
  update public.campus_role_keys
  set redeemed_by = v_uid, redeemed_at = now()
  where key_hash = v_key.key_hash;
  update public.campus_profiles set role = v_key.role where id = v_uid;
  return v_key.role;
end;
$$;

create or replace function public.acknowledge_campus_announcement(p_announcement_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or public.current_campus_role() is distinct from 'student' then
    raise exception 'Only active students can acknowledge announcements.';
  end if;
  insert into public.announcement_acknowledgments (announcement_id, user_id)
  values (p_announcement_id, auth.uid())
  on conflict do nothing;
end;
$$;

create or replace function public.admin_update_campus_profile(
  p_user_id uuid,
  p_full_name text,
  p_role text,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.campus_profiles%rowtype;
begin
  if public.current_campus_role() is distinct from 'admin' then raise exception 'Administrator access required.'; end if;
  if p_role is null or p_role not in ('student', 'professor', 'officer', 'admin') then raise exception 'Invalid role.'; end if;
  if p_active is null then raise exception 'Account status is required.'; end if;
  if p_full_name is null or length(trim(p_full_name)) not between 2 and 100 then raise exception 'Name must be between 2 and 100 characters.'; end if;
  perform id from public.campus_profiles where role = 'admin' and active order by id for update;
  select * into v_target from public.campus_profiles where id = p_user_id for update;
  if not found then raise exception 'Account not found.'; end if;
  if v_target.role = 'admin' and v_target.active and (p_role <> 'admin' or not p_active)
    and (select count(*) from public.campus_profiles where role = 'admin' and active) <= 1 then
    raise exception 'The last active administrator cannot be demoted or deactivated.';
  end if;
  update public.campus_profiles
  set full_name = trim(p_full_name), role = p_role, active = p_active
  where id = p_user_id;
end;
$$;

create or replace function public.issue_campus_role_key(p_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if public.current_campus_role() is distinct from 'admin' then raise exception 'Administrator access required.'; end if;
  if p_role is null or p_role not in ('professor', 'officer', 'admin') then raise exception 'Invalid elevated role.'; end if;
  v_key := upper(encode(extensions.gen_random_bytes(12), 'hex'));
  v_key := substr(v_key, 1, 8) || '-' || substr(v_key, 9, 8) || '-' || substr(v_key, 17, 8);
  insert into public.campus_role_keys (key_hash, role)
  values (extensions.digest(convert_to(v_key, 'UTF8'), 'sha256'), p_role);
  return v_key;
end;
$$;

create or replace function public.active_campus_student_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.campus_profiles
  where role = 'student' and active
$$;

alter table public.campus_profiles enable row level security;
alter table public.campus_announcements enable row level security;
alter table public.class_schedules enable row level security;
alter table public.academic_events enable row level security;
alter table public.schedule_history enable row level security;
alter table public.announcement_acknowledgments enable row level security;
alter table public.campus_role_keys enable row level security;

create policy "profiles readable by owner or admin" on public.campus_profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.current_campus_role() = 'admin');

create policy "announcements readable by active users" on public.campus_announcements
  for select to authenticated using (public.current_campus_role() is not null);
create policy "authorized announcement creation" on public.campus_announcements
  for insert to authenticated
  with check (
    author_role = public.current_campus_role()
    and author_role in ('professor', 'officer', 'admin')
  );
create policy "announcement editors" on public.campus_announcements
  for update to authenticated
  using (public.current_campus_role() = 'admin' or author_role = public.current_campus_role())
  with check (public.current_campus_role() = 'admin' or author_role = public.current_campus_role());
create policy "announcement deletion" on public.campus_announcements
  for delete to authenticated
  using (public.current_campus_role() = 'admin' or author_role = public.current_campus_role());

create policy "schedules readable by active users" on public.class_schedules
  for select to authenticated using (public.current_campus_role() is not null);
create policy "schedule writers" on public.class_schedules
  for all to authenticated
  using (public.current_campus_role() in ('professor', 'officer', 'admin'))
  with check (public.current_campus_role() in ('professor', 'officer', 'admin'));

create policy "events readable by active users" on public.academic_events
  for select to authenticated using (public.current_campus_role() is not null);
create policy "event writers" on public.academic_events
  for all to authenticated
  using (public.current_campus_role() in ('professor', 'admin'))
  with check (public.current_campus_role() in ('professor', 'admin'));

create policy "history readable by active users" on public.schedule_history
  for select to authenticated using (public.current_campus_role() is not null);
create policy "history writers" on public.schedule_history
  for all to authenticated
  using (public.current_campus_role() in ('professor', 'officer', 'admin'))
  with check (public.current_campus_role() in ('professor', 'officer', 'admin'));

create policy "acknowledgments readable by active users" on public.announcement_acknowledgments
  for select to authenticated using (public.current_campus_role() is not null);
create policy "students acknowledge as themselves" on public.announcement_acknowledgments
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.current_campus_role() = 'student');

revoke all on public.campus_role_keys from anon, authenticated;
revoke all on function public.redeem_campus_role_key(text) from public, anon;
revoke all on function public.acknowledge_campus_announcement(text) from public, anon;
revoke all on function public.admin_update_campus_profile(uuid, text, text, boolean) from public, anon;
revoke all on function public.issue_campus_role_key(text) from public, anon;
revoke all on function public.active_campus_student_count() from public, anon;
grant execute on function public.redeem_campus_role_key(text) to authenticated;
grant execute on function public.acknowledge_campus_announcement(text) to authenticated;
grant execute on function public.admin_update_campus_profile(uuid, text, text, boolean) to authenticated;
grant execute on function public.issue_campus_role_key(text) to authenticated;
grant execute on function public.active_campus_student_count() to authenticated;

grant select on public.campus_profiles to authenticated;
grant select, insert, update, delete on public.campus_announcements to authenticated;
grant select, insert, update, delete on public.class_schedules to authenticated;
grant select, insert, update, delete on public.academic_events to authenticated;
grant select, insert, update, delete on public.schedule_history to authenticated;
grant select, insert on public.announcement_acknowledgments to authenticated;

revoke all on public.campus_profiles from anon;
revoke all on public.campus_announcements from anon;
revoke all on public.class_schedules from anon;
revoke all on public.academic_events from anon;
revoke all on public.schedule_history from anon;
revoke all on public.announcement_acknowledgments from anon;

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'campus_announcements', 'class_schedules', 'academic_events',
    'schedule_history', 'announcement_acknowledgments', 'campus_profiles'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end;
$$;
