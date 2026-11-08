-- Run after migrations in a trusted SQL editor. Every test row is rolled back.
begin;
insert into public.terms(term,definition) values('__observability_security_test__','Temporary fixture');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"provider":"google"}}',true);
do $$ begin
 if exists(select 1 from public.terms) then raise exception 'Non-admin can read terms'; end if;
 if exists(select 1 from public.llm_models) then raise exception 'Non-admin can read models'; end if;
 begin
  insert into public.prompt_chains(name) values('unauthorized');
  raise exception 'Non-admin created a chain';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into public.terms(term,definition) values('unauthorized','unauthorized');
  raise exception 'Non-admin created a term';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
