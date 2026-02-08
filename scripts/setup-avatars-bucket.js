const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}
loadEnv(path.join(__dirname, '..', '.env'));
loadEnv(path.join(__dirname, '..', '.env.example'));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY no .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');

function downloadAvatar(id) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(id)}&size=256`;
    https.get(apiUrl, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const { data: profiles, error: listError } = await supabase.from('profiles').select('id').order('created_at', { ascending: true });
  if (listError) {
    console.error('Erro ao listar perfis:', listError.message);
    process.exit(1);
  }
  const ids = (profiles || []).map((p) => p.id);
  if (ids.length === 0) {
    console.log('Nenhum perfil encontrado.');
    return;
  }
  console.log(ids.length, 'perfis encontrados.');

  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

  const { data: buckets } = await supabase.storage.listBuckets();
  const hasAvatars = buckets?.some((b) => b.name === 'avatars');
  if (!hasAvatars) {
    const { error } = await supabase.storage.createBucket('avatars', { public: true });
    if (error) {
      console.error('Erro ao criar bucket avatars:', error.message);
      process.exit(1);
    }
    console.log('Bucket avatars criado (público).');
  } else {
    console.log('Bucket avatars já existe.');
  }

  const baseUrl = `${url.replace(/\/$/, '')}/storage/v1/object/public/avatars`;
  for (const id of ids) {
    try {
      const buffer = await downloadAvatar(id);
      const filePath = path.join(avatarsDir, `${id}.png`);
      fs.writeFileSync(filePath, buffer);

      const { error: uploadError } = await supabase.storage.from('avatars').upload(`${id}.png`, buffer, {
        contentType: 'image/png',
        upsert: true,
      });
      if (uploadError) {
        console.error('Erro upload', id, uploadError.message);
        continue;
      }
      const avatarUrl = `${baseUrl}/${id}.png`;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', id);
      if (updateError) {
        console.error('Erro update profile', id, updateError.message);
        continue;
      }
      console.log('OK', id);
    } catch (e) {
      console.error('Erro', id, e.message);
    }
  }
  console.log('Avatares gerados, enviados ao bucket e perfis atualizados.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
