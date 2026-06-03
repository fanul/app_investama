# PROMPT CODING LENGKAP — APLIKASI BARU
## Investment Dashboard | Vue.js + Vite + CLASP + Tailwind CSS + Google Apps Script + Google Sheets
### Level Detail: 5/5 | Skala: Enterprise Modular | Platform: Web App Mobile First

---

> **INSTRUKSI UNTUK AI CODING ASSISTANT**
> Baca seluruh dokumen ini sebelum menulis satu baris kode pun. Dokumen ini adalah single source of truth. Setiap file, fungsi, schema, dan endpoint sudah ditentukan — implementasikan persis sesuai spesifikasi. Jangan menambah library atau backend lain tanpa tanda `[OPSIONAL]`.

---

## BAGIAN 1 — RINGKASAN PRODUK (PRD RINGKAS)

### 1.1 Identitas Aplikasi
| Atribut | Nilai |
|---|---|
| Nama Aplikasi | Aplikasi Baru |
| Kategori | Investment Dashboard |
| Versi MVP | 1.0.0 |
| Platform | Web App Mobile First (PWA-ready) |
| Target Pengguna | Individu (investor retail) |
| Model Penggunaan | Gratis / Internal |
| Skala | Enterprise Modular |

### 1.2 Masalah yang Diselesaikan
Investor individu Indonesia umumnya mencatat portofolio di spreadsheet manual tanpa:
- Kalkulasi otomatis laba/rugi berdasarkan harga terkini
- Konsolidasi multi-instrumen (saham, emas, obligasi, deposito) dalam satu layar
- Visualisasi alokasi dan performa portofolio secara real-time
- Sistem backup dan export data yang mudah

### 1.3 Solusi
Aplikasi Baru adalah dashboard investasi personal berbasis Google Sheets sebagai database, Google Apps Script sebagai backend API, dan Vue.js + Vite + Tailwind CSS sebagai frontend modern. Data harga terkini ditarik dari API publik (untuk saham: Yahoo Finance/Alpha Vantage; untuk emas: Gold API; untuk obligasi/deposito: input manual atau BI rate API).

### 1.4 Tujuan Produk
1. Pencatatan seluruh instrumen investasi dalam satu platform
2. Kalkulasi otomatis P&L (Profit & Loss) real-time per instrumen dan total portofolio
3. Dashboard visual dengan chart alokasi, trend performa, dan ringkasan keuangan
4. Role-based access: User (investor) dan Admin (pengelola sistem)
5. Export laporan PDF/Excel/CSV untuk keperluan laporan pajak atau review

---

## BAGIAN 2 — SCOPE DAN PRIORITAS FITUR

### 2.1 MVP Scope (v1.0.0)
**WAJIB ADA:**
- Autentikasi (Login, Register, Logout, Reset Password via email GAS)
- Dashboard utama: total portofolio, P&L hari ini, P&L total, alokasi per instrumen
- CRUD investasi: tambah, edit, hapus, lihat detail transaksi
- Price lookup: harga terkini saham (Yahoo Finance API), emas (goldapi.io), deposito/obligasi (manual input)
- Dark Mode / Light Mode (persistent via localStorage)
- Export CSV
- Admin Panel: manajemen user, lihat semua portofolio, konfigurasi sistem

### 2.2 Scope Lanjutan (v1.1.0+)
- Export PDF dan Excel (via library jsPDF + SheetJS)
- Upload bukti transaksi (gambar/PDF, disimpan ke Google Drive via GAS)
- Push Notification harga melewati target (via GAS trigger + email)
- Grafik historis P&L per periode
- Multi-portofolio (satu user bisa punya beberapa portofolio)
- [OPSIONAL] Integrasi KSEI untuk import data saham otomatis

### 2.3 Prioritas Fitur (MoSCoW)
**Must:** Login, CRUD investasi, price lookup, dashboard P&L, dark mode
**Should:** Export CSV, role permission, admin panel, animasi smooth
**Could:** Export PDF/Excel, upload file, notifikasi harga
**Won't (v1):** Mobile native app, payment gateway, broker integration

---

## BAGIAN 3 — DAFTAR FITUR PER ROLE

### 3.1 Role: USER (Investor)
```
AUTH
  - Register akun baru (email + password)
  - Login / Logout
  - Ubah password dan profil

DASHBOARD
  - Lihat ringkasan portofolio (total nilai, modal, P&L, % return)
  - Chart pie alokasi per instrumen
  - Chart line performa portofolio (7 hari, 1 bulan, YTD)
  - Kartu ringkasan per kategori instrumen

INVESTASI
  - Tambah transaksi beli/jual
  - Edit dan hapus transaksi
  - Lihat detail per instrumen (lot, harga beli, harga terkini, P&L)
  - Filter dan search transaksi

PRICE LOOKUP
  - Lihat harga terkini saham (IDX/US)
  - Lihat harga emas (gram)
  - Input manual yield obligasi & rate deposito
  - Refresh harga manual

EXPORT
  - Export portofolio ke CSV
  - Export laporan PDF [v1.1]
  - Export ke Excel [v1.1]

FILE UPLOAD [v1.1]
  - Upload bukti transaksi (JPG/PNG/PDF, maks 5MB)
  - Lihat bukti yang sudah diupload

SETTINGS
  - Toggle dark/light mode
  - Pilih mata uang tampilan (IDR/USD)
  - Logout semua sesi
```

### 3.2 Role: ADMIN
```
USER MANAGEMENT
  - Lihat daftar semua user
  - Aktifkan / nonaktifkan akun user
  - Reset password user
  - Lihat aktivitas login user

PORTOFOLIO MANAGEMENT
  - Lihat portofolio semua user (read-only)
  - Export data semua user

SISTEM
  - Konfigurasi API key (Gold API, Alpha Vantage) via Admin Panel
  - Lihat log error sistem
  - Backup manual Google Sheets
  - Konfigurasi rate limit dan batas upload

PRICE MANAGEMENT
  - Update harga obligasi & deposito secara massal
  - Set harga emas manual (fallback jika API gagal)
```

### 3.3 Role: SUPER ADMIN (opsional, implementasi v1.1)
```
  - Semua akses Admin
  - Tambah/hapus Admin
  - Lihat audit log seluruh sistem
  - Konfigurasi Google Sheet ID dan deployment
```

---

## BAGIAN 4 — STRUKTUR HALAMAN, NAVIGASI & USER FLOW

### 4.1 Peta Halaman
```
/                   → Redirect ke /dashboard (jika login) atau /login
/login              → Halaman Login
/register           → Halaman Register
/forgot-password    → Form reset password

/dashboard          → Dashboard utama (Protected)
/portfolio          → Daftar semua investasi (Protected)
/portfolio/:id      → Detail satu instrumen investasi (Protected)
/portfolio/add      → Form tambah investasi (Protected)
/portfolio/edit/:id → Form edit investasi (Protected)

/prices             → Halaman price lookup semua instrumen (Protected)
/export             → Halaman export laporan (Protected)
/settings           → Pengaturan akun & preferensi (Protected)
/uploads            → Manajemen file upload (Protected) [v1.1]

/admin              → Admin Dashboard (Admin only)
/admin/users        → Manajemen user (Admin only)
/admin/system       → Konfigurasi sistem (Admin only)
/admin/logs         → Log error & audit (Admin only)
/admin/prices       → Update harga massal (Admin only)

/404                → Halaman tidak ditemukan
```

### 4.2 Navigasi (Bottom Nav — Mobile First)
```
Mobile Bottom Navigation Bar (4 tab):
  [🏠 Home]  [📊 Portfolio]  [💰 Harga]  [👤 Profil]

Desktop Sidebar (collapsible):
  Logo | Aplikasi Baru
  ── Beranda
  ── Portofolio
  ── Harga Terkini
  ── Export
  ── Pengaturan
  ── Admin Panel (if role=admin)
  ── Logout
```

### 4.3 User Flow Utama

**Flow: Register → Login → Tambah Investasi → Lihat Dashboard**
```
START
  → Buka /register
  → Isi nama, email, password → Submit
  → GAS: validasi → tulis ke Sheet Users → kirim email verifikasi [opsional]
  → Redirect /login
  → Login → GAS: cek email+hash password → buat session token
  → Simpan token di localStorage
  → Redirect /dashboard
  → Dashboard load: fetch ringkasan portofolio dari GAS
  → Klik "Tambah" → /portfolio/add
  → Pilih instrumen (saham/emas/obligasi/deposito)
  → Isi: kode instrumen, tanggal beli, lot/unit, harga beli
  → Submit → GAS tulis ke Sheet Transactions
  → Redirect /portfolio → list investasi muncul
END
```

**Flow: Price Lookup → Lihat P&L**
```
START
  → Buka /prices
  → App fetch harga terkini via GAS (GAS panggil external API)
  → Tampil tabel: instrumen | harga beli | harga terkini | P&L Rp | P&L %
  → User klik instrumen → detail chart historis [v1.1]
END
```

