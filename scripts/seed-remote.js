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

const projectRef = process.env.SUPABASE_PROJECT_ID || 'gujyiuihodswdbttwnxd';
const password = process.env.SUPABASE_DATABASE_PASSWORD || 'Ochefedagoma144';
const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'seed.sql'), 'utf8');
  await client.query(sql);
  await client.end();
  console.log('Seed aplicado no banco remoto. Admin e membros criados (senha: Senha123!)');
}

main().catch((e) => { console.error(e); process.exit(1); });
