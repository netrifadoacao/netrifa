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
  if sponsor_id_found is null then
    select id into sponsor_id_found from public.profiles where role = 'admin' order by created_at asc limit 1;
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

update public.profiles
set sponsor_id = (select id from public.profiles where role = 'admin' order by created_at asc limit 1)
where sponsor_id is null
  and id <> (select id from public.profiles where role = 'admin' order by created_at asc limit 1);