**Flow: Admin — Manajemen User**
```
START
  → Login sebagai admin → redirect /admin
  → Klik "Users" → /admin/users
  → Lihat tabel: nama | email | status | tanggal daftar | total investasi
  → Klik aksi: Aktifkan / Nonaktifkan / Reset Password
  → GAS update Sheet Users
END
```

### 4.4 States UI Wajib
| State | Implementasi |
|---|---|
| Loading | Skeleton loader card + spinner emerald |
| Empty | Ilustrasi SVG + tombol CTA "Tambah Investasi Pertama" |
| Error | Toast merah + pesan error + tombol retry |
| Success | Toast hijau emerald + animasi checkmark |
| Offline | Banner kuning "Koneksi terputus, data mungkin belum tersimpan" |
| Unauthorized | Redirect /login + toast "Sesi berakhir, silakan login kembali" |

---

## BAGIAN 5 — STRUKTUR GOOGLE SHEETS (DATABASE)

### 5.1 Daftar Sheet (Tab)
```
Workbook: "AplikasiBaru_DB"
  Sheet 1: Users
  Sheet 2: Transactions
  Sheet 3: Instruments
  Sheet 4: PriceHistory
  Sheet 5: AuditLog
  Sheet 6: SystemConfig
  Sheet 7: Sessions
```

### 5.2 Schema Detail Per Sheet

#### Sheet: Users
| Kolom | Tipe | Keterangan |
|---|---|---|
| user_id | String (UUID) | Primary key, auto-generate |
| name | String | Nama lengkap |
| email | String | Unik, lowercase |
| password_hash | String | SHA-256 hash |
| role | Enum | "user" / "admin" / "superadmin" |
| status | Enum | "active" / "inactive" / "suspended" |
| created_at | Timestamp | ISO 8601 |
| updated_at | Timestamp | ISO 8601 |
| last_login | Timestamp | ISO 8601 |
| currency_pref | String | "IDR" / "USD", default "IDR" |
| theme_pref | String | "dark" / "light", default "light" |

**Contoh data:**
```
user_id: "usr_01J2K..."
name: "Budi Santoso"
email: "budi@email.com"
password_hash: "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"
role: "user"
status: "active"
created_at: "2025-01-15T08:00:00Z"
```

**Aturan validasi:**
- email: format valid, unique per sheet
- password_hash: min 8 karakter sebelum hash
- role: hanya enum yang diizinkan

---

#### Sheet: Transactions
| Kolom | Tipe | Keterangan |
|---|---|---|
| tx_id | String (UUID) | Primary key |
| user_id | String (FK → Users) | Relasi ke Users |
| instrument_id | String (FK → Instruments) | Relasi ke Instruments |
| tx_type | Enum | "buy" / "sell" |
| tx_date | Date | Tanggal transaksi |
| quantity | Number | Lot (saham) / gram (emas) / unit |
| price_per_unit | Number | Harga per unit saat transaksi |
| total_value | Number | quantity × price_per_unit |
| fee | Number | Biaya transaksi (broker fee) |
| notes | String | Catatan opsional |
| receipt_url | String | URL Google Drive [v1.1] |
| created_at | Timestamp | ISO 8601 |
| updated_at | Timestamp | ISO 8601 |

**Contoh data:**
```
tx_id: "tx_01J3M..."
user_id: "usr_01J2K..."
instrument_id: "ins_BBCA"
tx_type: "buy"
tx_date: "2025-03-10"
quantity: 100
price_per_unit: 9500
total_value: 950000
fee: 4750
notes: "Beli saat koreksi"
```

---

#### Sheet: Instruments
| Kolom | Tipe | Keterangan |
|---|---|---|
| instrument_id | String | Primary key (misal: "ins_BBCA", "ins_EMAS", "ins_ORI026") |
| code | String | Kode ticker / kode produk |
| name | String | Nama lengkap instrumen |
| category | Enum | "saham" / "emas" / "obligasi" / "deposito" |
| exchange | String | "IDX" / "NYSE" / "N/A" |
| currency | String | "IDR" / "USD" |
| unit | String | "lot" / "gram" / "unit" / "lembar" |
| price_source | Enum | "api_yahoo" / "api_gold" / "manual" |
| last_price | Number | Harga terakhir diambil |
| last_price_updated | Timestamp | Waktu harga terakhir diupdate |
| is_active | Boolean | TRUE/FALSE |
| created_at | Timestamp | ISO 8601 |

**Contoh data:**
```
instrument_id: "ins_BBCA"
code: "BBCA"
name: "Bank Central Asia Tbk"
category: "saham"
exchange: "IDX"
currency: "IDR"
unit: "lot"
price_source: "api_yahoo"
last_price: 10050
last_price_updated: "2025-06-02T09:30:00Z"
is_active: TRUE
```

---

#### Sheet: PriceHistory
| Kolom | Tipe | Keterangan |
|---|---|---|
| history_id | String (UUID) | Primary key |
| instrument_id | String (FK) | Relasi ke Instruments |
| price | Number | Harga pada tanggal tersebut |
| price_date | Date | Tanggal harga |
| source | String | Sumber data ("yahoo", "goldapi", "manual") |
| fetched_at | Timestamp | Waktu fetch |

---

#### Sheet: AuditLog
| Kolom | Tipe | Keterangan |
|---|---|---|
| log_id | String (UUID) | Primary key |
| user_id | String (FK) | User yang melakukan aksi |
| action | String | "login" / "add_tx" / "edit_tx" / "delete_tx" / "export" / "admin_action" |
| target_id | String | ID entitas yang dikenai aksi |
| details | String (JSON) | Detail tambahan |
| ip_info | String | User-agent / referrer (dari header GAS) |
| created_at | Timestamp | ISO 8601 |

---

#### Sheet: SystemConfig
| Kolom | Tipe | Keterangan |
|---|---|---|
| config_key | String | Kunci konfigurasi (unique) |
| config_value | String | Nilai (dienkripsi untuk API key) |
| description | String | Keterangan |
| updated_at | Timestamp | ISO 8601 |
| updated_by | String | user_id admin |

**Contoh rows:**
```
GOLD_API_KEY | "xxxxxxxxxxx" | API key goldapi.io
ALPHA_VANTAGE_KEY | "xxxxxxxxxxx" | API key Alpha Vantage
MAX_UPLOAD_SIZE_MB | "5" | Batas ukuran upload file
GOLD_MANUAL_PRICE | "1320000" | Harga emas manual per gram (fallback)
BI_RATE | "6.25" | BI 7-Day Repo Rate (%)
SESSION_TTL_HOURS | "24" | Durasi sesi login
```

---

#### Sheet: Sessions
| Kolom | Tipe | Keterangan |
|---|---|---|
| session_id | String (UUID) | Primary key = token |
| user_id | String (FK) | Pemilik sesi |
| expires_at | Timestamp | Waktu kedaluwarsa |
| created_at | Timestamp | ISO 8601 |
| is_valid | Boolean | FALSE jika logout atau expired |

---

## BAGIAN 6 — STRUKTUR FOLDER DAN DAFTAR FILE

### 6.1 Gambaran Arsitektur
```
Frontend (Vue.js + Vite + Tailwind) ←→ GAS Web App API (HTTPS POST/GET)
                                              ↕
                                    Google Sheets (Database)
                                    Google Drive (File Storage) [v1.1]
```

Frontend di-deploy terpisah (GitHub Pages / Netlify / Vercel).
Backend GAS di-deploy sebagai Web App dengan akses "Anyone" (dengan token auth sendiri).
CLASP digunakan untuk push/pull kode GAS dari lokal.

