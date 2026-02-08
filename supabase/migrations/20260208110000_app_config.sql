create table if not exists public.app_config (
  key text primary key,
  value decimal(10,2) not null
);

alter table public.app_config enable row level security;

create policy "Public Read App Config" on app_config for select using (true);
create policy "Admin Update App Config" on app_config for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

insert into public.app_config (key, value) values
  ('valor_adesao', 250.00),
  ('limite_maximo_saque', 3000.00)
on conflict (key) do update set value = excluded.value;
