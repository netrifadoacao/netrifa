create extension if not exists "pgcrypto";

do $$
declare
  v_admin_id uuid := 'a0000001-0000-4000-8000-000000000001';
  v_m1_id uuid := 'a0000002-0000-4000-8000-000000000002';
  v_m2_id uuid := 'a0000003-0000-4000-8000-000000000003';
  v_m3_id uuid := 'a0000004-0000-4000-8000-000000000004';
  v_pw text := crypt('Senha123!', gen_salt('bf'));
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@projetodoacao.com', v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Admin AS Miranda"}', now(), now(), '', '', '', ''),
    (v_m1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'membro1@projetodoacao.com', v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Silva"}', now(), now(), '', '', '', ''),
    (v_m2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'membro2@projetodoacao.com', v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"João Santos"}', now(), now(), '', '', '', ''),
    (v_m3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'membro3@projetodoacao.com', v_pw, now(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Costa"}', now(), now(), '', '', '', '');

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (v_admin_id, v_admin_id, format('{"sub":"%s","email":"admin@projetodoacao.com"}', v_admin_id)::jsonb, 'email', v_admin_id::text, now(), now(), now()),
    (v_m1_id, v_m1_id, format('{"sub":"%s","email":"membro1@projetodoacao.com"}', v_m1_id)::jsonb, 'email', v_m1_id::text, now(), now(), now()),
    (v_m2_id, v_m2_id, format('{"sub":"%s","email":"membro2@projetodoacao.com"}', v_m2_id)::jsonb, 'email', v_m2_id::text, now(), now(), now()),
    (v_m3_id, v_m3_id, format('{"sub":"%s","email":"membro3@projetodoacao.com"}', v_m3_id)::jsonb, 'email', v_m3_id::text, now(), now(), now());

  update public.profiles set role = 'admin' where id = v_admin_id;

  update public.profiles set sponsor_id = v_admin_id where id in (v_m1_id, v_m2_id);
  update public.profiles set sponsor_id = v_m1_id where id = v_m3_id;
end $$;