### 6.2 Struktur Folder Lengkap
```
aplikasi-baru/
├── .claspignore
├── .clasp.json                    ← Konfigurasi CLASP (scriptId)
├── .env                           ← GAS_DEPLOYMENT_URL, dll (TIDAK di-commit)
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── README.md
│
├── gas/                           ← Semua file Google Apps Script
│   ├── Code.gs                    ← Entry point: doGet, doPost, routing
│   ├── Config.gs                  ← Konstanta SHEET_ID, sheet names, env
│   ├── Auth.gs                    ← Register, Login, Logout, token validation
│   ├── UserService.gs             ← CRUD user (admin functions)
│   ├── TransactionService.gs      ← CRUD transaksi investasi
│   ├── InstrumentService.gs       ← CRUD instrumen, master data
│   ├── PriceService.gs            ← Fetch harga dari API eksternal
│   ├── ExportService.gs           ← Generate CSV data
│   ├── UploadService.gs           ← Upload ke Google Drive [v1.1]
│   ├── AuditService.gs            ← Write audit log
│   ├── SheetHelper.gs             ← Helper baca/tulis Google Sheets
│   ├── Utils.gs                   ← UUID generator, hash, date formatting
│   ├── Installer.gs               ← Setup awal: buat semua sheet + header
│   └── appsscript.json            ← Manifest GAS
│
└── src/                           ← Frontend Vue.js
    ├── main.js                    ← App entry point
    ├── App.vue                    ← Root component
    │
    ├── assets/
    │   ├── icons/                 ← SVG icons
    │   └── images/                ← Logo, ilustrasi empty state
    │
    ├── styles/
    │   └── main.css               ← Tailwind directives + custom CSS
    │
    ├── composables/               ← Vue composables (reusable logic)
    │   ├── useAuth.js             ← Login/logout state, token management
    │   ├── usePortfolio.js        ← Fetch & kalkulasi portofolio
    │   ├── usePrices.js           ← Fetch harga terkini
    │   ├── useExport.js           ← Trigger export CSV/PDF/Excel
    │   ├── useToast.js            ← Toast notification sistem
    │   ├── useTheme.js            ← Dark/light mode toggle
    │   └── useApi.js              ← Wrapper fetch ke GAS endpoint
    │
    ├── stores/                    ← Pinia stores
    │   ├── authStore.js           ← User session, token, role
    │   ├── portfolioStore.js      ← Transactions, instruments, summary
    │   ├── priceStore.js          ← Harga terkini semua instrumen
    │   ├── uiStore.js             ← Loading state, modal, drawer
    │   └── adminStore.js          ← Data admin panel
    │
    ├── router/
    │   └── index.js               ← Vue Router: routes + navigation guards
    │
    ├── utils/
    │   ├── formatCurrency.js      ← Format angka ke Rp / USD
    │   ├── formatDate.js          ← Format tanggal Indonesia
    │   ├── calculatePnL.js        ← Kalkulasi profit/loss
    │   ├── validators.js          ← Validasi form (email, angka, dll)
    │   └── constants.js           ← Konstanta app (kategori, enum)
    │
    ├── components/                ← Reusable UI components
    │   ├── common/
    │   │   ├── AppButton.vue
    │   │   ├── AppInput.vue
    │   │   ├── AppSelect.vue
    │   │   ├── AppModal.vue
    │   │   ├── AppDrawer.vue      ← Bottom drawer mobile
    │   │   ├── AppToast.vue
    │   │   ├── AppSkeleton.vue
    │   │   ├── AppBadge.vue
    │   │   ├── AppCard.vue
    │   │   ├── AppAvatar.vue
    │   │   └── AppEmptyState.vue
    │   │
    │   ├── layout/
    │   │   ├── AppHeader.vue      ← Top bar mobile
    │   │   ├── AppBottomNav.vue   ← Bottom navigation mobile
    │   │   ├── AppSidebar.vue     ← Sidebar desktop
    │   │   └── AppLayout.vue      ← Wrapper layout utama
    │   │
    │   ├── dashboard/
    │   │   ├── SummaryCard.vue    ← Kartu total aset, P&L
    │   │   ├── AllocationChart.vue← Pie chart alokasi instrumen
    │   │   ├── PerformanceChart.vue← Line chart performa
    │   │   └── InstrumentRow.vue  ← Baris per instrumen di dashboard
    │   │
    │   ├── portfolio/
    │   │   ├── TransactionList.vue
    │   │   ├── TransactionCard.vue
    │   │   ├── TransactionForm.vue← Form tambah/edit transaksi
    │   │   ├── InstrumentDetail.vue
    │   │   └── PnLIndicator.vue   ← Indikator hijau/merah P&L
    │   │
    │   ├── prices/
    │   │   ├── PriceCard.vue
    │   │   ├── PriceTable.vue
    │   │   └── PriceRefreshBtn.vue
    │   │
    │   └── admin/
    │       ├── UserTable.vue
    │       ├── SystemConfigForm.vue
    │       ├── AuditLogTable.vue
    │       └── PriceMassUpdate.vue
    │
    └── views/                     ← Halaman (route-level components)
        ├── auth/
        │   ├── LoginView.vue
        │   ├── RegisterView.vue
        │   └── ForgotPasswordView.vue
        │
        ├── DashboardView.vue
        ├── PortfolioView.vue
        ├── PortfolioDetailView.vue
        ├── PortfolioAddView.vue
        ├── PortfolioEditView.vue
        ├── PricesView.vue
        ├── ExportView.vue
        ├── SettingsView.vue
        │
        ├── admin/
        │   ├── AdminDashboardView.vue
        │   ├── AdminUsersView.vue
        │   ├── AdminSystemView.vue
        │   ├── AdminLogsView.vue
        │   └── AdminPricesView.vue
        │
        └── NotFoundView.vue
```

---

## BAGIAN 7 — ENDPOINT API DAN ALUR BACKEND (GAS)

### 7.1 Konvensi API
```
Base URL: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec

Semua request menggunakan POST dengan body JSON.
GET digunakan hanya untuk doGet() (health check / redirect).

Request format:
{
  "action": "namaAction",
  "token": "session_token",   ← wajib kecuali login/register
  "payload": { ...data }
}

Response format (sukses):
{
  "status": "success",
  "data": { ...hasil },
  "message": "Pesan opsional"
}

Response format (error):
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Pesan error yang bisa ditampilkan ke user"
}
```

### 7.2 Tabel Endpoint Lengkap

#### Auth
| Action | Method | Payload | Response |
|---|---|---|---|
| `auth.register` | POST | `{name, email, password}` | `{user_id, token}` |
| `auth.login` | POST | `{email, password}` | `{token, user, role}` |
| `auth.logout` | POST | `{token}` | `{success: true}` |
| `auth.me` | POST | `{token}` | `{user}` |
| `auth.changePassword` | POST | `{token, old_password, new_password}` | `{success: true}` |
| `auth.forgotPassword` | POST | `{email}` | `{success: true}` ← kirim email |

#### Transactions
| Action | Payload | Response |
|---|---|---|
| `tx.list` | `{token}` | `[transactions]` |
| `tx.get` | `{token, tx_id}` | `{transaction}` |
| `tx.add` | `{token, instrument_id, tx_type, tx_date, quantity, price_per_unit, fee, notes}` | `{tx_id}` |
| `tx.edit` | `{token, tx_id, ...fields}` | `{success: true}` |
| `tx.delete` | `{token, tx_id}` | `{success: true}` |
| `tx.summary` | `{token}` | `{total_value, total_modal, pnl_amount, pnl_percent, by_category}` |

#### Instruments
| Action | Payload | Response |
|---|---|---|
| `instrument.list` | `{token}` | `[instruments]` |
| `instrument.search` | `{token, query}` | `[instruments]` |
| `instrument.add` | `{token, ...fields}` ← admin only | `{instrument_id}` |
| `instrument.edit` | `{token, instrument_id, ...fields}` ← admin | `{success}` |

#### Prices
| Action | Payload | Response |
|---|---|---|
| `price.getAll` | `{token}` | `{saham: [...], emas: {...}, deposito: {...}}` |
| `price.refresh` | `{token, instrument_id}` | `{price, updated_at}` |
| `price.manualUpdate` | `{token, instrument_id, price}` ← admin | `{success}` |

#### Export
| Action | Payload | Response |
|---|---|---|
| `export.csv` | `{token, date_from, date_to}` | `{csv_data: "..."}` ← string CSV |
| `export.summaryJson` | `{token}` | `{summary data untuk PDF/Excel}` |

#### Admin
| Action | Payload | Response |
|---|---|---|
| `admin.users.list` | `{token}` | `[users]` |
| `admin.users.updateStatus` | `{token, user_id, status}` | `{success}` |
| `admin.users.resetPassword` | `{token, user_id}` | `{temp_password}` |
| `admin.config.get` | `{token}` | `{configs}` |
| `admin.config.set` | `{token, key, value}` | `{success}` |
| `admin.logs.list` | `{token, limit, offset}` | `[logs]` |
| `admin.backup` | `{token}` | `{backup_url}` |

### 7.3 Pseudocode Fungsi GAS Utama

#### Code.gs — Entry Point
```javascript
// Code.gs
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: "ok", app: "Aplikasi Baru v1.0"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, token, payload } = body;
    
    // Rate limit ringan: cek timestamp terakhir per IP (via CacheService)
    // (Implementasi di Utils.gs checkRateLimit)
    
    // Route ke handler
    const result = Router.route(action, token, payload);
    return buildResponse(result);
    
  } catch(err) {
    AuditService.logError(err);
    return buildResponse({ status: "error", code: "INTERNAL_ERROR", message: err.message });
  }
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

#### Config.gs
```javascript
// Config.gs
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
  SHEETS: {
    USERS: 'Users',
    TRANSACTIONS: 'Transactions',
    INSTRUMENTS: 'Instruments',
    PRICE_HISTORY: 'PriceHistory',
    AUDIT_LOG: 'AuditLog',
    SYSTEM_CONFIG: 'SystemConfig',
    SESSIONS: 'Sessions'
  },
  SESSION_TTL: 24 * 60 * 60 * 1000, // 24 jam dalam ms
  MAX_ROWS_PER_FETCH: 1000
};

