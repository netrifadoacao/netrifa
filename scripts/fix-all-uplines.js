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
  const { data: adminRow, error: adminErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  if (adminErr || !adminRow) {
    console.error('Admin não encontrado:', adminErr?.message || 'nenhum perfil admin');
    process.exit(1);
  }
  const adminId = adminRow.id;
  console.log('Admin id:', adminId);

  const { data: semUpline, error: listErr } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .is('sponsor_id', null)
    .neq('id', adminId);
  if (listErr) {
    console.error('Erro ao listar perfis sem upline:', listErr.message);
    process.exit(1);
  }
  console.log('Perfis sem upline (excl. admin):', semUpline?.length ?? 0);
  if (semUpline?.length) {
    for (const p of semUpline) {
      console.log('  -', p.email, p.full_name || p.id);
    }
    const ids = semUpline.map((p) => p.id);
    const { data: updated, error: updateErr } = await supabase
      .from('profiles')
      .update({ sponsor_id: adminId })
      .in('id', ids)
      .select('id');
    if (updateErr) {
      console.error('Erro ao atualizar:', updateErr.message);
      process.exit(1);
    }
    console.log('Atualizados:', updated?.length ?? 0);
  }

  console.log('Concluído. Rode em seguida: npm run backfill:bonus');
}

main().catch((e) => { console.error(e); process.exit(1); });
