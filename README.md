# AlyzDev — ID-based embed library

## Menjalankan
- Install Node.js 18+
- `npm install`
- `npm start`
- Buka `http://localhost:3000`

## Menambahkan video
Edit `public/AlyzVD.js`. Isi string ID saja:

```js
window.ALYZ_VIDEOS = [
  "qJzibR5XL5N",
  "iajwbw",
  "id-ketiga"
];
```

Aplikasi membentuk embed URL dengan pola:
`https://www.alyztools.com/embed/` + ID.

## Metadata thumbnail dan judul
Backend mencoba membaca Open Graph (`og:title`, `og:image`) dari halaman embed. Ini hanya akan berhasil jika penyedia mengirim metadata tersebut dan mengizinkan permintaan server. Jika tidak tersedia, AlyzDev memakai judul fallback `Video [ID]` dan thumbnail placeholder.

## Batasan teknis penting
- Iframe lintas domain tidak bisa dibaca atau dikendalikan JavaScript halaman AlyzDev karena kebijakan same-origin. Tombol play/pause dan speed khusus hanya bisa dibuat jika penyedia menyediakan Player API resmi.
- Favorite disimpan di localStorage browser/perangkat ini, bukan berdasarkan IP.
- Animasi scan adalah simulasi visual, bukan pembacaan sidik jari. Autentikasi biometrik nyata memerlukan WebAuthn/passkeys.
- Konfirmasi usia di template adalah pernyataan mandiri, bukan pemeriksaan identitas.
- Tidak ada downloader universal pihak ketiga. Gunakan hanya fitur unduh resmi dari pemilik konten.
