"use strict";

/* ============ 1. KONFIGURASI & UTILITAS ============ */
const KUNCI = {
  sesi: "pn_sesi",
  katalog: "pn_katalog",
  pesanan: "pn_pesanan",
  users: "pn_users",
  keranjang: "pn_keranjang"
};

/* Tahapan status pengiriman (index = tahap) */
const TAHAP = ["Diproses", "Dikemas", "Dikirim", "Dalam Perjalanan", "Terkirim"];

/* Tarif ongkir: ekspedisi -> jenis paket -> biaya */
const EKSPEDISI = {
  "JNE":           { "Reguler": 15000, "Express": 30000, "Same Day": 45000 },
  "Pos Indonesia": { "Reguler": 13000, "Express": 26000, "Same Day": 40000 },
  "J&T":           { "Reguler": 14000, "Express": 28000, "Same Day": 42000 },
  "SiCepat":       { "Reguler": 12000, "Express": 25000, "Same Day": 40000 }
};

const METODE_BAYAR = {
  "Transfer Bank": "Transfer ke rekening BCA 123-456-7890 a.n. Pustaka Nusantara. Pesanan diproses setelah pembayaran terverifikasi.",
  "Kartu Kredit":  "Pembayaran diproses lewat gateway aman (simulasi). Tidak ada data kartu yang disimpan.",
  "E-Wallet":      "Kode QR pembayaran akan dikirim ke email Anda (simulasi) dan berlaku selama 24 jam.",
  "COD":           "Bayar tunai langsung kepada kurir saat paket diterima. Tidak ada biaya tambahan."
};

const DAFTAR_JENIS = ["Buku Ajar", "Modul", "Buku Referensi", "Bahan Ajar Cetak", "Lainnya"];
const BATAS_STOK_MENIPIS = 100;
const LANGKAH_STOK = 10;

const $ = (selektor, akar = document) => akar.querySelector(selektor);
const $$ = (selektor, akar = document) => [...akar.querySelectorAll(selektor)];

/* Membuat elemen DOM: el("div", {class:"x", onclick:fn}, anak1, anak2) */
function el(tag, props = {}, ...anak) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === false || v == null) continue;
    if (k === "class") e.className = v;
    else if (k === "dataset") Object.assign(e.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  anak.flat().forEach(a => e.append(a instanceof Node ? a : document.createTextNode(String(a))));
  return e;
}

const SVG_NS = "http://www.w3.org/2000/svg";
function ikon(nama) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", "#i-" + nama);
  svg.append(use);
  return svg;
}

/* Sprite ikon (disisipkan sekali agar HTML tetap ringkas) */
function sisipkanSprite() {
  const s = (id, isi) => `<symbol id="i-${id}" viewBox="0 0 24 24">${isi}</symbol>`;
  const sprite = `<svg xmlns="${SVG_NS}" style="display:none" aria-hidden="true">
    ${s("book", '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>')}
    ${s("truck", '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>')}
    ${s("chart", '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>')}
    ${s("clock", '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>')}
    ${s("cart", '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>')}
    ${s("logout", '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>')}
    ${s("plus", '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>')}
    ${s("minus", '<line x1="5" y1="12" x2="19" y2="12"/>')}
    ${s("trash", '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>')}
    ${s("search", '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>')}
    ${s("check-circle", '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>')}
    ${s("alert-circle", '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>')}
    ${s("info", '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>')}
    ${s("x", '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>')}
    ${s("eye", '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>')}
    ${s("refresh", '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>')}
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);
}

/* ---------- Format & konversi ---------- */
/* "Rp 180.000" -> 180000 */
const parseRupiah = s => typeof s === "number" ? s : (parseInt(String(s).replace(/\D/g, ""), 10) || 0);
/* 180000 -> "Rp 180.000" */
const formatRupiah = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n).replace(/ /g, " ");

/* Menerima "2025-08-25" atau "2025-08-25 10:12:20" (termasuk salah ketik "2025-08 25 14:07:56") */
function parseWaktu(teks) {
  const m = String(teks).match(/(\d{4})-(\d{2})[-\s](\d{2})(?:[T\s]+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}
function formatTanggal(teks) {
  const d = parseWaktu(teks);
  return d ? d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : String(teks);
}
function formatWaktu(teks) {
  const d = parseWaktu(teks);
  return d ? d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : String(teks);
}
const pad = n => String(n).padStart(2, "0");
const hariIniISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const stempelWaktu = () => { const d = new Date(); return `${hariIniISO()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };

/* ============ 2. AKSES DATA ============ */
function ambil(kunci, cadangan) {
  try { const r = localStorage.getItem(kunci); return r ? JSON.parse(r) : cadangan; }
  catch (e) { return cadangan; }
}
function simpan(kunci, nilai) {
  try { localStorage.setItem(kunci, JSON.stringify(nilai)); } catch (e) { /* abaikan */ }
}

/* Katalog: dataKatalogBuku (+ perubahan pengguna di localStorage) */
const getKatalog = () => ambil(KUNCI.katalog, null) || dataKatalogBuku.map(b => ({ ...b }));
const setKatalog = daftar => simpan(KUNCI.katalog, daftar);
const hargaBuku = b => parseRupiah(b.harga);

/* Pengguna: dataPengguna + akun yang didaftarkan */
const getUsers = () => [...dataPengguna, ...ambil(KUNCI.users, [])];

/* Pesanan: dataTracking (objek berkunci nomor DO) + pesanan baru dari checkout */
function hitungTahap(p) {
  let idx = TAHAP.findIndex(t => t.toLowerCase() === String(p.status).trim().toLowerCase());
  if (idx < 0) idx = 0;
  const terakhir = (p.perjalanan || [])[(p.perjalanan || []).length - 1];
  if (terakhir && /^selesai antar/i.test(terakhir.keterangan)) idx = TAHAP.length - 1; // paket sudah diterima
  return idx;
}
const normalisasi = p => ({ ...p, totalAngka: parseRupiah(p.total), tahap: hitungTahap(p) });
const getPesanan = () => [...Object.values(dataTracking), ...ambil(KUNCI.pesanan, [])].map(normalisasi);
function tambahPesanan(p) { const l = ambil(KUNCI.pesanan, []); l.push(p); simpan(KUNCI.pesanan, l); }
function buatNomorDO() {
  const angka = getPesanan().map(p => parseInt(p.nomorDO, 10) || 0);
  const dasar = new Date().getFullYear() * 10000;
  return String(Math.max(dasar, ...angka) + 1);
}

const nadaStatus = idx => idx >= 4 ? "ok" : idx >= 2 ? "info" : "warn";
const lencanaStatus = p => el("span", { class: "badge badge--" + nadaStatus(p.tahap) }, TAHAP[p.tahap]);

function statusStok(n) {
  if (n === 0) return { label: "Habis", kelas: "badge--danger" };
  if (n <= BATAS_STOK_MENIPIS) return { label: "Menipis", kelas: "badge--warn" };
  return { label: "Tersedia", kelas: "badge--ok" };
}

/* Sampul buku: gambar dari data.js; jika gagal (mis. .jpeg vs .jpg) coba ekstensi lain,
   dan bila tetap gagal tampilkan sampul pengganti berwarna */
function buatCover(b, kecil = false) {
  const nama = b.namaBarang || "", kode = b.kodeBarang || "";
  let h = 0;
  for (const c of kode + nama) h = (h * 31 + c.charCodeAt(0)) % 360;
  const wrap = el("div", { class: "cover" + (kecil ? " cover--sm" : "") });
  const fallback = () => {
    wrap.textContent = "";
    wrap.classList.add("cover--fallback");
    wrap.style.background = `linear-gradient(145deg, hsl(${h}, 45%, 38%), hsl(${h}, 50%, 22%))`;
    wrap.append(el("span", {}, nama.trim().charAt(0).toUpperCase()));
  };
  if (b.cover) {
    const img = el("img", { src: b.cover, alt: "Sampul " + nama, loading: "lazy" });
    let sudahCoba = false;
    img.addEventListener("error", () => {
      if (!sudahCoba) {
        sudahCoba = true;
        const alt = b.cover.replace(/\.jpe?g$/i, m => m.toLowerCase() === ".jpeg" ? ".jpg" : ".jpeg");
        if (alt !== b.cover) { img.src = alt; return; }
      }
      fallback();
    });
    wrap.append(img);
  } else fallback();
  return wrap;
}

/* ============ 3. KOMPONEN UI ============ */
let terakhirFokus = null;

function bukaModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  $$("form", m).forEach(bersihkanForm);
  terakhirFokus = document.activeElement;
  m.hidden = false;
  document.body.classList.add("modal-open");
  const f = $("input:not([type=hidden]), select, textarea", m);
  if (f) f.focus();
}

