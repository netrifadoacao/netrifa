create table if not exists public.admin_users (
  user_id uuid not null references auth.users(id) on delete cascade primary key
);

alter table public.admin_users enable row level security;

create policy "Authenticated read admin_users" on public.admin_users for select using (auth.uid() is not null);

insert into public.admin_users (user_id)
select id from public.profiles where role = 'admin'
on conflict (user_id) do nothing;

drop policy if exists "Admin Full Access" on public.profiles;

create policy "Admin Full Access" on public.profiles for all using (
  exists (select 1 from public.admin_users where user_id = auth.uid())
);

create or replace function public.sync_admin_users()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'admin' then
    insert into public.admin_users (user_id) values (new.id) on conflict (user_id) do nothing;
  else
    delete from public.admin_users where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_admin_users_trigger on public.profiles;
create trigger sync_admin_users_trigger
  after insert or update of role on public.profiles
  for each row execute procedure public.sync_admin_users();

insert into public.admin_users (user_id)
select id from public.profiles where role = 'admin'
on conflict (user_id) do nothing;
