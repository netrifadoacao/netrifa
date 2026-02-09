const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const projectRef = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_NAME || 'gujyiuihodswdbttwnxd';
const password = process.env.SUPABASE_DATABASE_PASSWORD;
if (!password) {
  console.error('Defina SUPABASE_DATABASE_PASSWORD no .env');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const updateSql = `
    UPDATE public.profiles
    SET sponsor_id = (SELECT id FROM public.profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
    WHERE sponsor_id IS NULL
      AND id <> (SELECT id FROM public.profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1)
  `;
  const res = await client.query(updateSql);
  const updated = res.rowCount ?? 0;
  console.log('Perfis atualizados (sponsor_id = admin):', updated);

  await client.end();
  console.log('Concluído. Rode em seguida: npm run backfill:bonus');
}

main().catch((e) => { console.error(e); process.exit(1); });