function getConfigValue(key) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SYSTEM_CONFIG);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}
```

#### Auth.gs
```javascript
// Auth.gs
function register(payload) {
  const { name, email, password } = payload;
  
  // Validasi
  if (!isValidEmail(email)) throw new Error('EMAIL_INVALID');
  if (password.length < 8) throw new Error('PASSWORD_TOO_SHORT');
  if (getUserByEmail(email)) throw new Error('EMAIL_ALREADY_EXISTS');
  
  const userId = generateUUID('usr');
  const hash = hashPassword(password);
  const now = new Date().toISOString();
  
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  sheet.appendRow([
    userId, name, email, hash, 'user', 'active',
    now, now, '', 'IDR', 'light'
  ]);
  
  const token = createSession(userId);
  return { status: 'success', data: { user_id: userId, token } };
}

function login(payload) {
  const { email, password } = payload;
  const user = getUserByEmail(email);
  
  if (!user) throw new Error('USER_NOT_FOUND');
  if (user.status !== 'active') throw new Error('ACCOUNT_INACTIVE');
  if (!verifyPassword(password, user.password_hash)) throw new Error('INVALID_PASSWORD');
  
  const token = createSession(user.user_id);
  updateLastLogin(user.user_id);
  AuditService.log(user.user_id, 'login', user.user_id, {});
  
  return { status: 'success', data: { token, user: sanitizeUser(user), role: user.role } };
}

function validateToken(token) {
  // Cek di sheet Sessions
  const session = getSessionByToken(token);
  if (!session) throw new Error('INVALID_TOKEN');
  if (new Date(session.expires_at) < new Date()) {
    invalidateSession(token);
    throw new Error('TOKEN_EXPIRED');
  }
  return session.user_id;
}

function createSession(userId) {
  const token = generateUUID('tok');
  const expiresAt = new Date(Date.now() + CONFIG.SESSION_TTL).toISOString();
  const sheet = getSheet(CONFIG.SHEETS.SESSIONS);
  sheet.appendRow([token, userId, expiresAt, new Date().toISOString(), true]);
  return token;
}
```

#### TransactionService.gs
```javascript
// TransactionService.gs
function listTransactions(userId) {
  const sheet = getSheet(CONFIG.SHEETS.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows
    .filter(row => row[1] === userId) // filter by user_id
    .map(row => rowToObject(headers, row));
}

function addTransaction(userId, payload) {
  const { instrument_id, tx_type, tx_date, quantity, price_per_unit, fee, notes } = payload;
  
  // Validasi
  if (!['buy', 'sell'].includes(tx_type)) throw new Error('INVALID_TX_TYPE');
  if (quantity <= 0) throw new Error('QUANTITY_MUST_BE_POSITIVE');
  if (price_per_unit <= 0) throw new Error('PRICE_MUST_BE_POSITIVE');
  
  // Cek instrumen valid
  if (!getInstrumentById(instrument_id)) throw new Error('INSTRUMENT_NOT_FOUND');
  
  const txId = generateUUID('tx');
  const totalValue = quantity * price_per_unit;
  const now = new Date().toISOString();
  
  const sheet = getSheet(CONFIG.SHEETS.TRANSACTIONS);
  sheet.appendRow([
    txId, userId, instrument_id, tx_type, tx_date,
    quantity, price_per_unit, totalValue, fee || 0, notes || '', '', now, now
  ]);
  
  AuditService.log(userId, 'add_tx', txId, { instrument_id, tx_type, quantity, price_per_unit });
  return { status: 'success', data: { tx_id: txId } };
}

function getSummary(userId) {
  const transactions = listTransactions(userId);
  const instruments = listInstruments();
  
  // Hitung P&L per instrumen
  const summary = calculatePortfolioSummary(transactions, instruments);
  return { status: 'success', data: summary };
}
```

#### PriceService.gs
```javascript
// PriceService.gs
function getAllPrices(userId) {
  const instruments = listInstruments().filter(i => i.is_active);
  const result = { saham: [], emas: {}, obligasi: [], deposito: [] };
  
  instruments.forEach(ins => {
    const price = getCachedPrice(ins.instrument_id) || fetchFreshPrice(ins);
    switch(ins.category) {
      case 'saham':    result.saham.push({ ...ins, current_price: price }); break;
      case 'emas':     result.emas = { ...ins, current_price: price }; break;
      case 'obligasi': result.obligasi.push({ ...ins, current_price: price }); break;
      case 'deposito': result.deposito.push({ ...ins, current_price: price }); break;
    }
  });
  
  return { status: 'success', data: result };
}

function fetchFreshPrice(instrument) {
  try {
    switch(instrument.price_source) {
      case 'api_yahoo':  return fetchYahooPrice(instrument.code);
      case 'api_gold':   return fetchGoldPrice();
      case 'manual':     return instrument.last_price;
    }
  } catch(e) {
    // Fallback ke last_price jika API gagal
    AuditService.logError(e, `PriceService.fetchFreshPrice: ${instrument.code}`);
    return instrument.last_price;
  }
}

function fetchYahooPrice(code) {
  // Gunakan Yahoo Finance API (tidak resmi, free)
  // Format: kode IDX tambahkan ".JK" suffix
  const ticker = code.endsWith('.JK') ? code : `${code}.JK`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const json = JSON.parse(response.getContentText());
  const price = json.chart.result[0].meta.regularMarketPrice;
  
  // Cache 15 menit
  CacheService.getScriptCache().put(`price_${ticker}`, String(price), 900);
  updateInstrumentLastPrice(code, price);
  return price;
}

function fetchGoldPrice() {
  const apiKey = getConfigValue('GOLD_API_KEY');
  if (!apiKey) return parseFloat(getConfigValue('GOLD_MANUAL_PRICE') || 1300000);
  
  const url = 'https://www.goldapi.io/api/XAU/IDR';
  const response = UrlFetchApp.fetch(url, {
    headers: { 'x-access-token': apiKey },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    return parseFloat(getConfigValue('GOLD_MANUAL_PRICE'));
  }
  
  const json = JSON.parse(response.getContentText());
  // Konversi troy oz → gram (1 troy oz = 31.1035 gram)
  const pricePerGram = json.price / 31.1035;
  CacheService.getScriptCache().put('price_EMAS', String(pricePerGram), 900);
  return pricePerGram;
}

function getCachedPrice(instrumentId) {
  const cached = CacheService.getScriptCache().get(`price_${instrumentId}`);
  return cached ? parseFloat(cached) : null;
}
```

#### SheetHelper.gs
```javascript
// SheetHelper.gs
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" tidak ditemukan`);
  return sheet;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });
  return obj;
}

function findRowByKey(sheetName, keyColumn, keyValue) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIdx = headers.indexOf(keyColumn);
  if (keyIdx === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIdx] === keyValue) {
      return { rowIndex: i + 1, data: rowToObject(headers, data[i]) };
    }
  }
  return null;
}

function updateRowByKey(sheetName, keyColumn, keyValue, updates) {
  const result = findRowByKey(sheetName, keyColumn, keyValue);
  if (!result) throw new Error(`Row tidak ditemukan: ${keyValue}`);
  
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  Object.entries(updates).forEach(([key, val]) => {
    const colIdx = headers.indexOf(key);
    if (colIdx >= 0) {
      sheet.getRange(result.rowIndex, colIdx + 1).setValue(val);
    }
  });
}

function deleteRowByKey(sheetName, keyColumn, keyValue) {
  const result = findRowByKey(sheetName, keyColumn, keyValue);
  if (!result) throw new Error(`Row tidak ditemukan: ${keyValue}`);
  getSheet(sheetName).deleteRow(result.rowIndex);
}
```

#### Utils.gs
```javascript
// Utils.gs
function generateUUID(prefix) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix ? `${prefix}_` : '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function hashPassword(password) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

function checkRateLimit(identifier, maxCalls, windowSeconds) {
  const cache = CacheService.getScriptCache();
  const key = `rl_${identifier}`;
  const current = parseInt(cache.get(key) || '0');
  if (current >= maxCalls) throw new Error('RATE_LIMIT_EXCEEDED');
  cache.put(key, String(current + 1), windowSeconds);
}
```

#### Installer.gs
```javascript
// Installer.gs — Jalankan sekali untuk setup awal
function installApp() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const schemas = {
    'Users': ['user_id','name','email','password_hash','role','status','created_at','updated_at','last_login','currency_pref','theme_pref'],
    'Transactions': ['tx_id','user_id','instrument_id','tx_type','tx_date','quantity','price_per_unit','total_value','fee','notes','receipt_url','created_at','updated_at'],
    'Instruments': ['instrument_id','code','name','category','exchange','currency','unit','price_source','last_price','last_price_updated','is_active','created_at'],
    'PriceHistory': ['history_id','instrument_id','price','price_date','source','fetched_at'],
    'AuditLog': ['log_id','user_id','action','target_id','details','ip_info','created_at'],
    'SystemConfig': ['config_key','config_value','description','updated_at','updated_by'],
    'Sessions': ['session_id','user_id','expires_at','created_at','is_valid']
  };
  
  Object.entries(schemas).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#1a5e3f')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
  });
  
  // Seed default config
  seedSystemConfig(ss);
  
  // Buat admin default
  createDefaultAdmin();
  
  Logger.log('✅ Instalasi berhasil! Semua sheet sudah dibuat.');
}

