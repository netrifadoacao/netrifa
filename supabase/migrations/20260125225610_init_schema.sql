create extension if not exists pgcrypto;

create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  sponsor_id uuid references public.profiles(id),
  role text default 'member' check (role in ('admin', 'member')),
  referral_code text unique default encode(extensions.gen_random_bytes(6), 'hex'),
  wallet_balance decimal(10,2) default 0.00,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Policies (Segurança)
create policy "Public Read Sponsor" on profiles for select using (true); -- Necessário para validar código de indicação
create policy "User View Own" on profiles for select using (auth.uid() = id);
create policy "User Update Own" on profiles for update using (auth.uid() = id);
create policy "Admin Full Access" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Trigger para criar profile automaticamente ao criar usuário no Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  sponsor_id_found uuid;
  code text;
begin
  -- Tenta pegar o código do patrocinador dos metadados
  code := new.raw_user_meta_data->>'sponsor_referral_code';
  
  -- Se tiver código, busca o ID do patrocinador
  if code is not null then
    select id into sponsor_id_found from public.profiles where referral_code = code;
  end if;

  insert into public.profiles (id, email, full_name, sponsor_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    sponsor_id_found
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
