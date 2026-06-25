import { randomBytes } from 'crypto';

const pad = (value) => String(value).padStart(2, '0');

export const generateOrderCode = (date = new Date()) => {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const suffix = randomBytes(3).toString('hex').toUpperCase();

  return `ORD-${yy}${mm}${dd}-${suffix}`;
};
