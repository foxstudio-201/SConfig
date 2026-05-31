# Kiểm tra file .pfx và thông tin cert (không in private key)

param(
    [string]$PfxPath = "$PSScriptRoot\..\certs\code-signing.pfx",
    [string]$Password = ""
)

$ErrorActionPreference = "Stop"
$PfxPath = (Resolve-Path -LiteralPath $PfxPath).Path

if (-not $Password) {
    $secure = Read-Host "Mật khẩu .pfx" -AsSecureString
    $BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR) }
}

$securePwd = ConvertTo-SecureString -String $Password -Force -AsPlainText
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($PfxPath, $securePwd)

Write-Host "Subject:     $($cert.Subject)" -ForegroundColor Cyan
Write-Host "Issuer:      $($cert.Issuer)" -ForegroundColor Cyan
Write-Host "Thumbprint:  $($cert.Thumbprint)"
Write-Host "NotBefore:   $($cert.NotBefore)"
Write-Host "NotAfter:    $($cert.NotAfter)"
Write-Host "HasPrivateKey: $($cert.HasPrivateKey)"

if ($cert.Subject -eq $cert.Issuer) {
    Write-Host ""
    Write-Host "Day la self-signed — SmartScreen van canh bao voi nguoi dung khac." -ForegroundColor Yellow
    Write-Host "Chi giam canh bao tren MAY da tin cay cert (hoac mua OV/EV)." -ForegroundColor Yellow
}

$cert.Dispose()
