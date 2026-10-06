-- ---------------------------------------------------------------------------
-- 0003: assignable profile badges (verified / admin / partner / new)
-- Stored as text[] on public.users; managed from /admin/users.
-- ---------------------------------------------------------------------------

alter table public.users
  add column if not exists badges text[] not null default '{new}';

-- Existing admins keep the verified + admin pair they already display.
update public.users
   set badges = '{verified,admin}'
 where role = 'admin'
   and badges = '{new}';

-- Only admins (or key-less sessions such as SQL/service role) may change badges.
create or replace function public.protect_user_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.badges is distinct from old.badges and auth.uid() is not null then
    if not exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin' and banned = false
    ) then
      raise exception 'only admins can change badges';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists users_protect_badges on public.users;
create trigger users_protect_badges
  before update on public.users
  for each row
  execute function public.protect_user_badges();

grant select on public.users to anon, authenticated, service_role;
