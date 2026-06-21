# 🌿 MORELEAF — Website E-Commerce Fullstack

Website e-commerce profesional untuk UMKM **Moreleaf**, produsen camilan sehat berbahan dasar daun kelor organik (Choco Muffin, Cookies, Brownies).

Dibangun dengan **React + Vite** (frontend), **Node.js + Express** (backend), **MySQL** (database), lengkap dengan autentikasi JWT, dashboard admin, notifikasi real-time (Socket.io), dan berbagai fitur e-commerce standar.

---

## 📦 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router DOM, Axios, React Hook Form, React Toastify, Chart.js, Socket.io Client, Lucide Icons |
| Backend | Node.js, Express.js, JWT, Socket.io, Multer, bcryptjs, Nodemailer, PDFKit, ExcelJS |
| Database | MySQL 8 |
| Keamanan | Helmet, CORS, Express Rate Limit, bcryptjs |

---

## 📁 Struktur Folder

```
moreleaf/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Footer, ProductCard, dll
│   │   │   └── admin/         # Modal, StatCard, dll (khusus admin)
│   │   ├── pages/
│   │   │   ├── user/          # Home, Products, Cart, Checkout, dll
│   │   │   └── admin/         # Dashboard, ProductManagement, dll
│   │   ├── layouts/           # MainLayout, AdminLayout
│   │   ├── context/           # AuthContext, CartContext, ThemeContext
│   │   ├── services/          # API call wrappers (axios)
│   │   ├── hooks/             # useSocket
│   │   ├── utils/             # format.js, chartSetup.js
│   │   └── App.jsx
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── backend/                   # Express REST API
│   ├── config/                # database.js
│   ├── controllers/           # Business logic per resource
│   ├── middleware/            # auth.js, upload.js
│   ├── routes/                # Express routers
│   ├── socket/                # socketHandler.js
│   ├── services/              # emailService.js
│   ├── utils/                 # seeder.js
│   ├── uploads/                # uploaded product/user images
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── database/
    └── moreleaf.sql           # Full schema + seed data
```

---

## ✅ Fitur Utama

### Pengguna (User)
- Register, Login, Forgot Password via OTP Email, Reset Password
- Edit profil & foto profil
- Jelajah produk: pencarian, filter kategori, sorting, pagination
- Detail produk: deskripsi, komposisi, manfaat, ulasan
- Keranjang belanja: tambah/kurangi/hapus, voucher diskon
- Checkout: COD / Transfer Bank / QRIS
- Tracking pesanan dengan progress bar status
- Wishlist
- Ulasan & rating produk (hanya untuk produk yang sudah dibeli & selesai)
- Halaman testimoni publik
- Form kontak

### Admin
- Dashboard dengan grafik **Chart.js**: penjualan harian, bulanan, produk terlaris
- CRUD Produk (dengan upload gambar)
- CRUD Kategori
- Kelola Pesanan (update status, lihat detail, cetak invoice PDF)
- Kelola Pengguna (blokir/buka blokir, hapus)
- Kelola Ulasan (balas, hapus)
- Kelola Pesan Masuk (balas, hapus)
- Notifikasi real-time (Socket.io): pesanan baru, ulasan baru, pesan baru, user baru
- Export data ke Excel (pesanan & produk)
- Export invoice ke PDF

### Lainnya
- SEO: meta tags, Open Graph, Twitter Card, sitemap.xml, robots.txt
- Keamanan: JWT, bcrypt, Helmet, CORS, Rate Limiting
- Dark Mode
- PWA (installable di mobile/desktop)
- Responsive (mobile, tablet, desktop)
- Loading skeleton & error boundary

---

## 🚀 Instalasi Lokal

### Prasyarat
- Node.js ≥ 18
- MySQL ≥ 8
- npm atau yarn

### 1. Clone / Extract Project

```bash
cd moreleaf
```

### 2. Setup Database

Buat database dan import schema:

```bash
mysql -u root -p < database/moreleaf.sql
```

Atau secara manual via phpMyAdmin / MySQL Workbench: buat database `moreleaf_db`, lalu import file `database/moreleaf.sql`.

> Skrip SQL ini sudah termasuk data admin default dan seed produk. Alternatif: gunakan seeder Node.js (lihat langkah backend di bawah).

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi database & email Anda:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=moreleaf_db
JWT_SECRET=ganti_dengan_string_acak_yang_panjang
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

