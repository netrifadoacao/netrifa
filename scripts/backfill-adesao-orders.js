const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const { data: configRow } = await supabase.from('app_config').select('value').eq('key', 'valor_adesao').single();
  const valorAdesao = Number(configRow?.value ?? 250);
  console.log('Valor adesão:', valorAdesao);

  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers({ perPage: 500 });
  if (usersErr) {
    console.error('Erro ao listar usuários:', usersErr.message);
    process.exit(1);
  }
  const approved = (users?.users ?? []).filter((u) => u.email_confirmed_at != null);
  console.log('Usuários aprovados (email confirmado):', approved.length);

  const { data: existingOrders } = await supabase
    .from('orders')
    .select('user_id')
    .eq('status', 'paid')
    .eq('amount', valorAdesao);
  const userIdsWithOrder = new Set((existingOrders ?? []).map((o) => o.user_id));

  let created = 0;
  for (const u of approved) {
    if (userIdsWithOrder.has(u.id)) continue;
    const { data: newOrder, error: insErr } = await supabase
      .from('orders')
      .insert({ user_id: u.id, product_id: null, amount: valorAdesao, status: 'pending' })
      .select('id')
      .single();
    if (insErr) {
      console.error('Erro ao criar pedido para', u.id, insErr.message);
      continue;
    }
    if (newOrder?.id) {
      const { error: updErr } = await supabase.from('orders').update({ status: 'paid' }).eq('id', newOrder.id);
      if (updErr) console.error('Erro ao marcar como pago', newOrder.id, updErr.message);
      else created++;
    }
  }
  console.log('Pedidos de adesão criados (e marcados como pagos):', created);
  if (created > 0) {
    console.log('Rode em seguida: npm run backfill:bonus');
  }
  console.log('Concluído.');
}

main().catch((e) => { console.error(e); process.exit(1); });