function tutupModal(m) {
  if (!m) return;
  if (m.dataset.dinamis) m.remove(); else m.hidden = true;
  if (!$(".modal:not([hidden])")) document.body.classList.remove("modal-open");
  if (terakhirFokus && terakhirFokus.focus) terakhirFokus.focus();
}

/* Dialog dinamis (pengganti alert/confirm bawaan browser) */
function buatDialog({ judul, pesan, tipe = "info", tombol }) {
  $$(".modal[data-dinamis]").forEach(m => m.remove());
  const namaIkon = { success: "check-circle", error: "alert-circle", warning: "alert-circle", info: "info" }[tipe] || "info";
  const daftarTombol = tombol || [{ label: "Mengerti" }];
  const overlay = el("div", {
    class: "modal", role: "alertdialog", "aria-modal": "true",
    "aria-labelledby": "dialogJudul", "aria-describedby": "dialogPesan", dataset: { dinamis: "1" }
  },
    el("div", { class: "modal__box modal__box--sm" },
      el("div", { class: "dialog__ikon dialog__ikon--" + tipe }, ikon(namaIkon)),
      el("h2", { id: "dialogJudul", class: "dialog__judul" }, judul),
      el("p", { id: "dialogPesan", class: "dialog__pesan" }, pesan),
      el("div", { class: "dialog__aksi" },
        daftarTombol.map(t => el("button", {
          type: "button", class: "btn " + (t.kelas || "btn--primary"),
          onclick: () => { tutupModal(overlay); if (t.aksi) t.aksi(); }
        }, t.label)))));
  terakhirFokus = document.activeElement;
  document.body.append(overlay);
  document.body.classList.add("modal-open");
  $(".btn:last-child", overlay).focus();
}
const tampilkanAlert = (judul, pesan, tipe = "info", aksi) => buatDialog({ judul, pesan, tipe, tombol: [{ label: "Mengerti", aksi }] });
const tampilkanKonfirmasi = (judul, pesan, aksiYa, labelYa = "Ya, lanjutkan") => buatDialog({
  judul, pesan, tipe: "warning",
  tombol: [{ label: "Batal", kelas: "btn--ghost" }, { label: labelYa, kelas: "btn--danger", aksi: aksiYa }]
});

function tampilkanToast(pesan, tipe = "success") {
  let tumpuk = $(".toast-stack");
  if (!tumpuk) { tumpuk = el("div", { class: "toast-stack", "aria-live": "polite" }); document.body.append(tumpuk); }
  const t = el("div", { class: "toast toast--" + tipe, role: "status" }, ikon(tipe === "success" ? "check-circle" : "alert-circle"), pesan);
  tumpuk.append(t);
  setTimeout(() => t.remove(), 3200);
}

/* Validasi form: pesan error tampil di bawah field */
function setError(input, pesan) {
  const f = input.closest(".field");
  if (!f) return;
  f.classList.toggle("has-error", !!pesan);
  const er = $(".field__error", f);
  if (er) er.textContent = pesan || "";
  input.setAttribute("aria-invalid", pesan ? "true" : "false");
}
function cek(input, kondisi, pesan) { setError(input, kondisi ? "" : pesan); return !!kondisi; }
function bersihkanForm(form) {
  $$(".field", form).forEach(f => { f.classList.remove("has-error"); const er = $(".field__error", f); if (er) er.textContent = ""; });
  $$("[aria-invalid]", form).forEach(i => i.removeAttribute("aria-invalid"));
}
function fokusError(form) { const i = $("[aria-invalid='true']", form); if (i) i.focus(); }
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isTelepon = v => /^(\+62|62|0)8[0-9]{8,12}$/.test(v.replace(/[\s-]/g, ""));

