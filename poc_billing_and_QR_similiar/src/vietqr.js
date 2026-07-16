import QRCode from 'qrcode';

const tlv = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

export function crc16Ccitt(value) {
  let crc = 0xffff;
  for (const byte of Buffer.from(value, 'utf8')) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generateVietQrPayload({ bankBin, bankAccount, amount, reference }) {
  if (!/^\d{6}$/.test(bankBin)) throw new Error('Bank BIN must contain 6 digits');
  if (!/^[A-Za-z0-9]{5,19}$/.test(bankAccount)) throw new Error('Bank account must contain 5 to 19 letters or digits');
  if (!Number.isSafeInteger(amount) || amount <= 0 || String(amount).length > 13) {
    throw new Error('Amount must be a positive integer of no more than 13 digits in VND');
  }

  const description = reference.replace(/[^A-Za-z0-9. ]/g, '').slice(0, 25);
  if (!description) throw new Error('Reference must contain a letter, digit, period, or space');
  const beneficiary = tlv('00', bankBin) + tlv('01', bankAccount);
  const merchantAccount = tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');
  const additionalData = tlv('08', description);
  const withoutCrc = [
    tlv('00', '01'),
    tlv('01', '12'),
    tlv('38', merchantAccount),
    tlv('53', '704'),
    tlv('54', String(amount)),
    tlv('58', 'VN'),
    tlv('62', additionalData),
    '6304',
  ].join('');

  return withoutCrc + crc16Ccitt(withoutCrc);
}

export function parseTlv(payload) {
  const result = {};
  let position = 0;
  while (position + 4 <= payload.length) {
    const id = payload.slice(position, position + 2);
    const length = Number(payload.slice(position + 2, position + 4));
    const value = payload.slice(position + 4, position + 4 + length);
    result[id] = value;
    position += 4 + length;
  }
  return result;
}

export function verifyVietQrCrc(payload) {
  if (payload.length < 8 || payload.slice(-8, -4) !== '6304') return false;
  return crc16Ccitt(payload.slice(0, -4)) === payload.slice(-4);
}

export async function toQrDataUrl(payload) {
  return QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 2, width: 320 });
}
