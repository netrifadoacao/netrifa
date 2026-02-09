const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SERVICE_ROLE no .env');
  process.exit(1);
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function countDescendants(list, rootId, maxDepth = 10, depth = 0) {
  if (depth >= maxDepth) return 0;
  const direct = list.filter((p) => p.sponsor_id === rootId);
  let n = direct.length;
  for (const p of direct) n += countDescendants(list, p.id, maxDepth, depth + 1);
  return n;
}

async function main() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, sponsor_id, role, created_at')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Erro ao buscar perfis:', error.message);
    process.exit(1);
  }
  const list = profiles || [];
  const admin = list.find((p) => p.role === 'admin');
  const membro2 = list.find((p) => p.email === 'membro2@projetodoacao.com');
  if (!admin) {
    console.error('Admin não encontrado');
    process.exit(1);
  }
  console.log('Total de perfis (excl. admin):', list.filter((p) => p.role !== 'admin').length);
  console.log('Admin:', admin.id, admin.email);
  const underAdmin = countDescendants(list, admin.id);
  console.log('  -> Acumulado (rede abaixo do admin):', underAdmin);
  if (membro2) {
    console.log('membro2:', membro2.id, membro2.email, 'sponsor_id:', membro2.sponsor_id);
    const underMembro2 = countDescendants(list, membro2.id);
    console.log('  -> Acumulado (rede abaixo do membro2):', underMembro2);
    const directAdmin = list.filter((p) => p.sponsor_id === admin.id);
    console.log('  -> Diretos do admin:', directAdmin.length);
    const directMembro2 = list.filter((p) => p.sponsor_id === membro2.id);
    console.log('  -> Diretos do membro2:', directMembro2.length);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
