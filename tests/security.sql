-- Run through the trusted Supabase SQL editor. All fixture writes roll back.
begin;
select set_config('test.admin_id',(select id::text from public.profiles where is_superadmin limit 1),true);
select set_config('test.member_id',(select id::text from public.profiles where not is_superadmin limit 1),true);
select set_config('test.profile_count',(select count(*)::text from public.profiles),true);
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.member_id'),'role','authenticated','app_metadata',json_build_object('provider','google'))::text,true);
do $$ declare affected int; begin
 if public.is_superadmin() then raise exception 'Non-admin authorized'; end if;
 if exists(select 1 from public.profiles where id<>auth.uid()) then raise exception 'Profiles leaked'; end if;
 if exists(select 1 from public.votes where user_id<>auth.uid()) then raise exception 'Votes leaked'; end if;
 begin
  update public.profiles set is_superadmin=true where id=auth.uid();
  raise exception 'Self-promotion succeeded';
 exception when raise_exception then
  if SQLERRM='Self-promotion succeeded' then raise; end if;
 end;
 update public.generations set content=content;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Non-admin updated media'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.admin_id'),'role','authenticated','app_metadata',json_build_object('provider','google'))::text,true);
do $$ declare item bigint; begin
 if not public.is_superadmin() then raise exception 'Admin denied'; end if;
 if (select count(*) from public.profiles)<>current_setting('test.profile_count')::int then raise exception 'Admin cannot read all profiles'; end if;
 insert into public.generations(user_id,prompt,style,generation_prompt,content,model) values(auth.uid(),'Disposable admin test','deadpan','Test only','Disposable caption','test') returning id into item;
 update public.generations set content='Updated test' where id=item;
 if not exists(select 1 from public.generations where id=item and content='Updated test') then raise exception 'Update failed'; end if;
 delete from public.generations where id=item;
 if exists(select 1 from public.generations where id=item) then raise exception 'Delete failed'; end if;
end $$;
rollback;
select 'PASS: RLS isolation, blocked self-promotion, admin CRUD; fixture rolled back' as result;
