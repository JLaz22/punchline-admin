begin;
alter table public.profiles add column if not exists is_superadmin boolean not null default false;
create or replace function public.guard_superadmin_flag()
returns trigger language plpgsql set search_path = '' as $$
begin
 if current_user in ('anon','authenticated') then
  if TG_OP = 'INSERT' and new.is_superadmin then
   raise exception 'Superadmin status is managed by the database owner';
  elsif TG_OP = 'UPDATE' and new.is_superadmin is distinct from old.is_superadmin then
   raise exception 'Superadmin status is managed by the database owner';
  end if;
 end if;
 return new;
end;
$$;
drop trigger if exists protect_superadmin_flag on public.profiles;
create trigger protect_superadmin_flag before insert or update on public.profiles
for each row execute function public.guard_superadmin_flag();
create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = '' as $$
 select coalesce((auth.jwt()->'app_metadata'->>'provider') = 'google',false)
 and exists (select 1 from public.profiles where id=(select auth.uid()) and is_superadmin=true);
$$;
revoke all on function public.is_superadmin() from public;
grant execute on function public.is_superadmin() to authenticated;
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.votes enable row level security;
drop policy if exists "Superadmins read profiles" on public.profiles;
create policy "Superadmins read profiles" on public.profiles for select to authenticated using ((select public.is_superadmin()));
drop policy if exists "Superadmins read votes" on public.votes;
create policy "Superadmins read votes" on public.votes for select to authenticated using ((select public.is_superadmin()));
drop policy if exists "Superadmins update media" on public.generations;
create policy "Superadmins update media" on public.generations for update to authenticated using ((select public.is_superadmin())) with check ((select public.is_superadmin()));
drop policy if exists "Superadmins delete media" on public.generations;
create policy "Superadmins delete media" on public.generations for delete to authenticated using ((select public.is_superadmin()));
-- Existing insert policy permits an admin to create media with their own author ID.
-- Only content metadata is editable; totals, author IDs and timestamps stay immutable.
revoke update on public.generations from authenticated;
grant update (content,prompt,style,model,image_url,image_alt) on public.generations to authenticated;
commit;
