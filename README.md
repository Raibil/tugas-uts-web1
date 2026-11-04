### Aplikasi Pemesanan Buku Online
> Project Ujian Tengah Semester (UTS) — Pemrograman Web 1

-------
### DATA DIRI
- Nama  Raihan Nabil Mas'ud
- NIM   312510094
- Kelas I.25.1A

### 1. Deskripsi Project
Aplikasi Pemesanan Buku Online merupakan aplikasi web sederhana yang dirancang untuk mensimulasikan proses pemesanan buku pada sebuah toko online. Project ini berfokus pada pengembangan sisi front-end menggunakan HTML, CSS, dan JavaScript.
Data aplikasi menggunakan data dummy yang disimpan dalam file JavaScript terpisah dalam bentuk array/object, sehingga aplikasi tidak memerlukan server atau database.
Aplikasi ini dibuat untuk menerapkan struktur HTML semantik, pengaturan tampilan menggunakan CSS, manipulasi DOM, validasi formulir, serta interaksi antarmuka pengguna.

### 2. Tujuan Project
Menerapkan struktur HTML yang semantik dan valid.
Mengatur tampilan halaman menggunakan CSS.
Menggunakan JavaScript untuk manipulasi DOM dan data.
Menerapkan validasi formulir serta memberikan feedback kepada pengguna.
Membuat halaman-halaman yang saling terhubung melalui navigasi.

### 3. Fitur dan Halaman Aplikasi
Berikut halaman yang menjadi ruang lingkup project sesuai instruksi tugas:

### 3.1 Halaman Login (`login.html`)
Halaman login digunakan sebagai tampilan awal untuk masuk ke aplikasi.
Fitur yang direncanakan sesuai spesifikasi tugas:
- Input email dan password.
- Tombol Login.
- Peringatan apabila email atau password tidak sesuai.
- Tombol Lupa Password dan Daftar yang menampilkan modal atau pop-up.

## Screenshot:
<img width="1861" height="978" alt="image" src="https://github.com/user-attachments/assets/e5661916-677a-44e1-9102-4a654478f2c9" />

### 3.2 Dashboard (`dashboard.html`)
Dashboard merupakan halaman menu utama setelah pengguna masuk ke aplikasi.
Menu yang diminta dalam tugas:
- Informasi Stok/Katalog.
- Tracking Pengiriman.
- Laporan Pemesanan.
- History Transaksi.
- Dashboard juga menampilkan greeting berdasarkan waktu lokal, seperti pagi, siang, atau sore.

## Screenshot:
<img width="1862" height="965" alt="image" src="https://github.com/user-attachments/assets/58fa85d5-780e-4798-94cb-4dd96fd4c7b0" />

### 3.3 Informasi Stok/Katalog (`stok.html`)
Halaman ini menampilkan daftar buku berdasarkan data dummy pada variabel `dataKatalogBuku` di file JavaScript.
Fitur yang diminta dalam tugas:
- Menampilkan data katalog secara dinamis.
- Menambahkan baris atau data stok baru menggunakan JavaScript DOM.

## Screenshot:
<img width="1862" height="976" alt="image" src="https://github.com/user-attachments/assets/b0cab26b-9e5d-44a2-b97a-dd25f75bcd49" />

### 3.4 Halaman Pemesanan / Checkout (`checkout.html`)
Halaman checkout digunakan untuk menampilkan dan mengelola data pemesanan buku.
Fitur yang diminta dalam tugas:
- Menampilkan data pemesanan.
- Menambahkan atau mengubah data pemesanan.
- Mengisi informasi pemesan dan pembayaran.

## Screenshot:
<img width="1869" height="972" alt="image" src="https://github.com/user-attachments/assets/73d072b1-c27c-42f6-a3c1-6821b0368e65" />

### 3.5 Informasi Pengiriman (`tracking.html`)
Halaman tracking digunakan untuk mencari informasi pengiriman berdasarkan nomor Delivery Order (DO).
Setelah nomor DO dicari, informasi yang ditampilkan sesuai spesifikasi tugas meliputi:
- Nama pemesan.
- Status pengiriman.
- Detail ekspedisi.
- Tanggal pengiriman.
- Jenis paket.
- Total pembayaran.
- Status pengiriman dapat disajikan menggunakan progress bar, warna, tabel, atau daftar.

## Screenshot:
<img width="1871" height="979" alt="image" src="https://github.com/user-attachments/assets/e33fc3eb-045b-4136-9c46-d756bbefb8be" />

### 4. Teknologi yang Digunakan
- HTML > **Membuat struktur dan elemen halaman web.**
- CSS > **Mengatur desain, tata letak, dan tampilan aplikasi.**
- JavaScript > **Mengelola data dummy, validasi, interaksi, dan manipulasi DOM.**

### 5. Struktur Folder
Contoh struktur dokumentasi project (sesuaikan dengan struktur repository yang sebenarnya):
```text
project-pemesanan-buku/
├── login.html
├── dashboard.html
├── stok.html
├── checkout.html
├── tracking.html
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   └── script.js
└── README.md
```

### 6. Cara Menjalankan Project
Unduh atau clone repository ini.
Ekstrak project apabila diunduh dalam bentuk ZIP.
Buka folder project menggunakan Visual Studio Code atau editor kode lainnya.
Jalankan file `login.html` melalui browser. Jika menggunakan ekstensi Live Server, klik kanan file HTML lalu pilih Open with Live Server.
Gunakan navigasi pada aplikasi untuk membuka halaman dan mencoba fitur yang tersedia.

### 7. Dokumentasi Video
Video berisi penjelasan mengenai sistematika pembuatan, alur penggunaan, fitur aplikasi, serta penerapan HTML, CSS, dan JavaScript.
Link YouTube:  
Masukkan link video demonstrasi YouTube di sini
> Ganti tautan di atas dengan URL video YouTube project yang sebenarnya.
---
