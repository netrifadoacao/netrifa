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
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_*) no .env');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function main() {
  console.log('Carregando bonus_config...');
  const { data: configRows, error: configErr } = await supabase
    .from('bonus_config')
    .select('level, percentage')
    .order('level', { ascending: true });
  if (configErr) {
    console.error('Erro ao carregar bonus_config:', configErr.message);
    process.exit(1);
  }
  const bonusPercentByLevel = {};
  (configRows || []).forEach((r) => { bonusPercentByLevel[r.level] = Number(r.percentage); });
  console.log('Percentuais por nível:', bonusPercentByLevel);

  console.log('Carregando pedidos pagos (ordem cronológica)...');
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, user_id, amount, created_at')
    .eq('status', 'paid')
    .order('created_at', { ascending: true });
  if (ordersErr) {
    console.error('Erro ao carregar orders:', ordersErr.message);
    process.exit(1);
  }
  console.log('Total de pedidos pagos:', orders?.length ?? 0);
  if (!orders?.length) {
    console.log('Nenhum pedido pago. Encerrando.');
    return;
  }

  const { data: existingTx } = await supabase
    .from('transactions')
    .select('origin_order_id')
    .eq('type', 'bonus')
    .not('origin_order_id', 'is', null);
  const ordersWithBonus = new Set((existingTx || []).map((t) => t.origin_order_id));

  let processed = 0;
  let skipped = 0;
  let noSponsor = 0;
  let errors = 0;

  for (const order of orders) {
    if (ordersWithBonus.has(order.id)) {
      skipped++;
      continue;
    }
    const orderAmount = Number(order.amount);
    const buyerId = order.user_id;

    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('sponsor_id, created_at')
      .eq('id', buyerId)
      .single();
    if (!buyerProfile?.sponsor_id) {
      noSponsor++;
      continue;
    }

    const sponsorId = buyerProfile.sponsor_id;
    const buyerCreatedAt = buyerProfile.created_at || '';

    const { count: posCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('sponsor_id', sponsorId)
      .lte('created_at', buyerCreatedAt);
    const pos = posCount ?? 0;

    let chain = [];
    if (pos === 2 || pos === 3) {
      const { data: firstRef } = await supabase
        .from('profiles')
        .select('id')
        .eq('sponsor_id', sponsorId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (firstRef?.id) {
        chain = [firstRef.id, sponsorId];
      } else {
        chain = [sponsorId];
      }
    } else {
      chain = [sponsorId];
    }

    let currentId = sponsorId;
    while (chain.length < 5) {
      const { data: up } = await supabase
        .from('profiles')
        .select('sponsor_id')
        .eq('id', currentId)
        .single();
      if (!up?.sponsor_id) break;
      chain.push(up.sponsor_id);
      currentId = up.sponsor_id;
    }

    for (let level = 1; level <= 5 && level <= chain.length; level++) {
      const percent = bonusPercentByLevel[level];
      if (percent == null || percent <= 0) continue;
      const amount = round2((orderAmount * percent) / 100);
      if (amount <= 0) continue;
      const recipientId = chain[level - 1];
      const desc = 'Bônus nível ' + level + ' - Pedido ' + order.id;
      const { error: insErr } = await supabase.from('transactions').insert({
        user_id: recipientId,
        amount: amount,
        type: 'bonus',
        description: desc,
        origin_order_id: order.id,
      });
      if (insErr) {
        console.error('Erro ao inserir transaction ordem', order.id, 'nível', level, insErr.message);
        errors++;
        continue;
      }
      const { data: prof } = await supabase.from('profiles').select('wallet_balance').eq('id', recipientId).single();
      const currentBalance = Number(prof?.wallet_balance ?? 0);
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ wallet_balance: round2(currentBalance + amount) })
        .eq('id', recipientId);
      if (updErr) {
        console.error('Erro ao atualizar saldo', recipientId, updErr.message);
        errors++;
      }
    }
    ordersWithBonus.add(order.id);
    processed++;
    if (processed % 10 === 0 && processed > 0) {
      console.log('Processados', processed, 'pedidos...');
    }
  }

  console.log('--- Resultado ---');
  console.log('Pedidos com bônus já existente (ignorados):', skipped);
  console.log('Pedidos sem patrocinador (ignorados):', noSponsor);
  console.log('Pedidos processados (bônus distribuídos):', processed);
  if (errors) console.log('Erros durante processamento:', errors);
  console.log('Concluído.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
