# GitHub Actions — Secrets cho SConfig

Workflow: [`.github/workflows/build-release.yml`](workflows/build-release.yml)

## Secrets bắt buộc

| Secret | Cần thêm? | Mô tả |
|--------|-----------|--------|
| *(không có)* | — | `GITHUB_TOKEN` do GitHub tự cấp khi workflow chạy. Đủ để **build** và **tạo Release** (đã bật `permissions: contents: write`). |

Với repo public/open source, **chỉ cần push tag** là build được bản **không ký số**.

## Ký mã Windows — tránh SmartScreen

### Điều quan trọng cần biết

| Loại | SmartScreen |
|------|-------------|
| **Không ký** | Cảnh báo “Unknown publisher” gần như chắc chắn |
| **Tự ký (self-signed)** | **Không** giúp người dùng cuối — Windows vẫn coi là không tin cậy |
| **Chứng chỉ thương mại (OV / EV)** | Đúng hướng — tên công ty hiện trên installer, SmartScreen giảm dần theo **uy tín publisher** |

SmartScreen không tắt ngay sau khi mua cert. Microsoft tích lũy **reputation** theo số lượt tải/chạy file đã ký. **EV (Extended Validation)** thường có reputation nhanh hơn **OV (Standard)**.

Chứng chỉ cần loại **Code Signing** (Authenticode), **không** dùng chứng chỉ SSL website.

### Bước 1 — Mua chứng chỉ (gợi ý nhà cung cấp)

Đăng ký tài khoản doanh nghiệp / cá nhân (tùy CA), xác minh danh tính, nhận file cài hoặc token USB.

