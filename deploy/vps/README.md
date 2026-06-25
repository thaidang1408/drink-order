# Deploy QR Ordering len VPS (Ubuntu)

## Yeu cau

- VPS Ubuntu 22.04+ (Oracle Free, Viettel Cloud, DigitalOcean...)
- Domain tro A record ve IP VPS (hoac dung IP tam thoi chi HTTP)
- SSH vao VPS

## Buoc 1 — Dua code len VPS

### Cach A: Git (khuyen dung)

```bash
ssh ubuntu@IP_VPS
sudo mkdir -p /var/www/qr-ordering
sudo chown -R $USER:$USER /var/www/qr-ordering
git clone https://github.com/BAN/QR_Ordering.git /var/www/qr-ordering
cd /var/www/qr-ordering
```

### Cach B: Zip tu Windows

Tren may Windows (PowerShell):

```powershell
cd d:\QR_Ordering
# Loai tru node_modules
tar -czf qr-ordering.tar.gz --exclude=node_modules --exclude=frontend/node_modules --exclude=.git .
scp qr-ordering.tar.gz ubuntu@IP_VPS:/tmp/
```

Tren VPS:

```bash
sudo mkdir -p /var/www/qr-ordering
sudo tar -xzf /tmp/qr-ordering.tar.gz -C /var/www/qr-ordering
sudo chown -R $USER:$USER /var/www/qr-ordering
cd /var/www/qr-ordering
```

## Buoc 2 — Cai server

```bash
cd /var/www/qr-ordering
chmod +x deploy/vps/*.sh
sudo bash deploy/vps/01-install-server.sh
```

## Buoc 3 — Tao database

```bash
DB_PASSWORD='MatKhauMySQLManh123!' bash deploy/vps/02-setup-database.sh
```

## Buoc 4 — File .env production

```bash
cp deploy/vps/env.production.template .env
nano .env
```

Sua:

- `DATABASE_URL` — dung user/pass buoc 3
- `YOUR_DOMAIN` → `https://tenmien.com`
- `JWT_SECRET` — chuoi ngau nhien >= 32 ky tu
- Cloudinary (neu upload anh)

## Buoc 5 — Deploy app

Lan dau (co demo):

```bash
RUN_DB_SEED=true bash deploy/vps/03-deploy-app.sh
```

Lan sau:

```bash
bash deploy/vps/03-deploy-app.sh
```

## Buoc 6 — Nginx + HTTPS

Domain da tro DNS ve VPS:

```bash
DOMAIN=order.tenquanan.vn bash deploy/vps/04-setup-nginx-ssl.sh
```

Cap nhat lai `.env` neu FRONTEND_URL chua dung HTTPS, roi:

```bash
bash deploy/vps/03-deploy-app.sh
```

## Kiem tra

- Khach: `https://DOMAIN/store/demo-cafe`
- Admin: `https://DOMAIN/admin/login`
- Admin → Ma QR → tai QR moi

## PM2

```bash
pm2 logs qr-ordering
pm2 restart qr-ordering
pm2 startup   # tu chay khi reboot
```
