create extension if not exists "pgcrypto";

do $$
declare
  v_admin_id uuid := 'a0000001-0000-4000-8000-000000000001';
  v_m1 uuid := 'a0000002-0000-4000-8000-000000000002';
  v_m2 uuid := 'a0000003-0000-4000-8000-000000000003';
  v_m3 uuid := 'a0000004-0000-4000-8000-000000000004';
  v_m4 uuid := 'a0000005-0000-4000-8000-000000000005';
  v_m5 uuid := 'a0000006-0000-4000-8000-000000000006';
  v_m6 uuid := 'a0000007-0000-4000-8000-000000000007';
  v_m7 uuid := 'a0000008-0000-4000-8000-000000000008';
  v_m8 uuid := 'a0000009-0000-4000-8000-000000000009';
  v_m9 uuid := 'a0000010-0000-4000-8000-000000000010';
  v_m10 uuid := 'a0000011-0000-4000-8000-000000000011';
  v_m11 uuid := 'a0000012-0000-4000-8000-000000000012';
  v_m12 uuid := 'a0000013-0000-4000-8000-000000000013';
  v_m13 uuid := 'a0000014-0000-4000-8000-000000000014';
  v_m14 uuid := 'a0000015-0000-4000-8000-000000000015';
  v_m15 uuid := 'a0000016-0000-4000-8000-000000000016';
  v_m16 uuid := 'a0000017-0000-4000-8000-000000000017';
  v_m17 uuid := 'a0000018-0000-4000-8000-000000000018';
  v_m18 uuid := 'a0000019-0000-4000-8000-000000000019';
  v_m19 uuid := 'a0000020-0000-4000-8000-000000000020';
  v_m20 uuid := 'a0000021-0000-4000-8000-000000000021';
  v_pw text := crypt('Senha123!', gen_salt('bf'));
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  values
    (v_m4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro4@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pedro Oliveira"}', now(), now(), '', '', '', ''),
    (v_m5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro5@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carla Mendes"}', now(), now(), '', '', '', ''),
    (v_m6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro6@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ricardo Lima"}', now(), now(), '', '', '', ''),
    (v_m7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro7@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fernanda Souza"}', now(), now(), '', '', '', ''),
    (v_m8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro8@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bruno Alves"}', now(), now(), '', '', '', ''),
    (v_m9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro9@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Juliana Rocha"}', now(), now(), '', '', '', ''),
    (v_m10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro10@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lucas Pereira"}', now(), now(), '', '', '', ''),
    (v_m11, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro11@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amanda Costa"}', now(), now(), '', '', '', ''),
    (v_m12, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro12@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Martins"}', now(), now(), '', '', '', ''),
    (v_m13, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro13@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Patricia Ferreira"}', now(), now(), '', '', '', ''),
    (v_m14, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro14@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rodrigo Barbosa"}', now(), now(), '', '', '', ''),
    (v_m15, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro15@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Camila Nascimento"}', now(), now(), '', '', '', ''),
    (v_m16, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro16@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Gustavo Ribeiro"}', now(), now(), '', '', '', ''),
    (v_m17, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro17@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Larissa Cardoso"}', now(), now(), '', '', '', ''),
    (v_m18, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro18@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Thiago Castro"}', now(), now(), '', '', '', ''),
    (v_m19, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro19@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mariana Dias"}', now(), now(), '', '', '', ''),
    (v_m20, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'membro20@projetodoacao.com', v_pw, now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Felipe Araujo"}', now(), now(), '', '', '', '')
  on conflict (id) do nothing;

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  values
    (v_m4, v_m4, format('{"sub":"%s","email":"membro4@projetodoacao.com"}', v_m4)::jsonb, 'email', v_m4::text, now(), now(), now()),
    (v_m5, v_m5, format('{"sub":"%s","email":"membro5@projetodoacao.com"}', v_m5)::jsonb, 'email', v_m5::text, now(), now(), now()),
    (v_m6, v_m6, format('{"sub":"%s","email":"membro6@projetodoacao.com"}', v_m6)::jsonb, 'email', v_m6::text, now(), now(), now()),
    (v_m7, v_m7, format('{"sub":"%s","email":"membro7@projetodoacao.com"}', v_m7)::jsonb, 'email', v_m7::text, now(), now(), now()),
    (v_m8, v_m8, format('{"sub":"%s","email":"membro8@projetodoacao.com"}', v_m8)::jsonb, 'email', v_m8::text, now(), now(), now()),
    (v_m9, v_m9, format('{"sub":"%s","email":"membro9@projetodoacao.com"}', v_m9)::jsonb, 'email', v_m9::text, now(), now(), now()),
    (v_m10, v_m10, format('{"sub":"%s","email":"membro10@projetodoacao.com"}', v_m10)::jsonb, 'email', v_m10::text, now(), now(), now()),
    (v_m11, v_m11, format('{"sub":"%s","email":"membro11@projetodoacao.com"}', v_m11)::jsonb, 'email', v_m11::text, now(), now(), now()),
    (v_m12, v_m12, format('{"sub":"%s","email":"membro12@projetodoacao.com"}', v_m12)::jsonb, 'email', v_m12::text, now(), now(), now()),
    (v_m13, v_m13, format('{"sub":"%s","email":"membro13@projetodoacao.com"}', v_m13)::jsonb, 'email', v_m13::text, now(), now(), now()),
    (v_m14, v_m14, format('{"sub":"%s","email":"membro14@projetodoacao.com"}', v_m14)::jsonb, 'email', v_m14::text, now(), now(), now()),
    (v_m15, v_m15, format('{"sub":"%s","email":"membro15@projetodoacao.com"}', v_m15)::jsonb, 'email', v_m15::text, now(), now(), now()),
    (v_m16, v_m16, format('{"sub":"%s","email":"membro16@projetodoacao.com"}', v_m16)::jsonb, 'email', v_m16::text, now(), now(), now()),
    (v_m17, v_m17, format('{"sub":"%s","email":"membro17@projetodoacao.com"}', v_m17)::jsonb, 'email', v_m17::text, now(), now(), now()),
    (v_m18, v_m18, format('{"sub":"%s","email":"membro18@projetodoacao.com"}', v_m18)::jsonb, 'email', v_m18::text, now(), now(), now()),
    (v_m19, v_m19, format('{"sub":"%s","email":"membro19@projetodoacao.com"}', v_m19)::jsonb, 'email', v_m19::text, now(), now(), now()),
    (v_m20, v_m20, format('{"sub":"%s","email":"membro20@projetodoacao.com"}', v_m20)::jsonb, 'email', v_m20::text, now(), now(), now())
  on conflict (id) do nothing;

  update public.profiles set sponsor_id = v_admin_id where id in (v_m4, v_m5, v_m6);
  update public.profiles set sponsor_id = v_m1 where id in (v_m7, v_m8);
  update public.profiles set sponsor_id = v_m2 where id in (v_m9, v_m10);
  update public.profiles set sponsor_id = v_m3 where id = v_m11;
  update public.profiles set sponsor_id = v_m7 where id in (v_m12, v_m13);
  update public.profiles set sponsor_id = v_m9 where id in (v_m14, v_m15);
  update public.profiles set sponsor_id = v_m10 where id = v_m16;
  update public.profiles set sponsor_id = v_m12 where id in (v_m17, v_m18);
  update public.profiles set sponsor_id = v_m14 where id = v_m19;
  update public.profiles set sponsor_id = v_m17 where id = v_m20;
end $$;
