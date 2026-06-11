# Generate Android keystore for signing APK
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/generate-keystore.ps1

param(
    [string]$JavaHome = "D:\scoop\apps\openjdk17\current",
    [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$KeystoreDir = Join-Path $ProjectRoot "src-tauri\gen\android\app"
$KeystorePath = Join-Path $KeystoreDir "tauri-release.keystore"
$PropsPath = Join-Path $KeystoreDir "keystore.properties"

# Set JAVA_HOME
if (Test-Path $JavaHome) {
    $env:JAVA_HOME = $JavaHome
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}
else {
    $JavaHome = $null
}

# Find keytool
$Keytool = if ($JavaHome) { Join-Path $JavaHome "bin\keytool.exe" } else { "keytool" }
if (-not (Get-Command $Keytool -ErrorAction SilentlyContinue)) {
    Write-Host "X keytool not found. Install JDK or set -JavaHome" -ForegroundColor Red
    exit 1
}

Write-Host "==> Generating Android Keystore" -ForegroundColor Cyan

if ($NonInteractive) {
    $KeyAlias = "tauri-key"
    $StorePasswordPlain = "tauri-dev"
    $KeyPasswordPlain = "tauri-dev"
    $DName = "Tauri Dev"
    $OrgUnit = ""
    $Org = "Dev"
    $City = ""
    $State = ""
    $Country = "CN"
}
else {
    $KeyAlias = Read-Host "Key alias (default: tauri-key)"
    if ([string]::IsNullOrWhiteSpace($KeyAlias)) { $KeyAlias = "tauri-key" }

    $StorePassword = Read-Host "Store password (min 6 chars)" -AsSecureString
    $StorePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($StorePassword)
    )

    $KeyPassword = Read-Host "Key password (min 6 chars)" -AsSecureString
    $KeyPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($KeyPassword)
    )

    $DName = Read-Host "Name (CN)"
    $OrgUnit = Read-Host "Org unit (OU, optional)"
    $Org = Read-Host "Organization (O, optional)"
    $City = Read-Host "City (L, optional)"
    $State = Read-Host "State (ST, optional)"
    $Country = Read-Host "Country code (C, e.g. CN)"
}

# Check existing keystore
if (Test-Path $KeystorePath) {
    if ($NonInteractive) {
        Remove-Item $KeystorePath -Force
    }
    else {
        $response = Read-Host "WARNING: Keystore exists. Overwrite? (yes/no)"
        if ($response -ne "yes") { Write-Host "Aborted." -ForegroundColor Yellow; exit 0 }
        Remove-Item $KeystorePath -Force
    }
}

if (-not (Test-Path $KeystoreDir)) {
    New-Item -Path $KeystoreDir -ItemType Directory -Force | Out-Null
}

# Build distinguished name
$DN = "CN=$DName"
if ($OrgUnit) { $DN += ", OU=$OrgUnit" }
if ($Org) { $DN += ", O=$Org" }
if ($City) { $DN += ", L=$City" }
if ($State) { $DN += ", ST=$State" }
if ($Country) { $DN += ", C=$Country" }

Write-Host "==> Generating keystore..." -ForegroundColor Cyan

$proc = Start-Process -FilePath $Keytool -ArgumentList @(
    "-genkeypair", "-v", "-storetype", "PKCS12",
    "-keystore", "`"$KeystorePath`"",
    "-alias", $KeyAlias,
    "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
    "-storepass", $StorePasswordPlain,
    "-keypass", $KeyPasswordPlain,
    "-dname", "`"$DN`""
) -Wait -PassThru -NoNewWindow

if ($proc.ExitCode -ne 0) {
    Write-Host "X Keystore generation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==> Creating keystore.properties..." -ForegroundColor Cyan

@"
storeFile=tauri-release.keystore
storePassword=$StorePasswordPlain
keyAlias=$KeyAlias
keyPassword=$KeyPasswordPlain
"@ | Set-Content -Path $PropsPath

Write-Host ""
Write-Host "OK Keystore generated!" -ForegroundColor Green
Write-Host "  Keystore: $KeystorePath" -ForegroundColor Cyan
Write-Host "  Config:   $PropsPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add keystore to .gitignore:" -ForegroundColor Yellow
Write-Host "  echo "tauri-release.keystore" >> src-tauri/gen/android/app/.gitignore" -ForegroundColor White