/* ============ 4. AUTENTIKASI & INISIALISASI GLOBAL ============ */
const getSesi = () => { try { return JSON.parse(sessionStorage.getItem(KUNCI.sesi)); } catch (e) { return null; } };

function jagaHalaman() {
  const halaman = document.body.dataset.page;
  const sesi = getSesi();
  if (halaman === "login") {
    if (sesi) { location.replace("dashboard.html"); return false; }
    return true;
  }
  if (!sesi) { location.replace("index.html"); return false; }
  return true;
}

function inisialisasiGlobal() {
  const sesi = getSesi();
  if (sesi) {
    $$("[data-nama-user]").forEach(e => { e.textContent = sesi.nama; });
    $$("[data-role-user]").forEach(e => { e.textContent = sesi.role || "User"; });
  }

  const berkas = location.pathname.split("/").pop() || "index.html";
  $$(".topnav a").forEach(a => { if (a.getAttribute("href") === berkas) a.setAttribute("aria-current", "page"); });

  const logout = $("#btnLogout");
  if (logout) logout.addEventListener("click", () => tampilkanKonfirmasi("Keluar dari akun?", "Anda akan kembali ke halaman login.", () => {
    sessionStorage.removeItem(KUNCI.sesi);
    location.href = "index.html";
  }, "Ya, keluar"));

  document.addEventListener("click", e => {
    const buka = e.target.closest("[data-buka]");
    if (buka) { bukaModal(buka.dataset.buka); return; }
    const tutup = e.target.closest("[data-tutup]");
    if (tutup) { tutupModal(tutup.closest(".modal")); return; }
    if (e.target.classList && e.target.classList.contains("modal")) tutupModal(e.target);
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const terbuka = $$(".modal:not([hidden])");
    if (terbuka.length) tutupModal(terbuka[terbuka.length - 1]);
  });
  // error hilang begitu pengguna mulai memperbaiki isian
  const hapusError = e => { const f = e.target.closest && e.target.closest(".field"); if (f && f.classList.contains("has-error")) setError(e.target, ""); };
  document.addEventListener("input", hapusError);
  document.addEventListener("change", hapusError);
}

/* ============ 5A. HALAMAN LOGIN ============ */
function initLogin() {
  const form = $("#formLogin"), email = $("#email"), pass = $("#password");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const em = email.value.trim().toLowerCase();
    let ok = true;
    ok = cek(email, em !== "", "Email wajib diisi.") && ok;
    if (em !== "") ok = cek(email, isEmail(em), "Format email tidak valid (contoh: nama@email.com).") && ok;
    ok = cek(pass, pass.value !== "", "Password wajib diisi.") && ok;
    if (!ok) { fokusError(form); return; }

    const user = getUsers().find(u => u.email.toLowerCase() === em && u.password === pass.value);
    if (!user) {
      tampilkanAlert("Login Gagal", "Email/password yang Anda masukkan salah.", "error");
      pass.value = "";
      return;
    }
    sessionStorage.setItem(KUNCI.sesi, JSON.stringify({ id: user.id, nama: user.nama, email: user.email, role: user.role || "User" }));
    location.href = "dashboard.html";
  });

  // tampil / sembunyikan password
  $("#togglePassword").addEventListener("click", ev => {
    const tampil = pass.type === "password";
    pass.type = tampil ? "text" : "password";
    ev.currentTarget.setAttribute("aria-label", tampil ? "Sembunyikan password" : "Tampilkan password");
  });

  // modal: lupa password
  const formLupa = $("#formLupa"), emailLupa = $("#emailLupa");
  formLupa.addEventListener("submit", e => {
    e.preventDefault();
    const em = emailLupa.value.trim().toLowerCase();
    if (!cek(emailLupa, em !== "" && isEmail(em), "Masukkan email yang valid.")) return;
    if (!getUsers().some(u => u.email.toLowerCase() === em)) {
      setError(emailLupa, "Email ini belum terdaftar.");
      return;
    }
    tutupModal($("#modalLupa"));
    formLupa.reset();
    tampilkanAlert("Tautan Terkirim", `Instruksi reset password telah dikirim ke ${em} (simulasi).`, "success");
  });

  // modal: daftar
  const formDaftar = $("#formDaftar");
  formDaftar.addEventListener("submit", e => {
    e.preventDefault();
    const nama = $("#namaDaftar"), em = $("#emailDaftar"), pw = $("#passDaftar"), pk = $("#passKonfirmasi");
    const emailVal = em.value.trim().toLowerCase();
    let ok = true;
    ok = cek(nama, nama.value.trim().length >= 3, "Nama minimal 3 karakter.") && ok;
    ok = cek(em, isEmail(emailVal), "Format email tidak valid.") && ok;
    if (ok) ok = cek(em, !getUsers().some(u => u.email.toLowerCase() === emailVal), "Email sudah terdaftar. Silakan login.") && ok;
    ok = cek(pw, pw.value.length >= 6 && /[A-Za-z]/.test(pw.value) && /\d/.test(pw.value), "Password minimal 6 karakter, kombinasi huruf dan angka.") && ok;
    ok = cek(pk, pk.value === pw.value && pk.value !== "", "Konfirmasi password tidak sama.") && ok;
    if (!ok) { fokusError(formDaftar); return; }

    const baru = ambil(KUNCI.users, []);
    const id = Math.max(0, ...getUsers().map(u => u.id || 0)) + 1;
    baru.push({ id, nama: nama.value.trim(), email: emailVal, password: pw.value, role: "User" });
    simpan(KUNCI.users, baru);
    tutupModal($("#modalDaftar"));
    formDaftar.reset();
    email.value = emailVal;
    pass.value = "";
    tampilkanAlert("Pendaftaran Berhasil", "Akun Anda sudah dibuat. Silakan login dengan email tersebut.", "success", () => pass.focus());
  });
}

