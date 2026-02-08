do $$
declare
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
  v_m17 uuid := 'a0000018-0000-4000-8000-000000000018';
  v_m19 uuid := 'a0000020-0000-4000-8000-000000000020';
  v_m20 uuid := 'a0000021-0000-4000-8000-000000000021';
  p1 uuid := 'b0000001-0000-4000-8000-000000000001';
  p2 uuid := 'b0000002-0000-4000-8000-000000000002';
  p3 uuid := 'b0000003-0000-4000-8000-000000000003';
  p4 uuid := 'b0000004-0000-4000-8000-000000000004';
  p5 uuid := 'b0000005-0000-4000-8000-000000000005';
  p6 uuid := 'b0000006-0000-4000-8000-000000000006';
begin
  insert into public.products (id, name, description, price, active, created_at) values
    (p1, 'Pacote Inicial', 'Kit de boas-vindas para novos membros', 97.00, true, now() - interval '30 days'),
    (p2, 'Curso Básico', 'Treinamento básico da metodologia', 247.00, true, now() - interval '28 days'),
    (p3, 'Curso Avançado', 'Aprofundamento e estratégias', 497.00, true, now() - interval '25 days'),
    (p4, 'Mentoria Mensal', 'Acompanhamento individual 30 dias', 297.00, true, now() - interval '20 days'),
    (p5, 'Evento Presencial', 'Workshop presencial 1 dia', 197.00, true, now() - interval '15 days'),
    (p6, 'Material de Apoio', 'E-books e planilhas', 47.00, true, now() - interval '10 days')
  on conflict (id) do update set name = excluded.name, description = excluded.description, price = excluded.price, active = excluded.active;

  insert into public.orders (user_id, product_id, amount, status, created_at) values
    (v_m1, p1, 97.00, 'paid', now() - interval '20 days'), (v_m2, p2, 247.00, 'paid', now() - interval '19 days'),
    (v_m3, p1, 97.00, 'paid', now() - interval '18 days'), (v_m4, p3, 497.00, 'paid', now() - interval '17 days'),
    (v_m5, p2, 247.00, 'paid', now() - interval '16 days'), (v_m6, p4, 297.00, 'paid', now() - interval '15 days'),
    (v_m7, p1, 97.00, 'paid', now() - interval '14 days'), (v_m8, p5, 197.00, 'paid', now() - interval '13 days'),
    (v_m9, p6, 47.00, 'paid', now() - interval '12 days'), (v_m10, p2, 247.00, 'paid', now() - interval '11 days'),
    (v_m11, p1, 97.00, 'paid', now() - interval '10 days'), (v_m12, p3, 497.00, 'paid', now() - interval '9 days'),
    (v_m13, p4, 297.00, 'paid', now() - interval '8 days'), (v_m14, p1, 97.00, 'paid', now() - interval '7 days'),
    (v_m15, p5, 197.00, 'paid', now() - interval '6 days'), (v_m17, p2, 247.00, 'paid', now() - interval '5 days'),
    (v_m19, p6, 47.00, 'paid', now() - interval '4 days'), (v_m20, p1, 97.00, 'paid', now() - interval '3 days'),
    (v_m1, p2, 247.00, 'paid', now() - interval '2 days'), (v_m3, p4, 297.00, 'paid', now() - interval '1 day'),
    (v_m5, p1, 97.00, 'paid', now() - interval '12 hours'), (v_m2, p1, 97.00, 'paid', now() - interval '8 days'),
    (v_m6, p2, 247.00, 'paid', now() - interval '5 days'), (v_m8, p1, 97.00, 'paid', now() - interval '7 days'),
    (v_m10, p4, 297.00, 'paid', now() - interval '4 days'), (v_m12, p1, 97.00, 'paid', now() - interval '6 days'),
    (v_m1, p2, 247.00, 'pending', now() - interval '2 days'), (v_m3, p4, 297.00, 'pending', now() - interval '1 day'),
    (v_m5, p1, 97.00, 'pending', now() - interval '5 hours'), (v_m8, p3, 497.00, 'pending', now() - interval '3 hours');

  insert into public.withdrawals (user_id, amount, status, pix_key, pix_key_type, created_at, approved_at, paid_at) values
    (v_m1, 150.00, 'paid', 'demo@email.com', 'email', now() - interval '14 days', now() - interval '14 days' + interval '2 hours', now() - interval '14 days' + interval '4 hours'),
    (v_m2, 80.00, 'approved', '11999990000', 'phone', now() - interval '13 days', now() - interval '13 days' + interval '1 hour', null),
    (v_m3, 200.00, 'pending', 'cpf-demo', 'cpf', now() - interval '12 days', null, null),
    (v_m4, 120.00, 'paid', 'conta@email.com', 'email', now() - interval '11 days', now() - interval '11 days' + interval '3 hours', now() - interval '11 days' + interval '5 hours'),
    (v_m5, 90.00, 'rejected', 'rejected@email.com', 'email', now() - interval '10 days', null, null),
    (v_m6, 180.00, 'pending', 'user6@email.com', 'email', now() - interval '9 days', null, null),
    (v_m7, 55.00, 'paid', 'user7@email.com', 'email', now() - interval '8 days', now() - interval '8 days' + interval '2 hours', now() - interval '8 days' + interval '6 hours'),
    (v_m8, 300.00, 'pending', 'user8@email.com', 'email', now() - interval '7 days', null, null),
    (v_m9, 75.00, 'approved', 'user9@email.com', 'email', now() - interval '6 days', now() - interval '6 days' + interval '1 hour', null),
    (v_m10, 160.00, 'paid', 'user10@email.com', 'email', now() - interval '5 days', now() - interval '5 days' + interval '2 hours', now() - interval '5 days' + interval '4 hours'),
    (v_m11, 95.00, 'pending', 'user11@email.com', 'email', now() - interval '4 days', null, null),
    (v_m12, 220.00, 'paid', 'user12@email.com', 'email', now() - interval '3 days', now() - interval '3 days' + interval '1 hour', now() - interval '3 days' + interval '3 hours'),
    (v_m1, 250.00, 'pending', '11999990000', 'phone', now() - interval '1 day', null, null),
    (v_m4, 180.00, 'pending', 'conta-demo@email.com', 'email', now() - interval '6 hours', null, null),
    (v_m10, 100.00, 'pending', 'conta2@email.com', 'email', now() - interval '2 hours', null, null);
end $$;
