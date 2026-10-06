-- ---------------------------------------------------------------------------
-- ratings: phase 2 - submission UI
-- Lets an owner change or remove their own rating (the unique constraint
-- needs an UPDATE policy for upserts to work under RLS).
-- ---------------------------------------------------------------------------
drop policy if exists "ratings updated by owner" on public.ratings;
create policy "ratings updated by owner"
  on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ratings deleted by owner" on public.ratings;
create policy "ratings deleted by owner"
  on public.ratings for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.ratings to authenticated;