> **Catatan Gmail**: gunakan [App Password](https://myaccount.google.com/apppasswords) bukan password akun biasa untuk `EMAIL_PASS`.

Jalankan server (mode development dengan auto-reload):

```bash
npm run dev
```

Atau mode production:

```bash
npm start
```

Backend akan berjalan di `http://localhost:5000`. Cek kesehatan API: `http://localhost:5000/api/health`.

(Opsional) Jalankan seeder tambahan via Node bila SQL belum dijalankan:

```bash
npm run seed
```

### 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Jalankan dev server:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

### 5. Login

**User biasa**: daftar melalui halaman Register.

**Admin default**:
```
Email: admin@moreleaf.com
Password: admin123
```

⚠️ **Segera ganti password admin default ini setelah login pertama di environment production.**

---

## 🔌 API Endpoints Utama

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru | Publik |
| POST | `/api/auth/login` | Login | Publik |
| POST | `/api/auth/forgot-password` | Kirim OTP reset password | Publik |
| POST | `/api/auth/reset-password` | Reset password dengan OTP | Publik |
| GET | `/api/auth/profile` | Ambil data profil | User |
| PUT | `/api/auth/profile` | Update profil | User |
| GET | `/api/products` | List produk (search/filter/sort/pagination) | Publik |
| GET | `/api/products/:id` | Detail produk + ulasan | Publik |
| POST | `/api/products` | Tambah produk | Admin |
| PUT | `/api/products/:id` | Edit produk | Admin |
| DELETE | `/api/products/:id` | Hapus produk | Admin |
| GET/POST/PUT/DELETE | `/api/categories` | CRUD kategori | Admin (write) |
| GET/POST/PUT/DELETE | `/api/cart` | Kelola keranjang | User |
| POST | `/api/orders` | Buat pesanan (checkout) | User |
| GET | `/api/orders` | List pesanan (user: milik sendiri, admin: semua) | User/Admin |
| GET | `/api/orders/:id` | Detail pesanan | User/Admin |
| GET | `/api/orders/:id/invoice` | Download invoice PDF | User/Admin |
| PUT | `/api/orders/:id/status` | Update status pesanan | Admin |
| GET | `/api/orders/stats` | Statistik untuk dashboard | Admin |
| GET/POST/PUT/DELETE | `/api/reviews` | Kelola ulasan | User/Admin |
| GET/POST/DELETE | `/api/wishlist` | Kelola wishlist | User |
| POST | `/api/contact` | Kirim pesan kontak | Publik |
| GET/PUT/DELETE | `/api/contact` | Kelola pesan masuk | Admin |
| GET/PUT | `/api/notifications` | Notifikasi admin | Admin |
| GET/PUT/DELETE | `/api/users` | Kelola user | Admin |
| GET | `/api/export/orders` | Export pesanan ke Excel | Admin |
| GET | `/api/export/products` | Export produk ke Excel | Admin |

Semua response menggunakan format JSON konsisten:

```json
{ "success": true, "message": "...", "data": { ... } }
```

---

## 🧪 Testing Cepat (Smoke Test)

Setelah backend & frontend berjalan:

1. Buka `http://localhost:5173` → halaman Home harus tampil dengan produk terlaris.
2. Buka `/products` → coba search, filter kategori, sort harga.
3. Daftar akun baru di `/register`.
4. Tambahkan produk ke keranjang, lanjut ke `/checkout`, isi alamat, buat pesanan.
5. Cek halaman `/orders` → status pesanan harus "Pending".
6. Login sebagai admin (`admin@moreleaf.com` / `admin123`) → buka `/admin/dashboard`.
7. Cek notifikasi pesanan baru muncul (real-time via Socket.io).
8. Update status pesanan dari admin, lalu cek halaman tracking user otomatis berubah.

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---|---|
| `ECONNREFUSED` saat backend start | MySQL belum berjalan atau kredensial `.env` salah |
| CORS error di browser | Pastikan `FRONTEND_URL` di backend `.env` sesuai dengan URL frontend |
| Gambar produk tidak muncul | Pastikan folder `backend/uploads` ada dan backend men-serve `/uploads` secara statis |
| Email OTP tidak terkirim | Gunakan App Password Gmail, bukan password biasa; aktifkan 2FA dulu |
| Socket.io tidak connect | Cek `VITE_SOCKET_URL` di frontend `.env` cocok dengan URL backend |

---

## 📄 Lisensi

Proyek ini dibuat khusus untuk UMKM Moreleaf. Bebas dimodifikasi sesuai kebutuhan bisnis Anda.

---

Untuk panduan deploy ke production, lihat **[DEPLOYMENT.md](./DEPLOYMENT.md)**.