function seedSystemConfig(ss) {
  const sheet = ss.getSheetByName('SystemConfig');
  if (sheet.getLastRow() > 1) return; // Sudah ada data
  
  const defaults = [
    ['GOLD_API_KEY', '', 'API key goldapi.io', new Date().toISOString(), 'system'],
    ['ALPHA_VANTAGE_KEY', '', 'API key Alpha Vantage', new Date().toISOString(), 'system'],
    ['GOLD_MANUAL_PRICE', '1320000', 'Harga emas manual per gram IDR (fallback)', new Date().toISOString(), 'system'],
    ['BI_RATE', '6.25', 'BI 7-Day Repo Rate (%)', new Date().toISOString(), 'system'],
    ['SESSION_TTL_HOURS', '24', 'Durasi sesi login (jam)', new Date().toISOString(), 'system'],
    ['MAX_UPLOAD_SIZE_MB', '5', 'Batas upload file (MB)', new Date().toISOString(), 'system'],
  ];
  defaults.forEach(row => sheet.appendRow(row));
}
```

---

## BAGIAN 8 — KOMPONEN UI/UX DAN STATE APLIKASI

### 8.1 Design Tokens (Tailwind Config)
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Emerald Gold Color Scheme
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald main
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Gold main
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        profit: '#10b981', // Hijau untuk profit
        loss:   '#ef4444', // Merah untuk rugi
        neutral:'#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card-dark': '0 2px 15px -3px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      }
    }
  }
}
```

### 8.2 Komponen Utama — Pseudocode/Template

#### AppButton.vue
```vue
<!-- Mendukung: variant (primary/secondary/ghost/danger), size (sm/md/lg), loading state -->
<template>
  <button
    :class="[baseClasses, variantClasses[variant], sizeClasses[size]]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <AppSpinner v-if="loading" class="w-4 h-4 mr-2" />
    <slot />
  </button>
</template>
```

#### SummaryCard.vue (Dashboard)
```vue
<!-- Menampilkan: label, nilai utama, perubahan %, ikon -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card animate-fade-in">
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</p>
    <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
      {{ formatCurrency(value) }}
    </p>
    <div class="flex items-center mt-2">
      <span :class="changePercent >= 0 ? 'text-profit' : 'text-loss'" class="text-sm font-medium">
        {{ changePercent >= 0 ? '▲' : '▼' }} {{ Math.abs(changePercent).toFixed(2) }}%
      </span>
      <span class="text-xs text-gray-400 ml-2">vs. modal</span>
    </div>
  </div>
</template>
```

#### PnLIndicator.vue
```vue
<!-- Badge hijau/merah dengan animasi pulse untuk P&L -->
<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      value >= 0
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    ]"
  >
    {{ value >= 0 ? '+' : '' }}{{ formatCurrency(value) }}
    ({{ value >= 0 ? '+' : '' }}{{ percent.toFixed(2) }}%)
  </span>
</template>
```

#### TransactionForm.vue — Form Fields
```
Fields berdasarkan kategori instrumen:
  [Kategori*]    → Select: Saham / Emas / Obligasi / Deposito
  [Instrumen*]   → Autocomplete search dari daftar Instruments
                   (ketik kode → tampil dropdown hasil search ke GAS)
  [Tipe*]        → Radio: Beli / Jual
  [Tanggal*]     → Date picker (default: hari ini)
  [Jumlah*]      → Number input (label dinamis: "Lot" / "Gram" / "Unit")
  [Harga/unit*]  → Number input (format currency, auto-fill dari price lookup)
  [Biaya]        → Number input (broker fee, optional)
  [Catatan]      → Textarea (optional)
  [Bukti]        → File upload JPG/PNG/PDF max 5MB [v1.1]

Submit → validasi → POST ke GAS → toast sukses → redirect /portfolio
```

### 8.3 State Management (Pinia)

#### authStore.js
```javascript
// stores/authStore.js
import { defineStore } from 'pinia';
import { useApi } from '@/composables/useApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('app_token') || null,
    user: JSON.parse(localStorage.getItem('app_user') || 'null'),
    role: localStorage.getItem('app_role') || null,
    isLoading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => ['admin', 'superadmin'].includes(state.role),
    fullName: (state) => state.user?.name || 'User',
  },
  
  actions: {
    async login(email, password) {
      this.isLoading = true;
      this.error = null;
      try {
        const { api } = useApi();
        const res = await api('auth.login', { email, password });
        this.token = res.data.token;
        this.user = res.data.user;
        this.role = res.data.role;
        localStorage.setItem('app_token', this.token);
        localStorage.setItem('app_user', JSON.stringify(this.user));
        localStorage.setItem('app_role', this.role);
      } catch(e) {
        this.error = e.message;
        throw e;
      } finally {
        this.isLoading = false;
      }
    },
    
    async logout() {
      const { api } = useApi();
      try { await api('auth.logout', {}, this.token); } catch(e) {}
      this.token = null;
      this.user = null;
      this.role = null;
      localStorage.removeItem('app_token');
      localStorage.removeItem('app_user');
      localStorage.removeItem('app_role');
    }
  }
});
```

#### portfolioStore.js (state summary)
```javascript
state: () => ({
  transactions: [],
  summary: null,       // total_value, total_modal, pnl_amount, pnl_percent
  byCategory: {},      // { saham: {...}, emas: {...}, ... }
  isLoading: false,
  lastFetched: null,
})
```

#### priceStore.js
```javascript
state: () => ({
  prices: {},          // { instrument_id: { price, updated_at } }
  isRefreshing: false,
  lastRefreshed: null,
})
```

### 8.4 Router dan Navigation Guards
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
    { path: '/register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/portfolio', component: () => import('@/views/PortfolioView.vue'), meta: { requiresAuth: true } },
    // ... dst
    { path: '/admin', component: () => import('@/views/admin/AdminDashboardView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login');
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/dashboard');
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return next('/dashboard');
  }
  next();
});
```

### 8.5 useApi.js — Wrapper Fetch ke GAS
```javascript
// composables/useApi.js
import { useAuthStore } from '@/stores/authStore';

export function useApi() {
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  async function api(action, payload = {}, token = null) {
    const auth = useAuthStore();
    const t = token || auth.token;
    
    const body = { action, payload, ...(t && { token: t }) };
    
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'text/plain' }, // GAS CORS workaround
      redirect: 'follow',
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (data.status === 'error') {
      if (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN') {
        auth.logout();
        throw new Error('Sesi berakhir, silakan login kembali.');
      }
      throw new Error(data.message || 'Terjadi kesalahan.');
    }
    
    return data;
  }
  
  return { api };
}
```

### 8.6 Dark Mode (useTheme.js)
```javascript
// composables/useTheme.js
import { ref, watch } from 'vue';

const theme = ref(localStorage.getItem('theme') || 'light');

export function useTheme() {
  function applyTheme(t) {
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('theme', t);
  }
  
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }
  
  watch(theme, applyTheme, { immediate: true });
  
  return { theme, toggleTheme };
}
```

### 8.7 Animasi (Tailwind + CSS Custom)
```css
/* styles/main.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulseSoft {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.7; }
}

/* Bottom drawer transition */
.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-enter-from, .drawer-leave-to {
  transform: translateY(100%);
}

/* Card hover effect */
.investment-card {
  @apply transition-all duration-200 ease-out;
}
.investment-card:hover {
  @apply -translate-y-0.5 shadow-lg;
}

/* P&L color animation */
.profit-flash { animation: flashGreen 0.5s ease-out; }
.loss-flash   { animation: flashRed   0.5s ease-out; }

