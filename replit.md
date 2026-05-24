# WebGIS Mataram Baru

WebGIS interaktif peta Mataram Baru, Lombok dengan 651 lokasi dari data OpenStreetMap.

## Run & Operate

- `pnpm --filter @workspace/webgis-mataram run dev` — jalankan WebGIS (port 23061)
- `pnpm --filter @workspace/api-server run dev` — jalankan API server (port 5000)
- `pnpm run typecheck` — typecheck seluruh packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion
- Peta: Leaflet + react-leaflet
- Routing: OSRM (Open Source Routing Machine) API — gratis, tanpa API key
- Data: GeoJSON (651 lokasi Mataram Baru, Lombok)
- Animasi: Framer Motion

## Where things live

- `artifacts/webgis-mataram/` — aplikasi WebGIS utama
- `artifacts/webgis-mataram/src/data/mataram.json` — data GeoJSON 651 lokasi
- `artifacts/webgis-mataram/src/data/types.ts` — tipe TypeScript dan kategori lokasi
- `artifacts/webgis-mataram/src/context/AppContext.tsx` — global state (theme, basemap, routing)
- `artifacts/webgis-mataram/src/components/` — semua komponen UI
- `attached_assets/mataram_baru_1779602025622.geojson` — sumber data asli

## Fitur

- **Loading screen** 7 detik dengan tema hijau tropis, animasi daun, bisa di-skip (Enter/Spasi)
- **Peta interaktif** Leaflet — zoom, pan, tile OpenStreetMap
- **Multi-basemap** — Peta Jalan, Satelit (Esri), Topografi, Light (CartoDB), Dark (CartoDB)
- **Dark mode** — toggle terang/gelap dengan transisi halus
- **Search** — cari lokasi/kategori dengan Ctrl+K, autocomplete real-time
- **GPS** — tampilkan lokasi pengguna di peta
- **Kontrol layer** — tampilkan/sembunyikan 13 kategori lokasi dengan toggle switch
- **Panel informasi slide-in** — klik marker → panel animasi dari kanan dengan info lengkap
- **Routing** — hitung rute dari GPS/klik peta/search ke tujuan mana saja
  - Titik awal: GPS, klik peta, atau cari lokasi
  - Titik tujuan: klik peta, cari lokasi, atau dari panel info ("Buat Rute ke Sini")
  - Tukar asal-tujuan dengan satu klik
  - Tampilkan jarak, waktu tempuh, dan panduan arah
- **651 lokasi** — restoran, kafe, hotel, ATM, rumah sakit, dll.

## Kategori Lokasi

atm, bar, cafe, fast_food, pub, restaurant, shelter, hotel, hostel, guest_house, motel, chalet, hospital

## Architecture decisions

- GeoJSON disalin ke `src/data/mataram.json` untuk menghindari restricsi `fs.strict` Vite
- Layer markers dikelola manual via L.LayerGroup untuk performa lebih baik dari GeoJSON layer bawaan
- `useMap()` hooks ada di dalam MapContainer sebagai null-rendering/fixed-panel children
- `AppContext` menyediakan global state: theme, basemap, routing state
- Framer Motion untuk semua animasi — loading screen, panel slide-in, dropdown
- Dark mode via CSS variables + `.dark` class pada `<html>` element
- Routing via OSRM public API (tidak perlu API key, gratis)
- Route polyline di-render langsung ke Leaflet map dari dalam MapContainer
- `RoutePanelInner` perlu berada di dalam MapContainer karena menggunakan `useMap()` untuk render polyline

## User preferences

- Bahasa Indonesia untuk teks UI
- Tema hijau tropis (sesuai Lombok/NTB)

## Gotchas

- `framer-motion` sudah terinstall via catalog, tidak perlu install ulang
- Leaflet CSS harus diimport di `index.css` sebelum tailwind utilities
- File GeoJSON asli di `attached_assets/` tidak bisa diakses langsung dari Vite dev server karena `fs.strict: true`
- OSRM adalah routing untuk kendaraan — rute pejalan kaki mungkin tidak tersedia di semua area
