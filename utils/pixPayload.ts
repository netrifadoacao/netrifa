function pad(num: number, size: number): string {
  return String(num).padStart(size, '0');
}

function crc16ccitt(str: string): number {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xffff;
}

function emvField(id: string, value: string): string {
  const len = pad(value.length, 2);
  return id + len + value;
}

export function buildPixPayload(options: {
  chavePix: string;
  valor: number;
  nomeBeneficiario: string;
  cidade?: string;
}): string {
  const { chavePix, valor, nomeBeneficiario, cidade = 'Brasilia' } = options;
  const keyType = chavePix.length === 11 ? '01' : chavePix.includes('@') ? '03' : '04';
  const merchantAccount = emvField('00', 'br.gov.bcb.pix') + emvField(keyType, chavePix);
  const payload =
    emvField('00', '01') +
    emvField('26', merchantAccount) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('54', valor.toFixed(2)) +
    emvField('58', 'BR') +
    emvField('59', nomeBeneficiario.substring(0, 25)) +
    emvField('60', cidade.substring(0, 15));
  const crc = crc16ccitt(payload + '6304');
  return payload + '6304' + pad(crc, 4).toUpperCase();
}