@keyframes flashGreen {
  0%   { background-color: rgba(16,185,129,0.2); }
  100% { background-color: transparent; }
}
```

---

## BAGIAN 9 — CHECKLIST KEAMANAN APLIKASI

### 9.1 Autentikasi & Session
- [ ] Password di-hash dengan SHA-256 sebelum disimpan (upgrade ke bcrypt via library opsional)
- [ ] Token sesi UUID acak, TTL 24 jam, tersimpan di sheet Sessions
- [ ] Setiap request POST wajib menyertakan token (kecuali login/register)
- [ ] `validateToken()` dipanggil di awal SETIAP handler yang butuh auth
- [ ] Logout invalidasi token di sheet (set `is_valid = FALSE`)
- [ ] Token tidak pernah dikirim via URL query param
- [ ] localStorage digunakan untuk token (tidak cookie, karena GAS tidak support)

### 9.2 Validasi Input (GAS side)
- [ ] Semua payload divalidasi tipe data sebelum diproses
- [ ] Email divalidasi regex
- [ ] Angka (quantity, price) divalidasi > 0 dan tipe Number
- [ ] String di-trim dan dibatasi panjangnya (max 500 char untuk notes)
- [ ] Enum (role, status, tx_type, category) divalidasi terhadap whitelist
- [ ] tx_id, user_id, instrument_id divalidasi format prefix (tx_, usr_, ins_)

### 9.3 Role-Based Access Control
- [ ] Setiap endpoint admin dicek `user.role === 'admin' || 'superadmin'`
- [ ] User hanya bisa akses data miliknya sendiri (filter `user_id === requestingUser`)
- [ ] Admin tidak bisa menghapus akun superadmin
- [ ] Role tidak bisa diubah via endpoint user biasa

### 9.4 Proteksi Google Sheets
- [ ] Tab Users: protected, hanya script bisa edit (bukan editor biasa)
- [ ] Tab Sessions: protected
- [ ] Tab SystemConfig: protected, hanya admin yang bisa lihat via panel
- [ ] Spreadsheet sharing: "Restricted" (hanya pemilik + script service account)

### 9.5 API Key & Config
- [ ] API key (Gold API, Alpha Vantage) TIDAK di-hardcode di kode
- [ ] API key disimpan via `PropertiesService.getScriptProperties().setProperty()`
- [ ] Di Admin Panel: API key di-input, GAS simpan ke PropertiesService (bukan Sheet)
- [ ] `.env` file lokal TIDAK di-commit ke git (ada di `.gitignore`)

### 9.6 Rate Limiting (GAS)
- [ ] Endpoint login: max 10 percobaan per 15 menit per IP (via CacheService)
- [ ] Endpoint register: max 3 per 1 jam per IP
- [ ] Endpoint price refresh: max 20 per menit per user
- [ ] Semua rate limit menggunakan CacheService (in-memory, cukup untuk GAS)

### 9.7 Error Handling
- [ ] Semua error di GAS di-catch di level doPost() dan dikembalikan sebagai JSON error
- [ ] Stack trace TIDAK dikirim ke frontend (hanya pesan user-friendly)
- [ ] Error internal dicatat ke AuditLog dengan detail lengkap
- [ ] Frontend menampilkan pesan error generik jika detail tidak ada

### 9.8 Upload File [v1.1]
- [ ] Validasi MIME type server-side (hanya image/jpeg, image/png, application/pdf)
- [ ] Validasi ukuran file max 5MB sebelum upload ke Drive
- [ ] File disimpan di folder Google Drive khusus dengan permission restricted
- [ ] URL Drive tidak dapat diakses tanpa login (gunakan DriveApp.getFileById untuk serve)
- [ ] Scan nama file untuk karakter berbahaya sebelum disimpan

### 9.9 CORS (GAS Workaround)
- [ ] Frontend kirim Content-Type: 'text/plain' (bukan application/json) untuk menghindari preflight CORS
- [ ] GAS doPost() dapat menerima body text/plain dan JSON.parse secara manual
- [ ] Tambahkan header CORS via `ContentService` jika diperlukan

---

## BAGIAN 10 — ERROR HANDLING, FALLBACK, LOGGING, BACKUP

### 10.1 Error Codes Standar
```
AUTH_001: EMAIL_ALREADY_EXISTS
AUTH_002: USER_NOT_FOUND
AUTH_003: INVALID_PASSWORD
AUTH_004: ACCOUNT_INACTIVE
AUTH_005: TOKEN_EXPIRED
AUTH_006: INVALID_TOKEN
AUTH_007: RATE_LIMIT_EXCEEDED
AUTH_008: PASSWORD_TOO_SHORT

TX_001: INSTRUMENT_NOT_FOUND
TX_002: INVALID_TX_TYPE
TX_003: QUANTITY_MUST_BE_POSITIVE
TX_004: UNAUTHORIZED_TX_ACCESS

PRICE_001: API_FETCH_FAILED (fallback ke last_price)
PRICE_002: INVALID_INSTRUMENT

SYS_001: INTERNAL_ERROR
SYS_002: SHEET_NOT_FOUND
SYS_003: SPREADSHEET_ACCESS_DENIED
```

### 10.2 Fallback Strategy
| Skenario | Fallback |
|---|---|
| Yahoo Finance API down | Gunakan `last_price` dari sheet Instruments |
| Gold API down | Gunakan `GOLD_MANUAL_PRICE` dari SystemConfig |
| GAS quota exceeded | Tampilkan pesan "Layanan sementara tidak tersedia, coba lagi nanti" |
| Google Sheets timeout | Retry otomatis 1x, lalu error toast |
| Koneksi internet offline | Tampilkan banner offline, cache data terakhir di localStorage |

### 10.3 Frontend Error Handling (useApi.js)
```javascript
// Retry logic untuk error sementara
async function apiWithRetry(action, payload, token, maxRetry = 1) {
  for (let i = 0; i <= maxRetry; i++) {
    try {
      return await api(action, payload, token);
    } catch(e) {
      if (i === maxRetry) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
    }
  }
}
```

### 10.4 Backup Data
```javascript
// Installer.gs — fungsi backup
function backupSpreadsheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const backup = ss.copy(`AplikasiBaru_Backup_${Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss')}`);
  
  // Simpan di folder Drive khusus
  const backupFolderId = PropertiesService.getScriptProperties().getProperty('BACKUP_FOLDER_ID');
  if (backupFolderId) {
    const file = DriveApp.getFileById(backup.getId());
    const folder = DriveApp.getFolderById(backupFolderId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }
  
  AuditService.log('system', 'backup', backup.getId(), { name: backup.getName() });
  return backup.getUrl();
}

// Buat time-based trigger untuk backup otomatis harian
function createBackupTrigger() {
  ScriptApp.newTrigger('backupSpreadsheet')
    .timeBased()
    .everyDays(1)
    .atHour(2) // Pukul 02:00 WIB
    .create();
}
```

---

## BAGIAN 11 — SKENARIO TESTING QA

### 11.1 Test Auth
```
TC-AUTH-001: Register dengan data valid → sukses, redirect login
TC-AUTH-002: Register dengan email duplikat → error EMAIL_ALREADY_EXISTS
TC-AUTH-003: Register dengan password < 8 karakter → error PASSWORD_TOO_SHORT
TC-AUTH-004: Register dengan email format salah → error EMAIL_INVALID
TC-AUTH-005: Login dengan kredensial benar → sukses, token disimpan
TC-AUTH-006: Login dengan password salah → error INVALID_PASSWORD
TC-AUTH-007: Login dengan email tidak ada → error USER_NOT_FOUND
TC-AUTH-008: Login 11x berturut → error RATE_LIMIT_EXCEEDED
TC-AUTH-009: Akses /dashboard tanpa token → redirect /login
TC-AUTH-010: Gunakan token expired → error TOKEN_EXPIRED, redirect /login
TC-AUTH-011: Ganti password valid → sukses
TC-AUTH-012: Logout → token diinvalidasi, redirect /login
```

### 11.2 Test Transaksi
```
TC-TX-001: Tambah transaksi saham beli valid → muncul di daftar
TC-TX-002: Tambah transaksi dengan quantity = 0 → error
TC-TX-003: Tambah transaksi dengan price negatif → error
TC-TX-004: Edit transaksi milik sendiri → sukses
TC-TX-005: Edit transaksi user lain → error UNAUTHORIZED_TX_ACCESS
TC-TX-006: Hapus transaksi → tidak muncul di daftar
TC-TX-007: Summary kalkulasi P&L → nilai benar (manual check)
TC-TX-008: Tambah transaksi jual melebihi kepemilikan → warning [v1.1]
```

### 11.3 Test Price Lookup
```
TC-PRICE-001: Fetch harga BBCA via Yahoo Finance → angka valid
TC-PRICE-002: Fetch harga emas via Gold API → angka valid (IDR/gram)
TC-PRICE-003: API Gold down → fallback ke GOLD_MANUAL_PRICE
TC-PRICE-004: API Yahoo down → fallback ke last_price dari sheet
TC-PRICE-005: Cache harga — request ke-2 dalam 15 menit tidak hit API
TC-PRICE-006: Admin update harga manual → terupdate di instrumen
```

### 11.4 Test Export
```
TC-EXPORT-001: Export CSV → file ter-download dengan data benar
TC-EXPORT-002: Export CSV filter tanggal → hanya data dalam range
TC-EXPORT-003: Export PDF → format sesuai [v1.1]
TC-EXPORT-004: Export Excel → kolom sesuai schema [v1.1]
```

### 11.5 Test Admin
```
TC-ADMIN-001: Login sebagai admin → akses /admin tersedia
TC-ADMIN-002: Login sebagai user biasa → /admin redirect ke /dashboard
TC-ADMIN-003: Nonaktifkan user → user tidak bisa login
TC-ADMIN-004: Aktifkan kembali user → user bisa login
TC-ADMIN-005: Set GOLD_MANUAL_PRICE via admin panel → nilai berubah
TC-ADMIN-006: Backup manual → URL backup muncul
TC-ADMIN-007: Lihat audit log → muncul aktivitas sebelumnya
```

### 11.6 Test Responsivitas
```
TC-UI-001: Tampilan mobile 375px (iPhone SE) → bottom nav muncul, no overflow
TC-UI-002: Tampilan tablet 768px → layout 2 kolom
TC-UI-003: Tampilan desktop 1280px → sidebar muncul
TC-UI-004: Dark mode toggle → seluruh halaman berubah tema
TC-UI-005: Animasi slide-up drawer → smooth 60fps
TC-UI-006: Skeleton loader muncul selama loading data
TC-UI-007: Empty state muncul jika belum ada transaksi
TC-UI-008: Toast error muncul dan hilang setelah 3 detik
```

### 11.7 Test Keamanan
```
TC-SEC-001: Request tanpa token → error INVALID_TOKEN
TC-SEC-002: Request dengan token random → error INVALID_TOKEN
TC-SEC-003: Akses data user lain via manipulasi payload → error
TC-SEC-004: Input XSS di field notes → tidak dieksekusi
TC-SEC-005: Upload file .exe via API → error INVALID_FILE_TYPE
TC-SEC-006: Upload file > 5MB → error FILE_TOO_LARGE
```

---

## BAGIAN 12 — PANDUAN DEPLOYMENT

### 12.1 Prasyarat
```
Software yang dibutuhkan:
  ✓ Node.js v18+
  ✓ npm / pnpm
  ✓ Google Account (untuk Google Sheets & Apps Script)
  ✓ CLASP: npm install -g @google/clasp
  ✓ clasp login (autentikasi Google)