/* ============ 5B. HALAMAN DASHBOARD ============ */
function salamWaktu(jam) {
  if (jam >= 4 && jam < 11) return "Pagi";
  if (jam >= 11 && jam < 15) return "Siang";
  if (jam >= 15 && jam < 18) return "Sore";
  return "Malam";
}

function initDashboard() {
  const sesi = getSesi();
  const salam = $("#salam"), waktu = $("#tanggalWaktu");
  function perbaruiWaktu() {
    const now = new Date();
    salam.textContent = `Selamat ${salamWaktu(now.getHours())}, ${sesi.nama.split(" ")[0]}!`;
    waktu.textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      + " · " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  perbaruiWaktu();
  setInterval(perbaruiWaktu, 1000);

  // statistik ringkas
  const katalog = getKatalog(), pesanan = getPesanan();
  $("#statJudul").textContent = katalog.length;
  $("#statStok").textContent = katalog.reduce((t, b) => t + b.stok, 0).toLocaleString("id-ID");
  $("#statPesanan").textContent = pesanan.length;
  $("#statPendapatan").textContent = formatRupiah(pesanan.reduce((t, p) => t + p.totalAngka, 0));

  // modal laporan pemesanan: rekap per ekspedisi
  $("#btnLaporan").addEventListener("click", () => {
    const data = getPesanan();
    const peta = new Map();
    data.forEach(p => {
      const r = peta.get(p.ekspedisi) || { ekspedisi: p.ekspedisi, jumlah: 0, total: 0 };
      r.jumlah += 1;
      r.total += p.totalAngka;
      peta.set(p.ekspedisi, r);
    });
    const baris = [...peta.values()].sort((a, b) => b.total - a.total);
    const maks = Math.max(1, ...baris.map(r => r.total));
    const totalSemua = data.reduce((t, p) => t + p.totalAngka, 0);
    const perTahap = TAHAP.map((t, i) => ({ t, n: data.filter(p => p.tahap === i).length })).filter(x => x.n > 0);

    const isi = $("#isiLaporan");
    isi.textContent = "";
    isi.append(
      el("p", { class: "muted" }, `${data.length} pesanan · rata-rata ${formatRupiah(data.length ? Math.round(totalSemua / data.length) : 0)} per pesanan`),
      el("p", { class: "muted" }, "Status: " + perTahap.map(x => `${x.t} ${x.n}`).join(" · ")),
      el("div", { class: "table-wrap" }, el("table", { class: "table" },
        el("thead", {}, el("tr", {}, el("th", {}, "#"), el("th", {}, "Ekspedisi"), el("th", { class: "num" }, "Pesanan"), el("th", { class: "num" }, "Total Pembayaran"), el("th", {}, "Kontribusi"))),
        el("tbody", {}, baris.map((r, i) => el("tr", {},
          el("td", { class: "col-no" }, i + 1),
          el("td", {}, el("strong", {}, r.ekspedisi)),
          el("td", { class: "num" }, r.jumlah),
          el("td", { class: "num" }, formatRupiah(r.total)),
          el("td", {}, el("div", { class: "bar", role: "img", "aria-label": `${Math.round(r.total / maks * 100)}% dari ekspedisi tertinggi` },
            el("span", { style: `width:${(r.total / maks * 100).toFixed(1)}%` })))))),
        el("tfoot", {}, el("tr", {}, el("td", { colspan: 2 }, "Total"), el("td", { class: "num" }, data.length), el("td", { class: "num" }, formatRupiah(totalSemua)), el("td", {}))))));
    bukaModal("modalLaporan");
  });

  // modal history transaksi
  const cari = $("#cariHistory"), tbodyH = $("#tbodyHistory"), kosongH = $("#kosongHistory");
  function renderHistory() {
    const q = cari.value.trim().toLowerCase();
    const data = getPesanan().slice().reverse().filter(p => !q || p.nomorDO.toLowerCase().includes(q) || p.nama.toLowerCase().includes(q));
    tbodyH.textContent = "";
    data.forEach(p => tbodyH.append(el("tr", {},
      el("td", { class: "mono" }, p.nomorDO),
      el("td", {}, formatTanggal(p.tanggalKirim)),
      el("td", {}, p.nama),
      el("td", { class: "num" }, formatRupiah(p.totalAngka)),
      el("td", { class: "hide-sm" }, p.ekspedisi),
      el("td", {}, lencanaStatus(p)),
      el("td", {}, el("a", { class: "btn btn--ghost btn--sm", href: "tracking.html?do=" + encodeURIComponent(p.nomorDO) }, "Lacak")))));
    kosongH.hidden = data.length > 0;
  }
  cari.addEventListener("input", renderHistory);
  $("#btnHistory").addEventListener("click", () => { cari.value = ""; renderHistory(); bukaModal("modalHistory"); });
}

/* ============ 5C. HALAMAN STOK / KATALOG ============ */
function initStok() {
  let katalog = getKatalog();
  const state = { q: "", jenis: "", urut: "default" };
  const tbody = $("#tbodyStok"), kosong = $("#kosongStok");
  const inpCari = $("#cariStok"), selJenis = $("#filterJenis"), selUrut = $("#urutStok");
  const form = $("#formTambah");
  const barisDari = kode => $(`tr[data-kode="${CSS.escape(kode)}"]`, tbody);

  const terfilter = () => {
    const q = state.q.toLowerCase();
    const hasil = katalog.filter(b => (!state.jenis || b.jenisBarang === state.jenis)
      && (!q || b.namaBarang.toLowerCase().includes(q) || b.kodeBarang.toLowerCase().includes(q) || b.jenisBarang.toLowerCase().includes(q)));
    const urutan = {
      nama: (a, b) => a.namaBarang.localeCompare(b.namaBarang, "id"),
      "harga-asc": (a, b) => hargaBuku(a) - hargaBuku(b),
      "harga-desc": (a, b) => hargaBuku(b) - hargaBuku(a),
      "stok-asc": (a, b) => a.stok - b.stok,
      "stok-desc": (a, b) => b.stok - a.stok
    }[state.urut];
    return urutan ? hasil.sort(urutan) : hasil;
  };

  function nomori() { $$("tr", tbody).forEach((tr, i) => { $(".col-no", tr).textContent = i + 1; }); }

  function perbaruiRingkasan() {
    $("#sumJudul").textContent = katalog.length;
    $("#sumStok").textContent = katalog.reduce((t, b) => t + b.stok, 0).toLocaleString("id-ID");
    $("#sumNilai").textContent = formatRupiah(katalog.reduce((t, b) => t + b.stok * hargaBuku(b), 0));
    $("#sumMenipis").textContent = katalog.filter(b => b.stok <= BATAS_STOK_MENIPIS).length;
    const tampil = $$("tr", tbody).length;
    $("#infoJumlah").textContent = `Menampilkan ${tampil} dari ${katalog.length} judul`;
    kosong.hidden = tampil > 0;
  }

  function isiFilterJenis() {
    const sekarang = selJenis.value;
    selJenis.textContent = "";
    selJenis.append(el("option", { value: "" }, "Semua jenis"));
    [...new Set(katalog.map(b => b.jenisBarang))].sort().forEach(k => selJenis.append(el("option", { value: k }, k)));
    selJenis.value = sekarang;
    if (selJenis.value !== sekarang) { selJenis.value = ""; state.jenis = ""; }
  }

  /* Membuat satu baris tabel secara dinamis lewat DOM */
  function buatBaris(b) {
    const st = statusStok(b.stok);
    return el("tr", { dataset: { kode: b.kodeBarang } },
      el("td", { class: "col-no" }, ""),
      el("td", {}, buatCover(b)),
      el("td", { class: "mono" }, b.kodeBarang),
      el("td", {}, el("strong", { class: "judul" }, b.namaBarang), el("span", { class: "sub" }, `${b.jenisBarang} · Edisi ${b.edisi}`)),
      el("td", { class: "hide-sm" }, b.jenisBarang),
      el("td", { class: "num hide-sm" }, b.edisi),
      el("td", { class: "num" }, b.harga),
      el("td", { class: "num" }, el("strong", {}, b.stok.toLocaleString("id-ID"))),
      el("td", {}, el("span", { class: "badge " + st.kelas }, st.label)),
      el("td", { class: "aksi" },
        el("button", { type: "button", class: "btn btn--ghost btn--icon", title: `Kurangi ${LANGKAH_STOK}`, "aria-label": `Kurangi stok ${b.namaBarang} sebanyak ${LANGKAH_STOK}`, disabled: b.stok === 0, onclick: () => ubahStok(b.kodeBarang, -LANGKAH_STOK) }, ikon("minus")),
        el("button", { type: "button", class: "btn btn--ghost btn--icon", title: `Tambah ${LANGKAH_STOK}`, "aria-label": `Tambah stok ${b.namaBarang} sebanyak ${LANGKAH_STOK}`, onclick: () => ubahStok(b.kodeBarang, LANGKAH_STOK) }, ikon("plus")),
        el("button", { type: "button", class: "btn btn--ghost btn--icon", title: "Hapus buku", "aria-label": "Hapus " + b.namaBarang, onclick: () => hapusBuku(b.kodeBarang) }, ikon("trash"))));
  }

  function renderTabel() {
    tbody.textContent = "";
    terfilter().forEach(b => tbody.append(buatBaris(b)));
    nomori();
    perbaruiRingkasan();
  }

  function ubahStok(kode, selisih) {
    const b = katalog.find(x => x.kodeBarang === kode);
    if (!b) return;
    b.stok = Math.max(0, b.stok + selisih);
    setKatalog(katalog);
    const lama = barisDari(kode);
    if (lama) lama.replaceWith(buatBaris(b));
    nomori();
    perbaruiRingkasan();
  }

  function hapusBuku(kode) {
    const b = katalog.find(x => x.kodeBarang === kode);
    if (!b) return;
    tampilkanKonfirmasi("Hapus buku ini?", `"${b.namaBarang}" akan dihapus dari katalog.`, () => {
      katalog = katalog.filter(x => x.kodeBarang !== kode);
      setKatalog(katalog);
      const tr = barisDari(kode);
      const selesai = () => { if (tr) tr.remove(); nomori(); isiFilterJenis(); perbaruiRingkasan(); };
      if (tr) { tr.classList.add("baris-hapus"); setTimeout(selesai, 300); } else selesai();
      tampilkanToast(`"${b.namaBarang}" dihapus.`);
    }, "Ya, hapus");
  }

  // filter, cari, urut
  inpCari.addEventListener("input", () => { state.q = inpCari.value.trim(); renderTabel(); });
  selJenis.addEventListener("change", () => { state.jenis = selJenis.value; renderTabel(); });
  selUrut.addEventListener("change", () => { state.urut = selUrut.value; renderTabel(); });

  // reset data ke data.js
  $("#btnReset").addEventListener("click", () => tampilkanKonfirmasi("Kembalikan data awal?", "Perubahan katalog (tambah, hapus, stok) akan dibatalkan.", () => {
    localStorage.removeItem(KUNCI.katalog);
    katalog = getKatalog();
    isiFilterJenis();
    renderTabel();
    tampilkanToast("Katalog dikembalikan ke data awal.");
  }, "Ya, kembalikan"));

  // form tambah stok
  const selJenisForm = $("#jenisBaru");
  DAFTAR_JENIS.forEach(k => selJenisForm.append(el("option", { value: k }, k)));

  $("#btnTambah").addEventListener("click", () => {
    form.reset();
    bukaModal("modalTambah");
    $("#kodeBaru").focus();
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const kode = $("#kodeBaru"), nama = $("#namaBaru"), jenis = $("#jenisBaru"), edisi = $("#edisiBaru"), harga = $("#hargaBaru"), stok = $("#stokBaru"), cover = $("#coverBaru");
    const kodeVal = kode.value.trim().toUpperCase();
    const edisiVal = Number(edisi.value), hargaVal = Number(harga.value), stokVal = Number(stok.value);
    const formatKode = /^[A-Z]{4}\d{4}$/.test(kodeVal);
    let ok = true;
    ok = cek(kode, formatKode, "Format kode: 4 huruf + 4 angka (contoh: EKMA4116).") && ok;
    if (formatKode) ok = cek(kode, !katalog.some(b => b.kodeBarang === kodeVal), "Kode barang sudah digunakan.") && ok;
    ok = cek(nama, nama.value.trim().length >= 3, "Nama barang minimal 3 karakter.") && ok;
    ok = cek(jenis, jenis.value !== "", "Pilih jenis barang.") && ok;
    ok = cek(edisi, edisi.value !== "" && Number.isInteger(edisiVal) && edisiVal >= 1 && edisiVal <= 20, "Edisi harus bilangan bulat 1–20.") && ok;
    ok = cek(harga, harga.value !== "" && Number.isInteger(hargaVal) && hargaVal >= 1000, "Harga harus bilangan bulat minimal Rp1.000.") && ok;
    ok = cek(stok, stok.value !== "" && Number.isInteger(stokVal) && stokVal >= 0, "Stok harus bilangan bulat, minimal 0.") && ok;
    ok = cek(cover, cover.value.trim() === "" || /^[\w\-./]+\.(jpe?g|png|webp)$/i.test(cover.value.trim()), "Isi path gambar seperti img/nama.jpg, atau kosongkan.") && ok;
    if (!ok) { fokusError(form); return; }

    const buku = {
      kodeBarang: kodeVal, namaBarang: nama.value.trim(), jenisBarang: jenis.value, edisi: String(edisiVal),
      stok: stokVal, harga: formatRupiah(hargaVal), cover: cover.value.trim()
    };
    katalog.push(buku);
    setKatalog(katalog);
    tutupModal($("#modalTambah"));
    isiFilterJenis();

    if (state.q || state.jenis || state.urut !== "default") {
      state.q = ""; state.jenis = ""; state.urut = "default";
      inpCari.value = ""; selJenis.value = ""; selUrut.value = "default";
      renderTabel();
    } else {
      // tambah baris baru langsung ke DOM tanpa merender ulang seluruh tabel
      tbody.append(buatBaris(buku));
      nomori();
      perbaruiRingkasan();
    }
    const baris = barisDari(buku.kodeBarang);
    if (baris) { baris.classList.add("baris-baru"); baris.scrollIntoView({ behavior: "smooth", block: "center" }); }
    tampilkanToast(`"${buku.namaBarang}" ditambahkan ke katalog.`);
  });

  isiFilterJenis();
  renderTabel();
}

/* ============ 5D. HALAMAN CHECKOUT / PEMESANAN ============ */
function initCheckout() {
  const sesi = getSesi();
  let keranjang = ambil(KUNCI.keranjang, []);
  const selBuku = $("#pilihBuku"), inpQty = $("#jumlahBuku"), tbody = $("#tbodyKeranjang");
  const selEks = $("#ekspedisi"), selPaket = $("#jenisPaket"), selBayar = $("#metodeBayar");
  const form = $("#formPesan");
  const nama = $("#namaPemesan"), email = $("#emailPemesan"), telepon = $("#teleponPemesan"), alamat = $("#alamatPemesan");

  const cariBuku = kode => getKatalog().find(b => b.kodeBarang === kode);

  // rapikan keranjang lama (buku dihapus / stok berubah)
  keranjang = keranjang.filter(i => cariBuku(i.kode) && cariBuku(i.kode).stok > 0)
    .map(i => ({ kode: i.kode, qty: Math.min(i.qty, cariBuku(i.kode).stok) }));
  simpan(KUNCI.keranjang, keranjang);

  function isiPilihanBuku() {
    selBuku.textContent = "";
    selBuku.append(el("option", { value: "" }, "— Pilih buku —"));
    getKatalog().filter(b => b.stok > 0).forEach(b => selBuku.append(el("option", { value: b.kodeBarang }, `${b.namaBarang} (${b.kodeBarang}) — ${b.harga} · stok ${b.stok}`)));
  }
  function isiPilihanPengiriman() {
    selEks.append(el("option", { value: "" }, "— Pilih ekspedisi —"));
    Object.keys(EKSPEDISI).forEach(k => selEks.append(el("option", { value: k }, k)));
    selPaket.append(el("option", { value: "" }, "— Pilih jenis paket —"));
    Object.keys(Object.values(EKSPEDISI)[0]).forEach(k => selPaket.append(el("option", { value: k }, k)));
    selBayar.append(el("option", { value: "" }, "— Pilih metode —"));
    Object.keys(METODE_BAYAR).forEach(k => selBayar.append(el("option", { value: k }, k)));
  }

  const subtotalKeranjang = () => keranjang.reduce((t, i) => { const b = cariBuku(i.kode); return t + (b ? hargaBuku(b) * i.qty : 0); }, 0);
  const ongkir = () => (EKSPEDISI[selEks.value] && EKSPEDISI[selEks.value][selPaket.value]) || 0;

  function renderRingkasan() {
    const sub = subtotalKeranjang(), ong = keranjang.length ? ongkir() : 0;
    $("#txtSubtotal").textContent = formatRupiah(sub);
    $("#txtOngkir").textContent = formatRupiah(ong);
    $("#txtTotal").textContent = formatRupiah(sub + ong);
    $("#txtJumlahItem").textContent = keranjang.reduce((t, i) => t + i.qty, 0);
    $("#btnKosongkan").disabled = keranjang.length === 0;
  }

  function renderKeranjang() {
    tbody.textContent = "";
    if (!keranjang.length) {
      tbody.append(el("tr", {}, el("td", { colspan: 5, class: "empty" }, "Keranjang masih kosong. Pilih buku di atas lalu klik Tambah.")));
    }
    keranjang.forEach(item => {
      const b = cariBuku(item.kode);
      if (!b) return;
      const harga = hargaBuku(b);
      const qty = el("input", { type: "number", min: 1, max: b.stok, value: item.qty, class: "input-qty", "aria-label": "Jumlah " + b.namaBarang });
      const sub = el("td", { class: "num" }, formatRupiah(harga * item.qty));
      qty.addEventListener("change", () => {
        let v = parseInt(qty.value, 10);
        if (!Number.isInteger(v) || v < 1) { v = 1; tampilkanToast("Jumlah minimal 1.", "warning"); }
        if (v > b.stok) { v = b.stok; tampilkanAlert("Stok tidak mencukupi", `Stok "${b.namaBarang}" hanya ${b.stok} eksemplar.`, "warning"); }
        item.qty = v;
        qty.value = v;
        sub.textContent = formatRupiah(harga * v);
        simpan(KUNCI.keranjang, keranjang);
        renderRingkasan();
      });
      tbody.append(el("tr", {},
        el("td", {}, el("div", { class: "item-buku" }, buatCover(b, true), el("div", {}, el("strong", { class: "judul" }, b.namaBarang), el("span", { class: "sub" }, `${b.kodeBarang} · Edisi ${b.edisi}`)))),
        el("td", { class: "num hide-sm" }, b.harga),
        el("td", {}, qty),
        sub,
        el("td", { class: "aksi" }, el("button", {
          type: "button", class: "btn btn--ghost btn--icon", "aria-label": "Hapus " + b.namaBarang, title: "Hapus dari keranjang",
          onclick: () => { keranjang = keranjang.filter(x => x.kode !== item.kode); simpan(KUNCI.keranjang, keranjang); renderKeranjang(); }
        }, ikon("trash")))));
    });
    renderRingkasan();
  }

  // tambah ke keranjang
  $("#btnTambahKeranjang").addEventListener("click", () => {
    const qty = parseInt(inpQty.value, 10);
    let ok = cek(selBuku, selBuku.value !== "", "Pilih buku terlebih dahulu.");
    ok = cek(inpQty, Number.isInteger(qty) && qty >= 1, "Jumlah minimal 1.") && ok;
    if (!ok) return;
    const b = cariBuku(selBuku.value);
    const ada = keranjang.find(i => i.kode === b.kodeBarang);
    const total = (ada ? ada.qty : 0) + qty;
    if (total > b.stok) {
      tampilkanAlert("Stok tidak mencukupi", `Stok "${b.namaBarang}" hanya ${b.stok} eksemplar` + (ada ? ` (sudah ${ada.qty} di keranjang).` : "."), "warning");
      return;
    }
    if (ada) ada.qty = total; else keranjang.push({ kode: b.kodeBarang, qty });
    simpan(KUNCI.keranjang, keranjang);
    renderKeranjang();
    selBuku.value = "";
    inpQty.value = 1;
    tampilkanToast(`"${b.namaBarang}" masuk keranjang.`);
  });

  $("#btnKosongkan").addEventListener("click", () => tampilkanKonfirmasi("Kosongkan keranjang?", "Semua buku di keranjang akan dihapus.", () => {
    keranjang = [];
    simpan(KUNCI.keranjang, keranjang);
    renderKeranjang();
  }, "Ya, kosongkan"));

  // ongkir & info pembayaran dinamis
  [selEks, selPaket].forEach(s => s.addEventListener("change", renderRingkasan));
  const infoBayar = $("#infoBayar");
  selBayar.addEventListener("change", () => {
    infoBayar.textContent = METODE_BAYAR[selBayar.value] || "";
    infoBayar.hidden = !selBayar.value;
  });

  // kirim pesanan
  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    ok = cek(nama, nama.value.trim().length >= 3, "Nama pemesan minimal 3 karakter.") && ok;
    ok = cek(email, isEmail(email.value.trim()), "Format email tidak valid.") && ok;
    ok = cek(telepon, isTelepon(telepon.value.trim()), "Nomor telepon tidak valid (contoh: 081234567890).") && ok;
    ok = cek(alamat, alamat.value.trim().length >= 10, "Alamat lengkap minimal 10 karakter.") && ok;
    ok = cek(selEks, selEks.value !== "", "Pilih ekspedisi.") && ok;
    ok = cek(selPaket, selPaket.value !== "", "Pilih jenis paket.") && ok;
    ok = cek(selBayar, selBayar.value !== "", "Pilih metode pembayaran.") && ok;
    if (!ok) { fokusError(form); return; }
    if (!keranjang.length) { tampilkanAlert("Keranjang kosong", "Tambahkan minimal satu buku sebelum membuat pesanan.", "warning"); return; }

    // pastikan stok masih cukup
    const katalog = getKatalog();
    for (const item of keranjang) {
      const b = katalog.find(x => x.kodeBarang === item.kode);
      if (!b || b.stok < item.qty) {
        tampilkanAlert("Stok berubah", `Stok "${b ? b.namaBarang : item.kode}" tidak lagi mencukupi. Silakan ubah jumlah pesanan.`, "error");
        return;
      }
    }

    const items = keranjang.map(i => { const b = katalog.find(x => x.kodeBarang === i.kode); return { kode: b.kodeBarang, nama: b.namaBarang, qty: i.qty, harga: hargaBuku(b) }; });
    const subtotal = items.reduce((t, i) => t + i.qty * i.harga, 0);
    const ong = ongkir();
    // struktur sama dengan dataTracking pada data.js + rincian pesanan
    const pesanan = {
      nomorDO: buatNomorDO(), nama: nama.value.trim(), status: "Diproses", ekspedisi: selEks.value,
      tanggalKirim: hariIniISO(), paket: selPaket.value, total: formatRupiah(subtotal + ong),
      perjalanan: [{ waktu: stempelWaktu(), keterangan: "Pesanan diterima. Pengirim: Pustaka Nusantara" }],
      items, subtotal, ongkir: ong, email: email.value.trim(), telepon: telepon.value.trim(),
      alamat: alamat.value.trim(), metode: selBayar.value, catatan: $("#catatan").value.trim()
    };
    tambahPesanan(pesanan);
    items.forEach(i => { katalog.find(x => x.kodeBarang === i.kode).stok -= i.qty; });
    setKatalog(katalog);

    keranjang = [];
    simpan(KUNCI.keranjang, keranjang);
    form.reset();
    nama.value = sesi.nama;
    infoBayar.hidden = true;
    isiPilihanBuku();
    renderKeranjang();

    buatDialog({
      judul: "Pesanan Berhasil Dibuat", tipe: "success",
      pesan: el("span", {}, "Nomor Delivery Order Anda: ", el("strong", {}, pesanan.nomorDO), `. Total pembayaran ${pesanan.total}. Simpan nomor ini untuk melacak pengiriman.`),
      tombol: [
        { label: "Tutup", kelas: "btn--ghost" },
        { label: "Lacak Pesanan", aksi: () => { location.href = "tracking.html?do=" + encodeURIComponent(pesanan.nomorDO); } }
      ]
    });
  });

  isiPilihanBuku();
  isiPilihanPengiriman();
  nama.value = sesi.nama;
  email.value = sesi.email;
  renderKeranjang();
}

