create or replace function public.distribute_bonuses(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_order record;
  v_buyer_id uuid;
  v_sponsor_id uuid;
  v_first_level_recipient uuid;
  v_level int;
  v_percent decimal(5,2);
  v_amount decimal(10,2);
  v_order_amount decimal(10,2);
  v_pos int;
  v_first_ref uuid;
  v_chain uuid[];
  v_idx int;
begin
  select o.id, o.user_id, o.amount into v_order from orders o where o.id = p_order_id;
  if not found then return; end if;

  v_buyer_id := v_order.user_id;
  v_order_amount := v_order.amount;
  select sponsor_id into v_sponsor_id from profiles where id = v_buyer_id;

  if v_sponsor_id is null then return; end if;

  select count(*)::int into v_pos from profiles p
  join profiles buyer on buyer.id = v_buyer_id
  where p.sponsor_id = v_sponsor_id and p.created_at <= buyer.created_at;

  if v_pos = 2 or v_pos = 3 then
    select id into v_first_ref from profiles
    where sponsor_id = v_sponsor_id
    order by created_at asc limit 1;
    v_first_level_recipient := v_first_ref;
    v_chain := array[v_first_level_recipient, v_sponsor_id];
  else
    v_first_level_recipient := v_sponsor_id;
    v_chain := array[v_sponsor_id];
  end if;

  v_idx := 2;
  while v_sponsor_id is not null and v_idx <= 5 loop
    select sponsor_id into v_sponsor_id from profiles where id = v_sponsor_id;
    if v_sponsor_id is not null then
      v_chain := array_append(v_chain, v_sponsor_id);
      v_idx := v_idx + 1;
    end if;
  end loop;

  v_level := 1;
  foreach v_sponsor_id in array v_chain loop
    exit when v_level > 5;
    select percentage into v_percent from bonus_config where level = v_level;
    if v_percent is not null and v_percent > 0 then
      v_amount := (v_order_amount * v_percent) / 100.00;
      insert into transactions (user_id, amount, type, description, origin_order_id)
      values (v_sponsor_id, v_amount, 'bonus', 'Bônus nível ' || v_level || ' - Pedido ' || p_order_id, p_order_id);
      update profiles set wallet_balance = wallet_balance + v_amount where id = v_sponsor_id;
    end if;
    v_level := v_level + 1;
  end loop;
end;
$$;
