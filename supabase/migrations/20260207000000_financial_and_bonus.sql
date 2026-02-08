alter table public.profiles add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  sponsor_id_found uuid;
  code text;
begin
  code := new.raw_user_meta_data->>'sponsor_referral_code';
  if code is not null then
    select id into sponsor_id_found from public.profiles where referral_code = code;
  end if;
  insert into public.profiles (id, email, full_name, sponsor_id, phone)
  values (
    new.id, new.email,
    new.raw_user_meta_data->>'full_name',
    sponsor_id_found,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create table if not exists public.bonus_config (
  level int primary key check (level >= 1 and level <= 5),
  percentage decimal(5,2) not null
);

insert into public.bonus_config (level, percentage) values
  (1, 10.00), (2, 5.00), (3, 3.00), (4, 2.00), (5, 1.00)
on conflict (level) do update set percentage = excluded.percentage;

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount decimal(10,2) not null,
  type text not null check (type in ('bonus', 'withdrawal', 'purchase')),
  description text,
  origin_order_id uuid references public.orders(id),
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "User View Own Transactions" on transactions for select using (auth.uid() = user_id);
create policy "Admin View All Transactions" on transactions for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create table if not exists public.withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount decimal(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  pix_key text,
  pix_key_type text,
  created_at timestamptz default now(),
  approved_at timestamptz,
  paid_at timestamptz
);

alter table public.withdrawals enable row level security;

create policy "User View Own Withdrawals" on withdrawals for select using (auth.uid() = user_id);
create policy "User Create Own Withdrawal" on withdrawals for insert with check (auth.uid() = user_id);
create policy "Admin Manage Withdrawals" on withdrawals for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Public Read Bonus Config" on bonus_config for select using (true);
create policy "Admin Update Bonus Config" on bonus_config for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create or replace function public.distribute_bonuses(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order record;
  v_buyer_id uuid;
  v_sponsor_id uuid;
  v_level int;
  v_percent decimal(5,2);
  v_amount decimal(10,2);
  v_order_amount decimal(10,2);
begin
  select o.id, o.user_id, o.amount into v_order from orders o where o.id = p_order_id;
  if not found then return; end if;

  v_buyer_id := v_order.user_id;
  v_order_amount := v_order.amount;

  select sponsor_id into v_sponsor_id from profiles where id = v_buyer_id;
  v_level := 1;

  while v_sponsor_id is not null and v_level <= 5 loop
    select percentage into v_percent from bonus_config where level = v_level;
    if v_percent is not null and v_percent > 0 then
      v_amount := (v_order_amount * v_percent) / 100.00;
      insert into transactions (user_id, amount, type, description, origin_order_id)
      values (v_sponsor_id, v_amount, 'bonus', 'Bônus nível ' || v_level || ' - Pedido ' || p_order_id, p_order_id);
      update profiles set wallet_balance = wallet_balance + v_amount where id = v_sponsor_id;
    end if;
    select sponsor_id into v_sponsor_id from profiles where id = v_sponsor_id;
    v_level := v_level + 1;
  end loop;
end;
$$;

create or replace function public.on_order_paid()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'paid' and (old.status is null or old.status <> 'paid') then
    perform public.distribute_bonuses(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_distribute_bonuses on public.orders;
create trigger trigger_distribute_bonuses
  after update on public.orders
  for each row execute procedure public.on_order_paid();
