import dotenv from 'dotenv';

dotenv.config();

const loginRes = await fetch('http://127.0.0.1:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'owner@demo.com', password: 'admin123' }),
});
const login = await loginRes.json();
const token = login.data.token;
const storeId = login.data.stores[0].id;

for (const url of [
  `/api/v1/admin/stores/${storeId}/qr/download`,
  `/api/v1/admin/stores/${storeId}/qr/download?table=1`,
  `/api/v1/admin/stores/${storeId}/qr`,
]) {
  const res = await fetch(`http://127.0.0.1:8080${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const ct = res.headers.get('content-type');
  const body = ct?.includes('json') ? await res.text() : `binary ${(await res.arrayBuffer()).byteLength} bytes`;
  console.log(url, res.status, ct, body.slice(0, 120));
}
