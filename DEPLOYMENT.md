# 🚀 Panduan Deploy MORELEAF — Vercel + Railway + MySQL

Panduan lengkap langkah demi langkah untuk men-deploy Moreleaf ke production:
- **Frontend** → Vercel
- **Backend** → Railway
- **Database** → Railway MySQL

> Estimasi waktu total: 30–45 menit (di luar waktu propagasi DNS jika memakai domain custom).

---

## 📋 Persiapan Sebelum Deploy

1. **Akun yang dibutuhkan** (semua gratis untuk mulai):
   - [GitHub](https://github.com) — untuk menyimpan source code
   - [Railway](https://railway.app) — untuk backend + database
   - [Vercel](https://vercel.com) — untuk frontend

2. **Push project ke GitHub** (jika belum):

```bash
cd moreleaf
git init
git add .
git commit -m "Initial commit - Moreleaf e-commerce"
git branch -M main
git remote add origin https://github.com/USERNAME/moreleaf.git
git push -u origin main
```

> 💡 Pastikan ada file `.gitignore` di `backend/` dan `frontend/` agar `node_modules`, `.env`, dan `uploads/*` (kecuali `.gitkeep`) tidak ter-push. Lihat bagian [.gitignore](#-gitignore-yang-disarankan) di bawah.

---

## 🗄️ BAGIAN 1 — Deploy Database MySQL ke Railway

### 1.1 Buat Project Baru di Railway

1. Login ke [railway.app](https://railway.app) menggunakan akun GitHub.
2. Klik **New Project** → pilih **Provision MySQL**.
3. Railway akan otomatis membuat instance MySQL dan menyediakan kredensial koneksi.

### 1.2 Dapatkan Kredensial Database

1. Klik service **MySQL** yang baru dibuat.
2. Buka tab **Variables** — catat nilai berikut:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
3. Atau buka tab **Connect** untuk mendapatkan connection string lengkap.

### 1.3 Import Schema & Seed Data

Gunakan tab **Data** di Railway (jika tersedia query editor), atau koneksi via MySQL client lokal:

```bash
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> <MYSQLDATABASE> < database/moreleaf.sql
```

Contoh konkret (sesuaikan dengan nilai dari Railway Anda):

```bash
mysql -h containers-us-west-1.railway.app -P 6543 -u root -pAbC123XyZ railway < database/moreleaf.sql
```

> ⚠️ Catatan: file `database/moreleaf.sql` berisi statement `CREATE DATABASE IF NOT EXISTS moreleaf_db` di baris awal. Jika Railway sudah menyediakan nama database sendiri (biasanya `railway`), Anda boleh menghapus dua baris pertama (`CREATE DATABASE` dan `USE moreleaf_db;`) sebelum import, agar tabel langsung dibuat di database yang sudah disediakan Railway.

Alternatif tanpa MySQL client lokal: gunakan **MySQL Workbench** atau **TablePlus** dan hubungkan dengan kredensial di atas, lalu jalankan isi file `.sql` melalui SQL editor-nya.

### 1.4 Verifikasi

Cek apakah tabel berhasil dibuat:

```sql
SHOW TABLES;
SELECT * FROM users WHERE role = 'admin';
```

Anda harus melihat 14 tabel (users, products, categories, dll) dan 1 baris admin.

---

## ⚙️ BAGIAN 2 — Deploy Backend ke Railway

### 2.1 Tambahkan Service Backend

1. Di project Railway yang sama (yang sudah ada MySQL), klik **New** → **GitHub Repo**.
2. Pilih repository `moreleaf` Anda.
3. Railway akan mendeteksi banyak folder — set **Root Directory** ke `backend`.

### 2.2 Konfigurasi Environment Variables

Buka tab **Variables** pada service backend, tambahkan satu per satu:

| Key | Value |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` *(reference variable Railway)* |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `JWT_SECRET` | *(string acak panjang, contoh: hasil `openssl rand -hex 32`)* |
| `JWT_EXPIRES_IN` | `7d` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | *(email Gmail Anda)* |
| `EMAIL_PASS` | *(App Password Gmail, 16 digit)* |
| `EMAIL_FROM` | `noreply@moreleaf.com` |
| `FRONTEND_URL` | *(isi setelah deploy Vercel, contoh: `https://moreleaf.vercel.app`)* |

> 💡 Railway mendukung **Reference Variables** — ketik `${{` di kolom value untuk auto-complete variabel dari service MySQL yang sudah ada di project yang sama. Ini lebih aman daripada copy-paste manual.

### 2.3 Set Start Command

Railway otomatis membaca `package.json`. Pastikan di **Settings** → **Deploy**:
- **Start Command**: `npm start` (sudah sesuai dengan script `"start": "node server.js"`)
- **Build Command**: kosongkan (tidak ada build step untuk backend plain Node.js)

### 2.4 Generate Domain Publik

1. Buka tab **Settings** pada service backend.
2. Di bagian **Networking**, klik **Generate Domain**.
3. Railway memberi URL publik, contoh: `https://moreleaf-backend.up.railway.app`.
4. **Catat URL ini** — akan dipakai sebagai `VITE_API_URL` di frontend.

### 2.5 Deploy & Verifikasi

Railway otomatis deploy setiap kali ada push ke branch `main`. Setelah build selesai, cek:

```bash
curl https://moreleaf-backend.up.railway.app/api/health
```

Harus mengembalikan:

```json
{ "success": true, "message": "Moreleaf API is running 🌿", "timestamp": "..." }
```

### 2.6 Catatan Tentang Upload File (Penting!)

Railway menggunakan **ephemeral filesystem** — file yang diupload ke folder lokal (`backend/uploads`) **akan hilang setiap kali service di-redeploy/restart**. Untuk production jangka panjang, sebaiknya:

- Gunakan **Railway Volumes** (Settings → Volumes → mount ke `/app/backend/uploads`) agar file persisten antar deploy, **atau**
- Migrasikan upload ke layanan storage eksternal seperti **Cloudinary** atau **AWS S3** (disarankan untuk skala produksi yang lebih besar).

Untuk MVP/demo, mounting Railway Volume ke folder `uploads` sudah cukup:
1. Buka service backend → tab **Volumes** → **New Volume**.
2. Mount path: `/app/uploads` (sesuaikan dengan struktur deploy Anda).
3. Redeploy service agar volume aktif.

---

## 🌐 BAGIAN 3 — Deploy Frontend ke Vercel

### 3.1 Import Project

1. Login ke [vercel.com](https://vercel.com) dengan akun GitHub.
2. Klik **Add New** → **Project**.
3. Pilih repository `moreleaf`.
4. Pada konfigurasi **Root Directory**, klik **Edit** dan pilih folder `frontend`.

### 3.2 Konfigurasi Build Settings

Vercel otomatis mendeteksi Vite. Pastikan setting berikut:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 3.3 Tambahkan Environment Variables

Di bagian **Environment Variables**, tambahkan:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://moreleaf-backend.up.railway.app/api` |
| `VITE_SOCKET_URL` | `https://moreleaf-backend.up.railway.app` |

> Gunakan URL backend Railway dari langkah 2.4. Pastikan `VITE_API_URL` diakhiri `/api`.

### 3.4 Deploy

Klik **Deploy**. Tunggu ±1–2 menit hingga build selesai. Vercel memberi URL seperti:

```
https://moreleaf.vercel.app
```

### 3.5 Update CORS Backend

Setelah mendapat URL Vercel final, **kembali ke Railway** → service backend → tab **Variables** → update:

```
FRONTEND_URL=https://moreleaf.vercel.app
```

Lalu redeploy backend (Railway → **Deployments** → klik **Redeploy** pada deployment terbaru) agar perubahan `.env` diterapkan dan CORS mengizinkan domain Vercel.

---

## 🔁 BAGIAN 4 — Hubungkan Semua & Verifikasi End-to-End

1. Buka `https://moreleaf.vercel.app`.
2. Cek halaman Home memuat produk dari backend (tanda koneksi API berhasil).
3. Buka DevTools (F12) → tab **Network** → pastikan tidak ada error CORS atau 404 ke endpoint `/api/...`.
4. Coba register akun baru → login → tambah ke keranjang → checkout.
5. Login sebagai admin (`admin@moreleaf.com` / `admin123`) di `/login`, lalu ke `/admin/dashboard` — pastikan grafik Chart.js dan notifikasi real-time (Socket.io) berfungsi.
6. **Segera ganti password admin default** setelah verifikasi berhasil, melalui database langsung atau menambahkan fitur ubah password admin jika diperlukan.

---

## 🌍 BAGIAN 5 — (Opsional) Custom Domain

### Untuk Frontend (Vercel)
1. Buka project di Vercel → **Settings** → **Domains**.
2. Tambahkan domain Anda, misal `moreleaf.com`.
3. Ikuti instruksi Vercel untuk menambahkan record **A** atau **CNAME** di DNS provider Anda (Cloudflare, Niagahoster, dll).

### Untuk Backend (Railway)
1. Buka service backend → **Settings** → **Networking** → **Custom Domain**.
2. Tambahkan subdomain, misal `api.moreleaf.com`.
3. Tambahkan record **CNAME** sesuai instruksi Railway di DNS provider Anda.
4. Update `VITE_API_URL` dan `VITE_SOCKET_URL` di Vercel ke `https://api.moreleaf.com` (dan `https://api.moreleaf.com/api`), lalu redeploy frontend.
5. Update `FRONTEND_URL` di Railway ke `https://moreleaf.com`, lalu redeploy backend.

---

## 🔒 BAGIAN 6 — Checklist Keamanan Sebelum Go-Live

- [ ] Ganti `JWT_SECRET` dengan string acak yang kuat (≥32 karakter), jangan gunakan nilai contoh.
- [ ] Ganti password admin default (`admin123`) segera setelah deploy.
- [ ] Pastikan `.env` **tidak** ter-commit ke GitHub (cek `.gitignore`).
- [ ] Gunakan App Password Gmail (bukan password akun) untuk `EMAIL_PASS`.
- [ ] Set `NODE_ENV=production` di Railway.
- [ ] Aktifkan Railway Volume atau migrasi ke Cloudinary/S3 untuk upload file agar tidak hilang saat redeploy.
- [ ] Cek rate limiting aktif (`express-rate-limit` sudah terpasang default 300 request/15 menit per IP).
- [ ] Backup database secara berkala (Railway menyediakan backup otomatis di paket berbayar, atau lakukan `mysqldump` manual secara periodik).

---

## 📦 .gitignore yang Disarankan

**`backend/.gitignore`**
```
node_modules/
.env
uploads/*
!uploads/.gitkeep
*.log
```

**`frontend/.gitignore`**
```
node_modules/
.env
dist/
*.log
```

---

## 🆘 Troubleshooting Deploy

| Masalah | Kemungkinan Sebab | Solusi |
|---|---|---|
| Frontend tampil blank / error di console | `VITE_API_URL` salah atau backend belum jalan | Cek Network tab, pastikan URL benar dan diakhiri `/api` |
| CORS error setelah deploy | `FRONTEND_URL` di backend belum diupdate / belum redeploy | Update variable lalu redeploy backend secara manual |
| Database connection refused | Kredensial DB salah atau service MySQL belum aktif | Cek tab Variables di Railway, pastikan reference variable benar |
| Gambar produk hilang setelah beberapa waktu | Ephemeral filesystem Railway | Aktifkan Railway Volume atau pindah ke Cloudinary/S3 |
| Build gagal di Vercel | Folder root tidak diarahkan ke `frontend` | Cek Settings → General → Root Directory |
| Socket.io tidak connect (notifikasi admin tidak muncul) | `VITE_SOCKET_URL` salah atau CORS socket diblokir | Pastikan `VITE_SOCKET_URL` tanpa `/api`, sama dengan domain backend |
| Email OTP tidak terkirim di production | App Password salah / 2FA Gmail belum aktif | Generate ulang App Password di myaccount.google.com/apppasswords |

---

## 💰 Estimasi Biaya

| Layanan | Free Tier | Catatan |
|---|---|---|
| Vercel | Gratis (Hobby plan) | Cukup untuk frontend skala UMKM |
| Railway | $5 kredit gratis/bulan | Backend + MySQL kecil biasanya masih dalam batas gratis; pantau usage di dashboard |
| Domain custom | ~Rp150.000–250.000/tahun | Opsional, bisa pakai subdomain gratis dari Vercel/Railway dulu |

---

Selamat! 🎉 Website Moreleaf Anda sekarang sudah live di production dengan frontend di Vercel, backend di Railway, dan database MySQL terkelola di Railway.