| Nhà cung cấp | Ghi chú |
|--------------|---------|
| [SSL.com](https://www.ssl.com/code-signing/) | Giá phổ biến, có OV & EV |
| [Sectigo / Comodo](https://www.sectigo.com/ssl-certificates-tls/code-signing) | OV phổ biến |
| [DigiCert](https://www.digicert.com/signing/code-signing-certificates) | Đắt hơn, uy tín cao |
| [Certum](https://www.certum.eu/en/code-signing-certificate/) | Giá thấp (EU) |

- **OV (Organization Validation):** rẻ hơn, reputation lên chậm hơn.
- **EV:** thường bắt buộc USB token/HSM, đắt hơn, SmartScreen thường “êm” sớm hơn cho app mới.

Sau khi duyệt, CA gửi file **`.pfx`** + mật khẩu, hoặc cài cert vào **USB token** (EV — ký trên máy local, CI phức tạp hơn).

### Bước 2 — Xuất file `.pfx` (nếu cert nằm trong Windows)

1. `Win + R` → `certmgr.msc` (user) hoặc `certlm.msc` (machine).
2. **Personal → Certificates** → chọn cert **Code Signing**.
3. Chuột phải → **All Tasks → Export** → **Yes, export the private key** → định dạng **PFX**.
4. Đặt mật khẩu mạnh — đây là `CSC_KEY_PASSWORD`.

Giữ `.pfx` **bí mật** (như mật khẩu ngân hàng). Không commit lên Git.

### Bước 3 — Thêm secrets trên GitHub (CI đã cấu hình sẵn)

Workflow đọc:

| Secret | Giá trị |
|--------|---------|
| `CSC_BASE64` | Toàn bộ file `.pfx` encode **Base64** (một dòng). |
| `CSC_KEY_PASSWORD` | Mật khẩu export `.pfx`. |

**Script có sẵn trong repo** (sau khi tạo cert bằng `key/create-self-signed-cert.ps1`):

```powershell
cd D:\code\config\Sconfig
.\key\export-pfx-for-github.ps1 -Password "SConfig2026"
```

(Mật khẩu mặc định của script tạo cert là `SConfig2026` — đổi nếu bạn đã đặt khác.)

Script sẽ:
1. Kiểm tra mật khẩu `.pfx` đúng
2. Copy **Base64** vào clipboard → dán vào secret **`CSC_BASE64`**
3. Nhắc tạo secret **`CSC_KEY_PASSWORD`** = mật khẩu file `.pfx`

Kiểm tra cert:

```powershell
.\key\verify-pfx.ps1 -Password "SConfig2026"
```

**Thủ công (không dùng script):**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\code-signing.pfx")) | Set-Clipboard
```

GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

> **Không** commit `certs/*.pfx` — đã có trong `.gitignore`.

Push tag `v*` → job Windows sẽ log `Building with code signing` nếu secret đúng.

### Bước 4 — Ký thử trên máy local (trước khi đưa lên CI)

```powershell
cd D:\code\config\Sconfig
$env:CSC_LINK = "C:\path\to\code-signing.pfx"
$env:CSC_KEY_PASSWORD = "mat-khau-pfx"
npm run generate:icons
npm run build
npx electron-builder --win --x64 --publish never
```

### Bước 5 — Kiểm tra file đã ký

```powershell
Get-AuthenticodeSignature ".\dist-electron\SConfig Setup 1.0.0.exe"
```

`Status` nên là **Valid**. Trong Properties → **Digital Signatures** phải thấy tên công ty trên cert.

### EV + USB token (ký trên CI)

Nhiều cert EV **không** xuất được private key ra `.pfx`. Khi đó:

- Ký **trên máy Windows** có cắm token, rồi upload `.exe` lên Release thủ công, **hoặc**
- Dùng self-hosted runner Windows + token, **hoặc**
- Dịch vụ cloud ký (Azure Trusted Signing, SignPath.io, …).

Repo hiện tại dùng mô hình **`.pfx` trong GitHub Secrets`** — phù hợp **OV** hoặc OV đã export được `.pfx`.

### Sau khi ký — SmartScreen vẫn có thể cảnh báo?

Có, vài bản đầu là bình thường. Cách giảm dần:

1. Luôn ký **cả installer** (electron-builder NSIS đã ký khi có `CSC_*`).
2. Phát hành ổn định từ cùng một publisher (cùng cert).
3. Không đổi cert liên tục.
4. Có thể gửi file lên [Microsoft hardware/dev portal — reputation](https://www.microsoft.com/en-us/wdsi/filesubmission) nếu bị chặn oan (tùy trường hợp).

**Linux** không dùng SmartScreen; ký Windows **không** ảnh hưởng `.AppImage` / `.deb`.

## Cách thêm secret trên GitHub

1. Mở repo `foxstudio-201/SConfig` (hoặc repo của bạn).
2. **Settings** → **Secrets and variables** → **Actions**.
3. **New repository secret** → nhập tên và giá trị → **Add secret**.

## Chạy workflow

### Phát hành bản chính thức (có file trên Releases)

1. Sửa `version` trong `package.json` (ví dụ `1.0.1`).
2. Commit và push.
3. Tạo tag **trùng version** (có tiền tố `v`):

```bash
git tag v1.0.1
git push origin v1.0.1
```

Workflow sẽ: build **Windows + Linux** (song song) → upload artifacts → tạo GitHub Release kèm `.exe`, `.AppImage`, `.deb`, `.rpm`.

Nếu tag không khớp `package.json` (ví dụ tag `v1.0.2` nhưng package là `1.0.0`), job release **sẽ fail** có chủ đích.

### Chỉ build thử (không tạo Release)

1. **Actions** → **Build & Release SConfig** → **Run workflow** → **Run workflow**.

Chỉ tải artifact trong run, **không** tạo Release (vì không có tag `v*`).

## App kiểm tra cập nhật

Ứng dụng đọc release mới nhất từ:

`https://api.github.com/repos/foxstudio-201/SConfig/releases/latest`

- **Windows:** asset `.exe` (ưu tiên `Setup`) → tải trực tiếp.
- **Linux:** asset `.AppImage` / `.deb` / `.rpm` theo OS đang chạy.
- Nếu chưa có file phù hợp trên release: mở trang Releases trên GitHub.

Override repo (dev): biến môi trường `SCONFIG_UPDATE_REPO=owner/repo`.

## Liên kết với website SconfigWeb

Website (`web/lib/github.js`) cũng trỏ `foxstudio-201/SConfig` và tải asset `.exe` / `.msi` từ Releases. Sau khi workflow chạy xong và có file `.exe` trên Release, nút tải trên web sẽ hoạt động.