```

### 12.2 Setup Google Sheets
```
1. Buka sheets.google.com → buat Spreadsheet baru
2. Namai: "AplikasiBaru_DB"
3. Salin URL spreadsheet → ambil Spreadsheet ID
   (format: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit)
4. Simpan SPREADSHEET_ID untuk langkah berikutnya
```

### 12.3 Setup Google Apps Script via CLASP
```bash
# 1. Clone repo
git clone https://github.com/username/aplikasi-baru.git
cd aplikasi-baru

# 2. Login CLASP
clasp login

# 3. Buat project GAS baru (atau link ke yang sudah ada)
clasp create --type webapp --title "Aplikasi Baru Backend" --rootDir ./gas

# 4. Simpan scriptId yang muncul di .clasp.json
# Format: { "scriptId": "xxxxxxx", "rootDir": "./gas" }

# 5. Set Spreadsheet ID ke Script Properties GAS
# Jalankan di GAS editor atau via command:
clasp run setSpreadsheetId --params '["YOUR_SPREADSHEET_ID"]'

# 6. Push semua file GAS ke cloud
clasp push --force

# 7. Buka GAS editor
clasp open
```

### 12.4 Setup Script Properties (GAS Editor)
```
Di GAS Editor → Project Settings → Script Properties, tambahkan:

Key: SPREADSHEET_ID
Value: [ID spreadsheet kamu]

Key: BACKUP_FOLDER_ID  
Value: [ID folder Google Drive untuk backup]

Key: GOLD_API_KEY
Value: [API key dari goldapi.io — daftar gratis]

Key: ALPHA_VANTAGE_KEY
Value: [API key dari alphavantage.co — daftar gratis]
```

### 12.5 Jalankan Installer
```
Di GAS Editor:
1. Buka Installer.gs
2. Pilih fungsi: installApp
3. Klik Run
4. Izinkan permission yang diminta (akses Sheets, Drive, Email)
5. Cek log: harus muncul "✅ Instalasi berhasil!"
6. Verifikasi di Google Sheets: semua tab sudah terbuat dengan header
```

### 12.6 Deploy GAS sebagai Web App
```
Di GAS Editor:
1. Deploy → New Deployment
2. Type: Web App
3. Description: "v1.0.0"
4. Execute as: Me (your Google account)
5. Who has access: Anyone
   (auth dilakukan oleh sistem token kita sendiri, bukan Google OAuth)
6. Deploy → Copy Web App URL
   Format: https://script.google.com/macros/s/{ID}/exec
7. Simpan URL ini sebagai VITE_GAS_URL
```

### 12.7 Setup Frontend (Vue.js + Vite)
```bash
# 1. Install dependencies
npm install

# 2. Buat file .env dari template
cp .env.example .env

# 3. Edit .env
VITE_GAS_URL=https://script.google.com/macros/s/XXXXXXXXXX/exec
VITE_APP_NAME=Aplikasi Baru
VITE_APP_VERSION=1.0.0

# 4. Jalankan dev server
npm run dev
# → http://localhost:5173

# 5. Test koneksi ke GAS
# Buka http://localhost:5173/login → coba register akun

# 6. Build untuk production
npm run build
# → folder dist/ siap deploy
```

### 12.8 Deploy Frontend

**Opsi A: GitHub Pages (Gratis)**
```bash
# Install gh-pages
npm install -D gh-pages

# Tambah ke package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Jalankan deploy
npm run deploy

# URL: https://username.github.io/aplikasi-baru
```

**Opsi B: Netlify (Gratis, Recommended)**
```
1. Push repo ke GitHub
2. Login netlify.com → New site from Git
3. Build command: npm run build
4. Publish directory: dist
5. Environment variables: tambahkan VITE_GAS_URL
6. Deploy → URL otomatis (atau custom domain)
```

**Opsi C: Vercel (Gratis)**
```bash
npm install -g vercel
vercel --prod
# Ikuti wizard, set env VITE_GAS_URL
```

### 12.9 Checklist Setelah Deploy
```
✅ GAS Web App URL bisa diakses (curl test → status: ok)
✅ installApp() sudah dijalankan → semua sheet ada
✅ Script Properties terisi (SPREADSHEET_ID, API keys)
✅ VITE_GAS_URL benar di deployment frontend
✅ Register akun admin pertama berhasil
✅ Di GAS: update role admin di sheet Users (manual edit: user → admin)
✅ Login admin → akses /admin berhasil
✅ Fetch harga saham berhasil
✅ Tambah transaksi berhasil
✅ Export CSV berhasil
✅ Dark mode berfungsi
✅ Tampilan mobile (375px) OK
✅ Backup trigger dibuat (jalankan createBackupTrigger() sekali)
```

### 12.10 Konfigurasi CLASP untuk Push Update
```json
// .clasp.json
{
  "scriptId": "YOUR_GAS_SCRIPT_ID",
  "rootDir": "./gas"
}
```

```
// .claspignore
node_modules/
src/
dist/
.env
*.log
```

```bash
# Workflow update GAS:
1. Edit file di gas/
2. clasp push
3. clasp deploy --description "v1.0.1 - fix price fetch"
4. Copy new deployment URL jika ada perubahan endpoint
```

### 12.11 Package.json Scripts Lengkap
```json
{
  "name": "aplikasi-baru",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "gas:push": "clasp push",
    "gas:deploy": "clasp deploy",
    "gas:open": "clasp open",
    "gas:logs": "clasp logs",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.1.0",
    "@vueuse/core": "^10.0.0",
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0",
    "jspdf": "^2.5.0",
    "xlsx": "^0.18.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0",
    "@google/clasp": "^2.4.0",
    "gh-pages": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## BAGIAN 13 — KALKULASI P&L (LOGIKA BISNIS INTI)

### 13.1 Rumus di calculatePnL.js (Frontend)
```javascript
// utils/calculatePnL.js

export function calculatePortfolioSummary(transactions, currentPrices) {
  // Group transaksi per instrumen
  const byInstrument = {};
  
  transactions.forEach(tx => {
    if (!byInstrument[tx.instrument_id]) {
      byInstrument[tx.instrument_id] = { buys: [], sells: [] };
    }
    if (tx.tx_type === 'buy') {
      byInstrument[tx.instrument_id].buys.push(tx);
    } else {
      byInstrument[tx.instrument_id].sells.push(tx);
    }
  });
  
  let totalModal = 0;
  let totalCurrentValue = 0;
  const instrumentSummaries = [];
  
  Object.entries(byInstrument).forEach(([instrumentId, { buys, sells }]) => {
    // Hitung total lot beli dan rata-rata harga beli (FIFO sederhana)
    const totalBuyQty   = buys.reduce((s, t) => s + t.quantity, 0);
    const totalSellQty  = sells.reduce((s, t) => s + t.quantity, 0);
    const netQty        = totalBuyQty - totalSellQty;
    
    const totalBuyValue = buys.reduce((s, t) => s + t.total_value + t.fee, 0);
    const avgBuyPrice   = totalBuyQty > 0 ? totalBuyValue / totalBuyQty : 0;
    const modalNet      = avgBuyPrice * netQty;
    
    const currentPrice  = currentPrices[instrumentId] || 0;
    const currentValue  = currentPrice * netQty;
    
    const pnlAmount  = currentValue - modalNet;
    const pnlPercent = modalNet > 0 ? (pnlAmount / modalNet) * 100 : 0;
    
    totalModal        += modalNet;
    totalCurrentValue += currentValue;
    
    instrumentSummaries.push({
      instrument_id: instrumentId,
      net_quantity:  netQty,
      avg_buy_price: avgBuyPrice,
      current_price: currentPrice,
      modal:         modalNet,
      current_value: currentValue,
      pnl_amount:    pnlAmount,
      pnl_percent:   pnlPercent,
    });
  });
  
  const totalPnl        = totalCurrentValue - totalModal;
  const totalPnlPercent = totalModal > 0 ? (totalPnl / totalModal) * 100 : 0;
  
  return {
    total_modal:         totalModal,
    total_current_value: totalCurrentValue,
    total_pnl:           totalPnl,
    total_pnl_percent:   totalPnlPercent,
    instruments:         instrumentSummaries,
  };
}
```

### 13.2 Format Currency Indonesia
```javascript
// utils/formatCurrency.js
export function formatIDR(value) {
  if (value === null || value === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value, decimals = 2) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
```

---

## BAGIAN 14 — EXPORT CSV/PDF/EXCEL

### 14.1 Export CSV (via GAS ExportService.gs)
```javascript
// ExportService.gs
function generateCSV(userId, dateFrom, dateTo) {
  const transactions = listTransactions(userId);
  const instruments = Object.fromEntries(
    listInstruments().map(i => [i.instrument_id, i])
  );
  
  const filtered = transactions.filter(tx => {
    const d = new Date(tx.tx_date);
    return d >= new Date(dateFrom) && d <= new Date(dateTo);
  });
  
  const headers = ['Tanggal','Instrumen','Kategori','Tipe','Jumlah','Harga/Unit','Total','Biaya','Catatan'];
  const rows = filtered.map(tx => {
    const ins = instruments[tx.instrument_id] || {};
    return [
      tx.tx_date,
      ins.code || tx.instrument_id,
      ins.category || '-',
      tx.tx_type === 'buy' ? 'Beli' : 'Jual',
      tx.quantity,
      tx.price_per_unit,
      tx.total_value,
      tx.fee,
      tx.notes
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}
```

### 14.2 Export PDF (Frontend — jsPDF) [v1.1]
```javascript
// composables/useExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function exportToPDF(summary, transactions, userName) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Header
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('Laporan Portofolio Investasi', 14, 20);
  
  // Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Nama: ${userName}`, 14, 40);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 47);
  doc.text(`Total Nilai: ${formatIDR(summary.total_current_value)}`, 14, 54);
  doc.text(`P&L: ${formatIDR(summary.total_pnl)} (${formatPercent(summary.total_pnl_percent)})`, 14, 61);
  
  // Tabel transaksi
  doc.autoTable({
    startY: 70,
    head: [['Tanggal', 'Instrumen', 'Tipe', 'Qty', 'Harga', 'Total']],
    body: transactions.map(t => [
      t.tx_date, t.instrument_code, t.tx_type === 'buy' ? 'Beli' : 'Jual',
      t.quantity, formatIDR(t.price_per_unit), formatIDR(t.total_value)
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [5, 150, 105] },
  });
  
  doc.save(`Portofolio_${userName}_${new Date().toISOString().split('T')[0]}.pdf`);
}
```

### 14.3 Export Excel (Frontend — SheetJS) [v1.1]
```javascript
import * as XLSX from 'xlsx';

