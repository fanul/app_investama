# 📖 PANDUAN PENGGUNAAN APLIKASI INVESTAMA
### Dashboard Investasi Pribadi (Vue 3 + Vite + Tailwind + Google Sheets + Google Apps Script)

Selamat datang di Panduan Penggunaan **Aplikasi Investama**. Aplikasi ini dirancang khusus untuk membantu Anda mengelola, mencatat, dan memantau seluruh portofolio investasi pribadi (Saham, Emas, Obligasi, dan Deposito) secara terintegrasi dengan Google Sheets sebagai database aman Anda.

---

## 📌 DAFTAR ISI
1. [🔑 PANDUAN AKSES & LOGIN](#1-panduan-akses--login)
2. [💼 PANDUAN PENGGUNA (USER GUIDE)](#2-panduan-pengguna-user-guide)
   * [A. Dashboard Ringkasan Portofolio](#a-dashboard-ringkasan-portofolio)
   * [B. Pencatatan Transaksi Investasi](#b-pencatatan-transaksi-investasi)
   * [C. Memantau Harga Terkini Aset](#c-memantau-harga-terkini-aset)
   * [D. Ekspor Riwayat Transaksi](#d-ekspor-riwayat-transaksi)
   * [E. Pengaturan Akun & Preferensi](#e-pengaturan-akun--preferensi)
3. [🛡️ PANDUAN ADMIN (ADMIN GUIDE)](#3-panduan-admin-admin-guide)
   * [A. Mengelola Pengguna (User Management)](#a-mengelola-pengguna-user-management)
   * [B. Konfigurasi Sistem & Penyelarasan Harga Manual](#b-konfigurasi-sistem--penyelarasan-harga-manual)
   * [C. Audit Log & Keamanan Sistem](#c-audit-log--keamanan-sistem)
   * [D. Backup Database Instan](#d-backup-database-instan)
4. [📊 PANDUAN PENGELOLAAN DATABASE (GOOGLE SHEETS)](#4-panduan-pengelolaan-database-google-sheets)
   * [A. Menambahkan Ticker/Instrumen Baru](#a-menambahkan-tickerinstrumen-baru)
   * [B. Memahami Kolom Sheet Instruments](#b-memahami-kolom-sheet-instruments)

---

## 1. 🔑 PANDUAN AKSES & LOGIN

Aplikasi ini dapat diakses secara online melalui tautan URL Google Apps Script Web App yang telah dideploy, atau dijalankan secara lokal di komputer pengembang.

### Langkah Pertama: Login ke Aplikasi
1. Buka URL Aplikasi Investama di browser Anda.
2. Anda akan diarahkan ke halaman **Masuk ke Akun Anda**.
3. **Akun Pengurus Default (Super Admin)**:
   * **Email**: `admin@aplikasibaru.com`
   * **Kata Sandi**: `Admin@12345`
4. Masukkan Email dan Kata Sandi, kemudian klik **Masuk ke Dashboard** (atau tekan *Enter*).
5. Jika berhasil, Anda akan otomatis masuk ke halaman utama Dashboard Investama.

> [!IMPORTANT]  
> Demi keamanan data investasi Anda, **Super Admin wajib segera mengubah kata sandi default** setelah berhasil login untuk pertama kalinya melalui menu **Pengaturan**.

---

## 2. 💼 PANDUAN PENGGUNA (USER GUIDE)

### A. Dashboard Ringkasan Portofolio
Halaman utama setelah Anda login adalah **Dashboard** yang menyajikan visualisasi data yang premium dan informatif:
1. **Ringkasan Kartu (Metrics)**:
   * **Total Aset Saat Ini**: Nilai total portofolio Anda dihitung berdasarkan harga pasar terkini.
   * **Total Modal Investasi**: Total uang bersih yang Anda belanjakan untuk membeli aset.
   * **Total Profit/Loss (P&L)**: Jumlah nominal keuntungan/kerugian bersih yang diperoleh.
   * **Persentase Profit/Loss**: Persentase imbal hasil investasi (ditandai warna **Hijau** untuk profit, dan **Merah** untuk loss).
2. **Grafik Alokasi Aset (Donut Chart)**:
   * Menampilkan persentase pembagian alokasi dana Anda ke 4 kategori aset: Saham IDX, Logam Mulia, Obligasi Negara, dan Deposito.
3. **Tabel Ringkasan Portofolio per Ticker**:
   * Menyajikan rangkuman performa tiap aset yang Anda miliki, meliputi: Jumlah Unit, Harga Rata-Rata Pembelian (*Avg Price*), Total Modal, Harga Pasar Terkini, Total Nilai Terkini, P&L Nominal, dan persentase P&L masing-masing aset.

### B. Pencatatan Transaksi Investasi
Untuk mencatat aktivitas transaksi Anda, buka menu **Portofolio** (ikon dompet di navigasi sebelah kiri):
1. **Menambah Transaksi Baru**:
   * Klik tombol **➕ Tambah Transaksi** di kanan atas.
   * **Tipe Transaksi**: Pilih **Beli (Buy)** atau **Jual (Sell)**.
   * **Pilih Instrumen**: Pilih ticker investasi yang ingin Anda catat (dropdown ini terisi dari daftar instrumen aktif).
   * **Tanggal**: Pilih tanggal terjadinya transaksi.
   * **Jumlah**: Masukkan kuantitas unit yang ditransaksikan (contoh: isi `10` untuk saham dalam satuan lot, atau `5` gram untuk emas).
   * **Harga per Unit (IDR)**: Masukkan harga per satu unit aset tersebut (misal harga per lembar/per gram).
   * **Biaya Transaksi / Fee (IDR)**: Masukkan biaya broker atau administrasi jika ada (opsional).
   * **Catatan Tambahan**: Ketik keterangan pendukung (contoh: *"Beli saat harga koreksi"* - opsional).
   * Klik **Simpan**. Nilai total transaksi akan dihitung secara otomatis secara real-time.
2. **Mengubah (Edit) Transaksi**:
   * Klik tombol edit (ikon pensil ✏️) pada baris transaksi yang ingin diubah.
   * Sesuaikan data yang keliru, lalu klik **Simpan**.
3. **Menghapus Transaksi**:
   * Klik tombol hapus (ikon tempat sampah 🗑️) pada baris transaksi yang ingin dihapus.
   * Konfirmasi penghapusan. Perhitungan rata-rata modal portofolio Anda akan otomatis dikalkulasi ulang oleh sistem.

### C. Memantau Harga Terkini Aset
Buka menu **Harga Terkini** (ikon tren naik) untuk memantau harga pasar terkini:
1. **Muat Ulang Semua Harga**:
   * Klik tombol **🔄 Muat Ulang Semua Harga** di bagian atas untuk melakukan sinkronisasi harga pasar live secara global dari server (Yahoo Finance & Gold API).
2. **Muat Ulang Individual**:
   * Klik tombol refresh kecil (🔄) di sebelah kanan masing-masing instrumen untuk mengupdate harga satu aset spesifik secara cepat tanpa memuat ulang instrumen lainnya.

### D. Ekspor Riwayat Transaksi
Buka menu **Ekspor Data** (ikon download) untuk mengunduh laporan offline:
1. Klik tombol **📥 Unduh Riwayat Transaksi (CSV)**.
2. Berkas CSV yang berisi seluruh log transaksi pribadi Anda akan diunduh secara otomatis. File ini dapat langsung dibuka di Microsoft Excel, Google Sheets, atau aplikasi analisis data lainnya.

### E. Pengaturan Akun & Preferensi
Buka menu **Pengaturan** (ikon gerigi) untuk mempersonalisasi aplikasi:
1. **Ubah Tema**: Pilih antara **Light Mode** (Mode Terang) atau **Dark Mode** (Mode Gelap) sesuai kenyamanan mata Anda.
2. **Ubah Kata Sandi**:
   * Masukkan **Kata Sandi Lama** Anda.
   * Masukkan **Kata Sandi Baru** (minimal 8 karakter dengan kombinasi aman).
   * Konfirmasi Kata Sandi Baru, lalu klik **Perbarui Kata Sandi**.

---

## 3. 🛡️ PANDUAN ADMIN (ADMIN GUIDE)

Sebagai Pengelola (Admin/Super Admin), Anda memiliki akses khusus ke menu **Panel Pengelola** yang berada di navigasi bagian bawah. Menu ini terdiri atas 3 fungsi utama:

### A. Mengelola Pengguna (User Management)
Buka tab **🛡️ Kelola Pengguna**:
1. **Memantau Pengguna**: Anda dapat melihat daftar seluruh nama pengguna terdaftar, alamat email, role/peran (`user` atau `admin`), status akun, dan waktu login terakhir mereka.
2. **Menangguhkan Akun (Suspend)**:
   * Klik tombol **Suspend** pada baris pengguna yang ingin dinonaktifkan.
   * Pengguna yang ditangguhkan akan langsung diblokir dan tidak dapat login atau mengakses data portofolio mereka hingga diaktifkan kembali.
3. **Mengaktifkan Akun**: Klik tombol **Aktifkan** pada baris pengguna berstatus suspended untuk mengembalikan hak akses mereka.
4. **Reset Kata Sandi**:
   * Jika ada pengguna yang lupa kata sandinya, klik tombol **Reset Sandi**.
   * Konfirmasi tindakan. Sistem akan secara otomatis meng-generate **Kata Sandi Sementara** yang acak dan aman.
   * Salin kode kata sandi sementara yang muncul pada kotak kuning dan berikan kepada pengguna tersebut. Pengguna wajib segera menggantinya di menu Pengaturan setelah berhasil login kembali.

### B. Konfigurasi Sistem & Penyelarasan Harga Manual
Buka tab **⚙️ Konfigurasi & Harga**:
1. **Variabel Konfigurasi Sistem** (Sisi Kiri):
   * **GOLD_API_KEY**: Token API dari *goldapi.io* untuk penarikan harga emas Antam real-time secara global.
   * **GOLD_MANUAL_PRICE**: Harga emas fallback per gram (contoh: `1320000`) yang digunakan jika kuota Gold API habis atau error.
   * **BI_RATE**: Nilai suku bunga acuan Bank Indonesia saat ini (dalam persen) untuk pembanding imbal hasil.
   * **SESSION_TTL_HOURS**: Durasi token login aktif dalam satuan jam (default: `24` jam).
   * *Cara Mengubah*: Ubah nilai pada kolom input yang sesuai, lalu klik tombol **💾 Simpan Seluruh Konfigurasi**.
2. **Penyelarasan Harga Manual** (Sisi Kanan):
   * Digunakan khusus untuk instrumen yang memiliki `price_source = manual` (seperti Obligasi Ritel/ORI atau Deposito yang harganya tidak berfluktuasi secara harian di bursa publik).
   * Pilih ticker instrumen pada dropdown.
   * Masukkan nilai harga baru per unit di kolom input IDR.
   * Klik tombol **📈 Perbarui Harga Instrumen**. Harga terbaru akan langsung disimpan ke database, tercatat dalam riwayat harga, dan ditampilkan pada portofolio pengguna.

### C. Audit Log & Keamanan Sistem
Buka tab **📜 Log Aktivitas**:
* Menyajikan rekaman audit (audit log) sistem secara real-time.
* Setiap aksi penting (seperti login, perubahan kata sandi, transaksi baru, suspensi akun, update konfigurasi, dll.) akan dicatat lengkap beserta timestamp, ID pengguna yang melakukan, jenis aksi, ID target, dan detail parameternya demi keamanan database.

### D. Backup Database Instan
* Di bagian kanan atas Panel Pengelola, klik tombol **💾 Backup Database**.
* Sistem akan menduplikasi file spreadsheet database Anda saat ini, menyimpannya di Google Drive, dan membuka tab browser baru berisi file cadangan tersebut.
* Anda juga tidak perlu khawatir karena sistem telah diprogram untuk **mencadangkan database secara otomatis setiap hari pada pukul 02:00 WIB**.

---

## 4. 📊 PANDUAN PENGELOLAAN DATABASE (GOOGLE SHEETS)

Database utama aplikasi ini 100% berada di file Google Sheets Anda. Anda dapat membuka file spreadsheet tersebut secara langsung melalui Google Drive Anda untuk pemeliharaan data lanjutan.

### A. Menambahkan Ticker/Instrumen Baru
Jika ada saham baru, emas tipe lain, obligasi seri baru, atau produk deposito baru yang ingin dimasukkan ke dalam aplikasi, Anda dapat menambahkannya secara manual di sheet **`Instruments`**:

1. Buka Google Sheets database Anda.
2. Pilih sheet **`Instruments`**.
3. Tambahkan baris baru di baris paling bawah.

### B. Memahami Kolom Sheet `Instruments`
Pastikan Anda mengisi data kolom dengan benar agar tidak terjadi error kalkulasi:

| Nama Kolom | Keterangan & Aturan Pengisian | Contoh Nilai |
| :--- | :--- | :--- |
| **`instrument_id`** | ID unik instrumen. Wajib diawali dengan `ins_` diikuti kode ticker. | `ins_BMRI`, `ins_EMAS`, `ins_SBR013` |
| **`code`** | Kode Ticker resmi. Gunakan huruf kapital. | `BMRI`, `EMAS`, `SBR013` |
| **`name`** | Nama lengkap aset/perusahaan. | `Bank Mandiri (Persero) Tbk`, `Obligasi SBR013` |
| **`category`** | Kategori aset. **Wajib** diisi salah satu: `saham`, `emas`, `obligasi`, atau `deposito`. | `saham` |
| **`exchange`** | Nama bursa saham. Gunakan `IDX` atau `N/A` jika non-saham. | `IDX` |
| **`currency`** | Mata uang penilai transaksi. | `IDR` |
| **`unit`** | Satuan unit transaksi pembelian. | `lot` (untuk saham), `gram` (emas), `unit` (obligasi) |
| **`price_source`** | Metode penarikan harga pasar: <br>• **`api_yahoo`** (ambil otomatis dari Yahoo Finance)<br>• **`api_gold`** (ambil otomatis dari Gold API)<br>• **`manual`** (diinput manual oleh admin) | `api_yahoo` |
| **`last_price`** | Harga terakhir. Jika `price_source` diisi `manual`, kolom ini yang menjadi acuan harga live. | `4500` |
| **`last_price_updated`** | Waktu pembaruan harga terakhir oleh sistem (format ISO timestamp). | `2026-06-02T16:00:00.000Z` |
| **`is_active`** | Status aktif instrumen. Isi **`TRUE`** untuk menampilkan di aplikasi, atau **`FALSE`** untuk menyembunyikan. | `TRUE` |
| **`created_at`** | Waktu instrumen didaftarkan pertama kali (format ISO timestamp). | `2026-06-02T16:00:00.000Z` |

> [!CAUTION]  
> Jangan pernah menghapus atau mengubah header baris pertama (baris 1) di sheet database manapun, karena akan menyebabkan kegagalan sistem dalam membaca data (Error: `COLUMN_NOT_FOUND`).

---
*Dokumen ini dibuat untuk mempermudah operasional harian Aplikasi Investama. Jika terjadi kendala sistem lanjutan, silakan hubungi tim IT Administrator Anda.*