/* ============ 5E. HALAMAN TRACKING ============ */
function initTracking() {
  const form = $("#formCari"), input = $("#noDO"), hasil = $("#hasil"), petunjuk = $("#petunjuk");

  function tampilkanHasil(p) {
    $("#hNama").textContent = p.nama;
    $("#hNoDO").textContent = p.nomorDO;
    const badge = $("#hStatus");
    badge.className = "badge badge--" + nadaStatus(p.tahap);
    badge.textContent = TAHAP[p.tahap];

    const persen = Math.round((p.tahap + 1) / TAHAP.length * 100);
    const bar = $("#progressBar");
    bar.className = "progress tone-" + nadaStatus(p.tahap);
    bar.setAttribute("aria-valuenow", persen);
    bar.setAttribute("aria-label", `Progres pengiriman ${persen}%`);
    const fill = $(".progress__fill", bar);
    fill.style.width = "0";
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = persen + "%"; }));

    const akhir = TAHAP.length - 1;
    const stepper = $("#stepper");
    stepper.textContent = "";
    TAHAP.forEach((label, i) => {
      const kelas = (i < p.tahap || p.tahap === akhir) ? "is-done" : i === p.tahap ? "is-current" : "";
      stepper.append(el("li", { class: ("step " + kelas).trim(), "aria-current": i === p.tahap ? "step" : false }, label));
    });

    $("#dEkspedisi").textContent = p.ekspedisi;
    $("#dTanggal").textContent = formatTanggal(p.tanggalKirim);
    $("#dPaket").textContent = p.paket;
    $("#dTotal").textContent = formatRupiah(p.totalAngka);
    // metode & alamat hanya ada pada pesanan yang dibuat lewat checkout
    $("#wrapMetode").hidden = !p.metode;
    $("#wrapAlamat").hidden = !p.alamat;
    if (p.metode) $("#dMetode").textContent = p.metode;
    if (p.alamat) $("#dAlamat").textContent = p.alamat;

    // rincian item hanya untuk pesanan yang punya data item
    const adaItem = Array.isArray(p.items) && p.items.length > 0;
    $("#blokRincian").hidden = !adaItem;
    $("#layoutHasil").style.gridTemplateColumns = adaItem ? "" : "1fr";
    if (adaItem) {
      const tbody = $("#tbodyItem");
      tbody.textContent = "";
      p.items.forEach(i => tbody.append(el("tr", {},
        el("td", {}, i.nama), el("td", { class: "num" }, i.qty), el("td", { class: "num" }, formatRupiah(i.harga)), el("td", { class: "num" }, formatRupiah(i.qty * i.harga)))));
      $("#fSubtotal").textContent = formatRupiah(p.subtotal);
      $("#fOngkir").textContent = formatRupiah(p.ongkir);
      $("#fTotal").textContent = formatRupiah(p.totalAngka);
    }

    const tl = $("#timeline");
    tl.textContent = "";
    (p.perjalanan || []).slice().reverse().forEach(r => tl.append(el("li", {}, el("time", {}, formatWaktu(r.waktu)), r.keterangan)));

    petunjuk.hidden = true;
    hasil.hidden = false;
    hasil.classList.remove("fade-in");
    void hasil.offsetWidth;
    hasil.classList.add("fade-in");
  }

  function cari(nomor) {
    const q = nomor.trim();
    if (!cek(input, q !== "", "Nomor Delivery Order wajib diisi.")) { input.focus(); return; }
    if (!cek(input, /^\d+$/.test(q), "Nomor DO hanya berisi angka (contoh: 20230012).")) { input.focus(); return; }
    const p = getPesanan().find(x => x.nomorDO === q);
    if (!p) {
      hasil.hidden = true;
      petunjuk.hidden = false;
      setError(input, "Nomor tidak ditemukan.");
      tampilkanAlert("Pesanan Tidak Ditemukan", `Tidak ada pengiriman dengan nomor ${q}. Periksa kembali nomor DO Anda.`, "error");
      return;
    }
    input.value = p.nomorDO;
    tampilkanHasil(p);
  }

  form.addEventListener("submit", e => { e.preventDefault(); cari(input.value); });

  // contoh nomor DO (klik untuk mengisi otomatis)
  const contoh = $("#contohDO");
  getPesanan().slice(-4).reverse().forEach(p => contoh.append(
    el("button", { type: "button", class: "chip", onclick: () => { input.value = p.nomorDO; cari(p.nomorDO); } }, p.nomorDO)));

  const param = new URLSearchParams(location.search).get("do");
  if (param) { input.value = param; cari(param); }
}

/* ============ START ============ */
document.addEventListener("DOMContentLoaded", () => {
  sisipkanSprite();
  if (!jagaHalaman()) return;
  inisialisasiGlobal();
  const inisialisasi = { login: initLogin, dashboard: initDashboard, stok: initStok, checkout: initCheckout, tracking: initTracking }[document.body.dataset.page];
  if (inisialisasi) inisialisasi();
});
