const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Configuração do Supabase não encontrada.');
  return { url, key };
};

export function uploadAvatarWithProgress(
  blob: Blob,
  path: string,
  accessToken: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const { url, key } = getSupabaseConfig();
  const endpoint = `${url}/storage/v1/object/avatars/${path}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(Math.min(100, percent));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        let message = `Falha no envio (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText || '{}');
          if (body.message) message = body.message;
          else if (body.error) message = body.error;
        } catch {
          if (xhr.responseText) message = xhr.responseText.slice(0, 120);
        }
        reject(new Error(message));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Falha de conexão. Verifique sua internet e tente novamente.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Envio cancelado.'));
    });

    xhr.open('POST', endpoint);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('apikey', key);
    xhr.setRequestHeader('Content-Type', 'image/jpeg');
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.send(blob);
  });
}
