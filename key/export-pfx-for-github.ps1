# Xuất file .pfx → Base64 cho GitHub Secret CSC_BASE64
# KHÔNG commit kết quả ra git.
#
# Ví dụ:
#   .\key\export-pfx-for-github.ps1
#   .\key\export-pfx-for-github.ps1 -Password "SConfig2026"
#   .\key\export-pfx-for-github.ps1 -PfxPath "D:\path\other.pfx"

param(
    [string]$PfxPath = "$PSScriptRoot\..\certs\code-signing.pfx",
    [string]$Password = "",
    [switch]$WriteFile
)

$ErrorActionPreference = "Stop"
$PfxPath = (Resolve-Path -LiteralPath $PfxPath).Path

if (-not (Test-Path $PfxPath)) {
    Write-Host "Không tìm thấy: $PfxPath" -ForegroundColor Red
    Write-Host "Chạy trước: .\key\create-self-signed-cert.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not $Password) {
    $secure = Read-Host "Mật khẩu file .pfx (CSC_KEY_PASSWORD)" -AsSecureString
    $BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR) }
}

# Kiểm tra mật khẩu đúng (cert load được)
try {
    $securePwd = ConvertTo-SecureString -String $Password -Force -AsPlainText
    $null = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($PfxPath, $securePwd)
} catch {
    Write-Host "Mật khẩu .pfx sai hoặc file hỏng." -ForegroundColor Red
    exit 1
}

$bytes = [IO.File]::ReadAllBytes($PfxPath)
$base64 = [Convert]::ToBase64String($bytes)

Set-Clipboard -Value $base64

Write-Host ""
Write-Host "=== GitHub Actions secrets ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. CSC_BASE64" -ForegroundColor Green
Write-Host "   Da copy Base64 vao clipboard ($($base64.Length) ky tu)."
Write-Host "   GitHub -> Settings -> Secrets -> Actions -> New secret"
Write-Host "   Ten: CSC_BASE64 | Dan noi dung tu clipboard"
Write-Host ""
Write-Host "2. CSC_KEY_PASSWORD" -ForegroundColor Green
Write-Host "   Ten: CSC_KEY_PASSWORD"
Write-Host "   Gia tri: (mat khau .pfx vua nhap)"
Write-Host ""
Write-Host "Canh bao: KHONG commit file .pfx hoac chuoi Base64 len Git." -ForegroundColor Yellow

if ($WriteFile) {
    $out = Join-Path $env:TEMP "SConfig-CSC_BASE64.txt"
    Set-Content -Path $out -Value $base64 -NoNewline -Encoding ASCII
    Write-Host ""
    Write-Host "Da ghi tam (xoa sau khi dan vao GitHub): $out" -ForegroundColor DarkGray
}

# Thu ký thử (tuỳ chọn)
Write-Host ""
Write-Host "Ký local (tùy chọn):" -ForegroundColor DarkGray
Write-Host '  $env:CSC_LINK = "' + $PfxPath + '"'
Write-Host '  $env:CSC_KEY_PASSWORD = "<mat-khau>"'
Write-Host "  npx electron-builder --win --x64 --publish never"