export function exportToExcel(transactions, summary) {
  const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
    'Tanggal': t.tx_date,
    'Instrumen': t.instrument_code,
    'Kategori': t.category,
    'Tipe': t.tx_type === 'buy' ? 'Beli' : 'Jual',
    'Jumlah': t.quantity,
    'Harga/Unit': t.price_per_unit,
    'Total': t.total_value,
    'Biaya': t.fee,
    'Catatan': t.notes,
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
  XLSX.writeFile(wb, `Portofolio_${new Date().toISOString().split('T')[0]}.xlsx`);
}
```

---

## BAGIAN 15 — README / DOKUMENTASI

### 15.1 README.md (ringkasan)
```markdown
# Aplikasi Baru — Investment Dashboard

Dashboard investasi personal untuk mencatat dan memantau portofolio
saham, emas, obligasi, dan deposito dengan harga terkini otomatis.

## Stack
- Frontend: Vue.js 3 + Vite + Tailwind CSS
- Backend: Google Apps Script
- Database: Google Sheets
- Deploy Tool: CLASP

## Quick Start
1. Clone repo
2. npm install
3. cp .env.example .env → isi VITE_GAS_URL
4. Jalankan Installer.gs di GAS Editor
5. Deploy GAS sebagai Web App → copy URL ke .env
6. npm run dev

## Akun Demo
Admin: admin@aplikasibaru.com / Admin@12345
User:  demo@aplikasibaru.com / Demo@12345
(Buat manual setelah install, atau tambahkan ke Installer.gs)

## Kustomisasi
- Warna: edit tailwind.config.js → colors.primary & colors.gold
- Instrumen baru: tambah via Admin Panel → Instruments
- API key: Admin Panel → System Config

## Maintenance
- Backup otomatis: setiap hari pukul 02:00 (trigger GAS)
- Update GAS: clasp push → clasp deploy
- Update Frontend: npm run build → deploy ke hosting
```

---

## BAGIAN 16 — ROLE PERMISSION MATRIX

| Fitur | User | Admin | Super Admin |
|---|---|---|---|
| Login / Register | ✅ | ✅ | ✅ |
| Lihat portofolio sendiri | ✅ | ✅ | ✅ |
| Tambah/edit/hapus transaksi sendiri | ✅ | ✅ | ✅ |
| Lihat harga terkini | ✅ | ✅ | ✅ |
| Export CSV sendiri | ✅ | ✅ | ✅ |
| Export PDF/Excel sendiri | ✅ | ✅ | ✅ |
| Upload bukti transaksi | ✅ | ✅ | ✅ |
| Ubah profil & password | ✅ | ✅ | ✅ |
| Toggle dark mode | ✅ | ✅ | ✅ |
| Lihat portofolio user lain | ❌ | ✅ | ✅ |
| Akses Admin Panel | ❌ | ✅ | ✅ |
| Aktifkan/nonaktifkan user | ❌ | ✅ | ✅ |
| Reset password user | ❌ | ✅ | ✅ |
| Update harga manual/massal | ❌ | ✅ | ✅ |
| Set konfigurasi sistem / API key | ❌ | ✅ | ✅ |
| Lihat audit log | ❌ | ✅ | ✅ |
| Backup manual | ❌ | ✅ | ✅ |
| Tambah instrumen baru | ❌ | ✅ | ✅ |
| Tambah/hapus Admin | ❌ | ❌ | ✅ |
| Ubah role user | ❌ | ❌ | ✅ |
| Lihat semua audit log (semua admin) | ❌ | ❌ | ✅ |

---

## PENUTUP

Dokumen ini mencakup **semua** aspek yang diperlukan untuk membangun **Aplikasi Baru** dari nol hingga siap produksi:

✅ **PRD & User Flow** — Masalah, solusi, scope MVP v1.0 dan roadmap v1.1+
✅ **Fitur per Role** — User, Admin, Super Admin dengan Permission Matrix lengkap
✅ **Schema Google Sheets** — 7 sheet dengan kolom, tipe data, relasi, contoh data, dan validasi
✅ **Struktur Folder** — Semua file frontend (Vue/Vite) dan backend (GAS) terdaftar
✅ **API Endpoints** — Format request/response, semua action terdaftar per modul
✅ **Kode GAS** — Pseudocode lengkap: Code.gs, Auth.gs, TransactionService.gs, PriceService.gs, SheetHelper.gs, Utils.gs, Installer.gs
✅ **Komponen UI/UX** — Design tokens, komponen Vue, Pinia stores, Router guards, Dark mode, Animasi
✅ **Logika Bisnis** — Kalkulasi P&L, average buy price, format currency Indonesia
✅ **Checklist Keamanan** — Auth, validasi, RBAC, proteksi sheet, API key, rate limit, CORS, upload
✅ **Error Handling** — Error codes standar, fallback strategy, retry logic, logging
✅ **Backup & Restore** — Fungsi backup GAS + trigger otomatis harian
✅ **Skenario QA** — 40+ test case mencakup auth, transaksi, harga, export, admin, UI, keamanan
✅ **Deployment Guide** — CLASP, GAS Web App, GitHub Pages/Netlify/Vercel, checklist post-deploy
✅ **Export** — CSV (GAS), PDF (jsPDF), Excel (SheetJS)
✅ **README** — Dokumentasi penggunaan, akun demo, kustomisasi, maintenance

**Tempel dokumen ini ke AI coding assistant** (Claude, GPT, Cursor, dll) dan mulai dengan perintah:
> *"Implementasikan Bagian 6 — buat semua file dalam struktur folder yang sudah ditentukan, mulai dari gas/Installer.gs dan gas/Config.gs, kemudian lanjutkan ke frontend src/main.js dan src/App.vue."*

---
*Dokumen dihasilkan: 2 Juni 2026 | Versi: 1.0.0 | Stack: Vue 3 + Vite + Tailwind CSS + CLASP + Google Apps Script + Google Sheets*
