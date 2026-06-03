# ⚡ Neon Dash 2D (Rhythm Dash 2D)
![Game Banner](https://ibb.co.com/yB79gqSs)

**Neon Dash 2D** adalah game arcade ritme 2D yang cepat, imersif, dan penuh dengan visual estetika neon yang modern. Awalnya dikembangkan sebagai aplikasi web berbasis React, proyek ini kini hadir dengan versi desktop native Windows berkat integrasi Electron.

[🌐 Mainkan Versi Web](https://rhythm-dash-2d.vercel.app)

[📥 Download Installer Windows](https://github.com/zephyrexz/Rhythm-Dash-2D/releases)

---
## 🚀 Fitur Utama
*   **Gameplay Ritme yang Intens:** Nikmati sensasi melompati rintangan yang sinkron dengan ketukan musik.
*   **Sistem Dash Tokens & High Score:** Skor tertinggi dan token yang kamu kumpulkan akan tersimpan dengan aman melalui sistem `localStorage` (tidak akan hilang meskipun aplikasi di-update!).
*   **Fitur Shop Overlay:** Gunakan Dash Tokens yang sudah kamu kumpulkan untuk membeli berbagai skin karakter yang keren di menu toko.
*   **Imersif Fullscreen Mode:** Mainkan game dalam mode layar penuh tanpa gangguan menu bar untuk pengalaman bermain yang maksimal. Cukup tekan tombol `Esc` untuk keluar dari game secara instan.
*   **Official Desktop Installer (NSIS):** Tersedia file `.exe` setup resmi yang otomatis membuat *shortcut* di Desktop Windows kamu dan menyediakan fitur *uninstaller* bersih langsung lewat Control Panel.
---
## 📸 Tangkapan Layar (Screenshots)

| Menu Utama (Home Screen) | Aksi di Dalam Game |
| :--- | :--- |
| ![Home Screen](https://raw.githubusercontent.com/zephyrexz/Rhythm-Dash-2D/main/assets/home-screen.png) | ![Gameplay](https://raw.githubusercontent.com/zephyrexz/Rhythm-Dash-2D/main/assets/gameplay.png) |

---

## 🛠️ Teknologi yang Digunakan
Game ini dibangun menggunakan kombinasi ekosistem web modern berkekuatan tinggi:
*   **React 18 & TypeScript** - Untuk manajemen state komponen UI game yang cepat dan aman dari bug.
*   **Vite** - Sebagai *build tool* generasi baru yang super cepat.
*   **Tailwind CSS 4** - Untuk urusan *styling* antarmuka neon yang simpel dan estetik.
*   **Electron 30** - Untuk membungkus aplikasi web Vercel menjadi perangkat lunak desktop executable Windows.
*   **Electron Builder & NSIS** - Sebagai mesin pencetak sistem installer & uninstaller resmi.

---

## 💻 Panduan Pengembangan Lokal
Jika kamu ingin menjalankan atau mengembangkan game ini di komputer lokalmu, ikuti langkah-langkah berikut:
### Prasyarat
Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) di komputermu.
### 1. Klon Repositori
```bash
git clone [https://github.com/zephyrexz/Rhythm-Dash-2D.git](https://github.com/zephyrexz/Rhythm-Dash-2D.git)
cd Rhythm-Dash-2D
