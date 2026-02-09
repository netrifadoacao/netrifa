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
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name, sponsor_id, role, wallet_balance').order('created_at', { ascending: true });
  const { data: txList } = await supabase.from('transactions').select('user_id, amount').eq('type', 'bonus');
  const { data: orders } = await supabase.from('orders').select('id, user_id, amount, status').eq('status', 'paid');

  const txByUser = {};
  (txList || []).forEach((t) => {
    txByUser[t.user_id] = (txByUser[t.user_id] || 0) + Number(t.amount);
  });
  const txCountByUser = {};
  (txList || []).forEach((t) => {
    txCountByUser[t.user_id] = (txCountByUser[t.user_id] || 0) + 1;
  });

  console.log('=== PERFIS (id, email, sponsor_id, role, wallet_balance, total_bonus_transacoes) ===');
  (profiles || []).forEach((p) => {
    const totalBonus = txByUser[p.id] ?? 0;
    const qtdTx = txCountByUser[p.id] ?? 0;
    console.log(p.id, p.email, p.sponsor_id || 'NULL', p.role, 'saldo:', p.wallet_balance, 'bonus_recebido:', totalBonus.toFixed(2), 'qtd_tx:', qtdTx);
  });

  const semUpline = (profiles || []).filter((p) => !p.sponsor_id && p.role !== 'admin');
  if (semUpline.length > 0) {
    console.log('\n!!! PERFIS SEM UPLINE (diferente de admin):', semUpline.length);
    semUpline.forEach((p) => console.log('  ', p.email, p.id));
  }

  console.log('\n=== PEDIDOS PAGOS:', orders?.length ?? 0);
  console.log('=== TOTAL TRANSAÇÕES BÔNUS:', txList?.length ?? 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
