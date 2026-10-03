-- ============================================================================
-- Lumo Asset Store — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once per project.
-- Safe to re-run: tables use IF NOT EXISTS, policies are dropped first.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users (public profile of auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  username    text not null default '',
  handle      text not null,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  banned      boolean not null default false,
  bio         text,
  website     text,
  created_at  timestamptz not null default now()
);

create unique index if not exists users_handle_key on public.users (handle);
create unique index if not exists users_email_key on public.users (email);

-- Every new auth user automatically gets a profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_handle   text;
  v_role     text;
begin
  v_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  v_handle := coalesce(
    nullif(new.raw_user_meta_data ->> 'handle', ''),
    regexp_replace(lower(v_username), '[^a-z0-9_]', '', 'g')
  );

  if length(v_handle) < 2 then
    v_handle := 'user';
  end if;

  v_role := case when lower(coalesce(new.email, '')) = 'admin@lumo.dev'
                 then 'admin' else 'user' end;

  begin
    insert into public.users (id, email, username, handle, role)
    values (new.id, new.email, v_username, v_handle, v_role);
  exception when unique_violation then
    insert into public.users (id, email, username, handle, role)
    values (
      new.id,
      new.email,
      v_username,
      v_handle || '_' || substr(md5(new.id::text), 1, 4),
      v_role
    );
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- assets
-- ---------------------------------------------------------------------------
create table if not exists public.assets (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.users (id) on delete cascade,
  title         text not null,
  slug          text not null unique,
  description   text not null default '',
  category      text not null check (
                  category in (
                    '3D Models',
                    'Textures & Materials',
                    'Sprites & 2D',
                    'Audio',
                    'Plugins',
                    'Templates'
                  )
                ),
  tags          text[] not null default '{}',
  price         numeric(10, 2) not null default 0 check (price >= 0),
  license       text not null default 'Lumo Asset License',
  version       text not null default '1.0.0',
  file_url      text not null default '',
  thumbnail_url text not null default '',
  file_size     bigint not null default 0,
  downloads     integer not null default 0,
  status        text not null default 'draft'
                  check (status in ('draft', 'pending', 'approved', 'rejected')),
  featured      boolean not null default false,
  review_note   text,
  created_at    timestamptz not null default now()
);

create index if not exists assets_status_created_idx on public.assets (status, created_at desc);
create index if not exists assets_author_idx         on public.assets (author_id);
create index if not exists assets_category_idx       on public.assets (category);
create index if not exists assets_downloads_idx      on public.assets (downloads desc);
create index if not exists assets_featured_idx       on public.assets (featured) where featured;
create index if not exists assets_tags_idx           on public.assets using gin (tags);

-- ---------------------------------------------------------------------------
-- ratings (display only in v1 — phase 2 adds a submission UI)
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  asset_id   uuid not null references public.assets (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  stars      integer not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  unique (asset_id, user_id)
);

create index if not exists ratings_asset_idx on public.ratings (asset_id);

-- ---------------------------------------------------------------------------
-- assets_public — catalogue view with aggregated rating
-- Visibility: approved assets for everyone, own + admin rows for their owner.
-- ---------------------------------------------------------------------------
create or replace view public.assets_public
as
select a.*,
       coalesce(r.avg_stars, 0)::numeric(3, 1) as rating,
       coalesce(r.rating_count, 0)::integer    as rating_count
from public.assets a
left join (
  select asset_id,
         avg(stars)::numeric(3, 1) as avg_stars,
         count(*)::integer         as rating_count
  from public.ratings
  group by asset_id
) r on r.asset_id = a.id
where a.status = 'approved'
   or (auth.uid() is not null
       and (a.author_id = auth.uid()
            or exists (select 1 from public.users u
                       where u.id = auth.uid() and u.role = 'admin')));

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and banned = false
  );
$$;

-- Used by GET /api/assets/[id]/download to bump the counter atomically.
create or replace function public.increment_downloads(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.assets set downloads = downloads + 1 where id = p_id;
$$;

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
alter table public.users   enable row level security;
alter table public.assets  enable row level security;
alter table public.ratings enable row level security;

drop policy if exists "profiles are readable"        on public.users;
drop policy if exists "profiles are inserted by owner" on public.users;
drop policy if exists "profiles are updated by owner"  on public.users;
drop policy if exists "profiles are updated by admins" on public.users;

create policy "profiles are readable"
  on public.users for select
  using (true);

create policy "profiles are inserted by owner"
  on public.users for insert
  with check (auth.uid() = id);

create policy "profiles are updated by owner"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles are updated by admins"
  on public.users for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "assets are readable"     on public.assets;
drop policy if exists "assets inserted by owner" on public.assets;
drop policy if exists "assets updated by owner"  on public.assets;
drop policy if exists "assets deleted by owner"  on public.assets;

create policy "assets are readable"
  on public.assets for select
  using (
    status = 'approved'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "assets inserted by owner"
  on public.assets for insert
  with check (author_id = auth.uid() or public.is_admin());

create policy "assets updated by owner"
  on public.assets for update
  using (author_id = auth.uid() or public.is_admin());

create policy "assets deleted by owner"
  on public.assets for delete
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "ratings are readable" on public.ratings;
drop policy if exists "ratings inserted by owner" on public.ratings;

create policy "ratings are readable"
  on public.ratings for select
  using (true);

create policy "ratings inserted by owner"
  on public.ratings for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- storage buckets: "assets" (zips) and "covers" (thumbnails)
-- Uploads happen server-side with the service role; buckets stay public-read
-- so download links and thumbnails work without signing URLs.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true),
       ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "store objects are publicly readable" on storage.objects;
drop policy if exists "store objects can be uploaded"       on storage.objects;
drop policy if exists "store objects can be updated"        on storage.objects;
drop policy if exists "store objects can be deleted"        on storage.objects;

create policy "store objects are publicly readable"
  on storage.objects for select
  using (bucket_id in ('assets', 'covers'));

create policy "store objects can be uploaded"
  on storage.objects for insert
  with check (
    bucket_id in ('assets', 'covers')
    and (auth.role() = 'authenticated' or public.is_admin())
  );

create policy "store objects can be updated"
  on storage.objects for update
  using (
    bucket_id in ('assets', 'covers')
    and (owner_id::text = auth.uid()::text or public.is_admin())
  );

create policy "store objects can be deleted"
  on storage.objects for delete
  using (
    bucket_id in ('assets', 'covers')
    and (owner_id::text = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- grants (Supabase roles)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant select on public.users        to anon, authenticated, service_role;
grant select on public.assets       to anon, authenticated, service_role;
grant select on public.assets_public to anon, authenticated, service_role;
grant select on public.ratings      to anon, authenticated, service_role;
grant execute on function public.increment_downloads(uuid) to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
