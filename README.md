# SConfig — Minecraft Server Plugin Configurator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**SConfig** là ứng dụng desktop giúp quản lý, chỉnh sửa và tạo cấu hình plugin cho máy chủ Minecraft — giao diện trực quan, phân vùng rõ ràng, không cần mở file YAML thủ công từng dòng.

> **English:** SConfig is a desktop app for managing, editing, and generating Minecraft server plugin configs with a visual UI, built-in tools, Monaco editor, and optional AI translation (BYOK).

---

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Công cụ tích hợp](#công-cụ-tích-hợp)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt & chạy](#cài-đặt--chạy)
- [Build bản cài đặt](#build-bản-cài-đặt)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [AI Translation (BYOK)](#ai-translation-byok)
- [Scripts npm](#scripts-npm)
- [Đóng góp](#đóng-góp)
- [Giấy phép](#giấy-phép)

---

## Tính năng chính

| Module | Mô tả |
|--------|--------|
| **Dashboard** | Tổng quan nhanh khi mở ứng dụng |
| **Servers** | Thêm và quản lý nhiều thư mục server Minecraft |
| **Files** | File explorer duyệt toàn bộ thư mục server, mở và lưu file trực tiếp |
| **Editor** | Monaco Editor hỗ trợ `.yml`, `.yaml`, `.json`, `.properties`, `.txt`, … |
| **Tools** | Bộ công cụ visual cho plugin phổ biến (xem bảng bên dưới) |
| **Settings** | Ngôn ngữ giao diện (Việt / English), cấu hình AI, cập nhật |
| **AI Translation** | Dịch nội dung config sang ngôn ngữ khác khi chỉnh sửa file (API key do bạn tự cung cấp) |

### Điểm nổi bật

- Giao diện tối, sidebar điều hướng gọn, hỗ trợ **i18n** (tiếng Việt & tiếng Anh).
- Xuất **YAML** trực tiếp từ các builder (MythicMobs, MMOItems, TAB, …).
- **YAML Validator** với highlight lỗi theo dòng trên Monaco.
- **Pixel Rank Generator** — tạo nhãn rank pixel-art, gradient, icon, xuất PNG.
- Không thu thập API key: team **không** cung cấp key miễn phí và **không** truy cập máy bạn để lấy dữ liệu nhạy cảm.

---

## Công cụ tích hợp

### Đã có sẵn

| Công cụ | Plugin / lĩnh vực |
|---------|-------------------|
| Pixel Rank Generator | Resource pack / rank labels |
| Color Code Preview | Mã màu `&` Minecraft |
| YAML Validator | Kiểm tra cú pháp & config |
| MMOItems Item Builder | [MMOItems](https://www.spigotmc.org/resources/mmoitems.39267/) |
| MMOCore Builder | [MMOCore](https://www.spigotmc.org/resources/mmocore.70575/) |
| CoreProtect Builder | [CoreProtect](https://www.spigotmc.org/resources/coreprotect.8631/) |
| Glyph Browser | Bedrock glyph (U+E100–U+E1FF) |
| MythicMobs Builder | [MythicMobs](https://mythiccraft.io/) |
| Vulcan Anticheat | [Vulcan](https://www.spigotmc.org/resources/vulcan-anti-cheat-advanced-detection.83626/) |
| Grim Anticheat | [GrimAC](https://github.com/GrimAnticheat/Grim) |
| Bedrock Pack Converter | Java / ItemsAdder / Oraxen → Bedrock `.mcpack` |
| Permission Builder | [LuckPerms](https://luckperms.net/) |
| PlaceholderAPI Helper | [PlaceholderAPI](https://www.spigotmc.org/resources/placeholderapi.6245/) |
| TAB Config Builder | [TAB](https://github.com/NEZNAMY/TAB) |

### Sắp ra mắt (placeholder trong app)

DeluxeMenus, Citizens, WorldGuard, Essentials, ShopGUIPlus, ItemsAdder, ChestShop, Oraxen, Vault, …

---

## Yêu cầu hệ thống

- **Node.js** 18+ (khuyến nghị 20 LTS)
- **npm** 9+
- **Windows** x64 (bản build NSIS hiện tại; dev có thể chạy trên OS khác qua Electron)

---

## Cài đặt & chạy

```bash
git clone https://github.com/foxstudio-201/SConfig.git
cd SConfig
npm install
npm run electron:dev
```

Ứng dụng mở cửa sổ Electron; Vite dev server chạy tại `http://localhost:5174`.

Chỉ chạy frontend (không Electron):

```bash
npm run dev
```

---

## Build bản cài đặt

```bash
npm run electron:build
```

- Tạo icon (`scripts/generate-icons.mjs`), build Vite, đóng gói **electron-builder**.
- Output: thư mục `dist-electron/` (installer NSIS Windows x64).

---

## Cấu trúc dự án

```
sconfig/
├── electron/          # Main process & preload (Electron)
├── public/            # Icon, static assets
├── scripts/           # Icon generation, i18n helpers
├── src/
│   ├── components/    # UI, pages, tools, AI panel
│   ├── context/       # React context (i18n, …)
│   ├── hooks/         # Custom hooks (AI config, …)
│   ├── i18n/          # Locale files (vi, en, …)
│   └── services/      # AI translation service
├── package.json
├── vite.config.js
└── update.html        # Cửa sổ cập nhật
```

---

## AI Translation (BYOK)

1. Vào **Settings** → cấu hình endpoint & API key (Bring Your Own Key).
2. Mở file trong **Files** / editor.
3. Nhấn **Shift + →** (mũi tên phải) để mở panel AI.
4. Chọn ngôn ngữ đích; nội dung dịch được stream, có log và backup cục bộ trên máy bạn.

**Lưu ý bảo mật:** API key chỉ lưu trên máy local theo cấu hình của bạn. FoxStudio không vận hành dịch vụ AI trung gian miễn phí cho dự án này.

---

## Scripts npm

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Vite dev (không Electron) |
| `npm run electron:dev` | Dev full stack (Vite + Electron) |
| `npm run build` | Build frontend → `dist/` |
| `npm run electron:build` | Icon + build + installer |
| `npm run lint` | ESLint kiểm tra `src/` |
| `npm run lint:fix` | ESLint tự sửa |
| `npm run generate:icons` | Tạo `public/icon.ico` & PNG |

---

## Công nghệ

- [Electron](https://www.electronjs.org/) — desktop shell
- [React 19](https://react.dev/) — UI
- [Vite 6](https://vitejs.dev/) — bundler
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — code editor
- [@heroicons/react](https://heroicons.com/) — icons

---

## Đóng góp

1. Fork repository
2. Tạo branch: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi
4. Mở Pull Request lên [foxstudio-201/SConfig](https://github.com/foxstudio-201/SConfig)

Báo lỗi hoặc đề xuất tính năng qua [Issues](https://github.com/foxstudio-201/SConfig/issues).

---

## Giấy phép

Dự án phát hành theo [MIT License](LICENSE) — Copyright (c) 2026 **FoxStudio**.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/foxstudio-201">FoxStudio</a>
</p>
