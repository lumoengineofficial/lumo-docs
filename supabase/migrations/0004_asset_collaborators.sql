-- ---------------------------------------------------------------------------
-- 0004: collaborative publishing - up to 2 extra people per asset
-- Owner (assets.author_id) + collaborators (this table) = max 3 contributors.
-- ---------------------------------------------------------------------------

create table if not exists public.asset_collaborators (
  asset_id   uuid not null references public.assets (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (asset_id, user_id)
);

create index if not exists asset_collaborators_user_idx
  on public.asset_collaborators (user_id);

alter table public.asset_collaborators enable row level security;

drop policy if exists "collaborators are readable" on public.asset_collaborators;
create policy "collaborators are readable"
  on public.asset_collaborators for select
  using (true);

grant select on public.asset_collaborators to anon, authenticated, service_role;
grant insert, update, delete on public.asset_collaborators to service_role;
