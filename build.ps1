# Tauri App Template Build Script
# Supports Windows Desktop and Android builds.
# iOS remains a manual setup path for now.

param(
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$Command,

    [Parameter(Mandatory = $false)]
    [Alias("c")]
    [switch]$Clean,

    [Parameter(Mandatory = $false)]
    [Alias("h")]
    [switch]$Help,

    [Parameter(Mandatory = $false)]
    [Alias("a")]
    [ValidateSet("arm64", "armv7", "x86_64", "x86", "all")]
    [string]$Arch = "arm64"
)

$ScriptRoot = if (-not [string]::IsNullOrWhiteSpace($PSScriptRoot)) {
    $PSScriptRoot
}
else {
    Split-Path -Parent $MyInvocation.MyCommand.Path
}
$ScriptRoot = [System.IO.Path]::GetFullPath($ScriptRoot).TrimEnd('\', '/')
Set-Location -LiteralPath $ScriptRoot

# Color output
function Write-Color { param([string]$M, [string]$C = "White") Write-Host $M -ForegroundColor $C }
function Write-Step { param([string]$M) Write-Color "`n==> $M" "Cyan" }
function Write-OK  { param([string]$M) Write-Color "OK $M" "Green" }
function Write-Err { param([string]$M) Write-Color "X $M" "Red" }

function Show-Help {
    Write-Host ""
    Write-Color "============================================" "Cyan"
    Write-Color "    Tauri App Template Build Script v1.0     " "Cyan"
    Write-Color "============================================" "Cyan"
    Write-Host ""
    Write-Color "USAGE:" "Yellow"
    Write-Host "  .\build.ps1 [command]"
    Write-Host ""
    Write-Color "COMMANDS:" "Yellow"
    Write-Host "  d, dev          Run Windows dev mode" -ForegroundColor White
    Write-Host "  bd, build       Build Windows production" -ForegroundColor White
    Write-Host "  ad, android-dev            Run Android dev mode" -ForegroundColor White
    Write-Host "  abd, android-build         Build Android production APK" -ForegroundColor White
    Write-Host "  abd-d, android-build-debug Build Android debug APK" -ForegroundColor White
    Write-Host ""
    Write-Color "OPTIONS:" "Yellow"
    Write-Host "  -c, -Clean       Clean build artifacts before building" -ForegroundColor White
    Write-Host "  -a, -Arch <ABI>  Android ABI filter: arm64, armv7, x86_64, x86, all (default: arm64)" -ForegroundColor White
    Write-Host "  -h, -Help        Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Color "EXAMPLES:" "Yellow"
    Write-Host "  .\build.ps1 d              # Windows dev mode" -ForegroundColor Gray
    Write-Host "  .\build.ps1 bd             # Windows build" -ForegroundColor Gray
    Write-Host "  .\build.ps1 bd -c          # Windows clean build" -ForegroundColor Gray
    Write-Host "  .\build.ps1 abd            # Android release APK (arm64 only)" -ForegroundColor Gray
    Write-Host "  .\build.ps1 abd -a all     # Android release APK (all ABIs)" -ForegroundColor Gray
    Write-Host "  .\build.ps1 abd-d          # Android debug APK (arm64 only)" -ForegroundColor Gray
    Write-Host ""
    Write-Color "SUPPORTED SCRIPT TARGETS:" "Yellow"
    Write-Host "  Windows Desktop" -ForegroundColor White
    Write-Host "  Android Mobile" -ForegroundColor White
    Write-Host ""
    Write-Color "NOTE:" "Yellow"
    Write-Host "  iOS is not wired into this script yet; use manual Tauri mobile setup when adding iOS support." -ForegroundColor White
    Write-Host ""
}

# Parse command
$Dev = $false
$Target = ""
$AndroidDebugBuild = $false

if ($Help) { Show-Help; exit 0 }

if ($Command) {
    switch ($Command.ToLower()) {
        "d" { $Dev = $true; $Target = "windows" }
        "dev" { $Dev = $true; $Target = "windows" }
        "bd" { $Dev = $false; $Target = "windows" }
        "build" { $Dev = $false; $Target = "windows" }
        "ad" { $Dev = $true; $Target = "android" }
        "android-dev" { $Dev = $true; $Target = "android" }
        "abd" { $Dev = $false; $Target = "android"; $AndroidDebugBuild = $false }
        "android-build" { $Dev = $false; $Target = "android"; $AndroidDebugBuild = $false }
        "abd-d" { $Dev = $false; $Target = "android"; $AndroidDebugBuild = $true }
        "android-build-debug" { $Dev = $false; $Target = "android"; $AndroidDebugBuild = $true }
        "--help" { Show-Help; exit 0 }
        "-h" { Show-Help; exit 0 }
        "help" { Show-Help; exit 0 }
        default {
            Write-Err "Unknown command: $Command"
            Write-Host "Run '.\build.ps1 -h' for usage" -ForegroundColor Yellow
            exit 1
        }
    }
}
else {
    # Interactive menu
    Write-Color "`n============================================" "Cyan"
    Write-Color "    Tauri App Template Build Script v1.0     " "Cyan"
    Write-Color "============================================" "Cyan"
    Write-Host ""
    Write-Host "  1. Windows Desktop (supported)" -ForegroundColor White
    Write-Host "  2. Android Mobile (supported)" -ForegroundColor White
    Write-Host "  0. Exit" -ForegroundColor White
    Write-Host ""
    Write-Color "  Note: iOS is not wired into this script yet." "Yellow"
    $selection = Read-Host "Select [1]"
    switch ($selection) {
        "1" { $Dev = $false; $Target = "windows" }
        "2" { $Dev = $false; $Target = "android" }
        "0" { exit 0 }
        default { $Dev = $false; $Target = "windows" }
    }
}

# Clean
function Clean-BuildArtifacts {
    Write-Step "Cleaning build artifacts..."
    if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force; Write-OK "Cleaned dist" }
    if (Test-Path "src-tauri/target") { Remove-Item -Path "src-tauri/target" -Recurse -Force; Write-OK "Cleaned src-tauri/target" }
    if (Test-Path "src-tauri/gen") { Remove-Item -Path "src-tauri/gen" -Recurse -Force; Write-OK "Cleaned src-tauri/gen" }
    Write-OK "Cleanup complete"
}

if ($Clean) { Clean-BuildArtifacts }

# Detect package manager (pnpm only for this template)
$PackageManager = "pnpm"
$PmArgs = @()

# Build Windows Desktop
function Build-Windows {
    param([bool]$IsDevMode)
    Write-Step "Building Windows Desktop..."
    try {
        if ($IsDevMode) {
            & $PackageManager @($PmArgs + "tauri" + "dev")
        }
        else {
            & $PackageManager @($PmArgs + "tauri" + "build")
        }
        if ($LASTEXITCODE -eq 0) {
            Write-OK "Windows Desktop build successful!"
            Write-Host ""
            Write-Color "Installer:" "Yellow"
            Write-Host "  src-tauri\target\release\bundle\nsis\*.exe"
        }
        else { Write-Err "Windows build failed"; exit 1 }
    }
    catch { Write-Err "Build error: $_"; exit 1 }
}

# Arch to Tauri --target short name mapping
$TargetNameMap = @{
    "arm64"  = "aarch64"
    "armv7"  = "armv7"
    "x86_64" = "x86_64"
    "x86"    = "i686"
}

# Build Android
function Build-Android {
    param(
        [bool]$IsDevMode,
        [bool]$IsDebugBuild = $false
    )
    Write-Step "Building Android Mobile..."
    try {
        if (-not (Test-Path "src-tauri/gen/android")) {
            Write-Host "First build, initializing Android project..."
            & $PackageManager @($PmArgs + "tauri" + "android" + "init")
        }

        $TauriArgs = @("tauri", "android")

        if ($IsDevMode) {
            $TauriArgs += "dev"
            $TauriArgs += @("--host", "127.0.0.1")
        }
        else {
            $TauriArgs += @("build", "--apk")
            if ($IsDebugBuild) {
                $TauriArgs += "--debug"
            }
        }

        if (-not $IsDevMode -and $Arch -and $Arch -ne "all") {
            $TargetName = $TargetNameMap[$Arch]
            $TauriArgs += @("--target", $TargetName)
            Write-Color "  Target: $TargetName" "Yellow"
        }
        elseif ($IsDevMode -and $Arch -and $Arch -ne "all") {
            $TargetName = $TargetNameMap[$Arch]
            Write-Color "  Dev mode ignores ABI filter, using connected device architecture instead." "Yellow"
            Write-Color "  Requested target: $TargetName" "DarkYellow"
        }

        if ($IsDevMode) {
            Write-Step "Configuring Android dev networking..."
            & adb reverse tcp:1420 tcp:1420 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Err "Failed to create adb reverse rule for port 1420"
                Write-Host "Make sure the device is connected with USB debugging enabled: adb devices" -ForegroundColor Yellow
                exit 1
            }
            & adb reverse tcp:1421 tcp:1421 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Err "Failed to create adb reverse rule for port 1421"
                Write-Host "Make sure the device is connected with USB debugging enabled: adb devices" -ForegroundColor Yellow
                exit 1
            }

            Write-Color "  adb reverse tcp:1420 tcp:1420" "Yellow"
            Write-Color "  adb reverse tcp:1421 tcp:1421" "Yellow"
            Write-Color "  Mobile debug server will use 127.0.0.1 through USB reverse tunneling." "DarkYellow"
            Write-Color "  Open DevTools from desktop Chrome: chrome://inspect/#devices" "DarkYellow"
        }

        & $PackageManager @($PmArgs + $TauriArgs)

        if ($LASTEXITCODE -eq 0) {
            Write-OK "Android Mobile build successful!"
            Write-Host ""
            Write-Color "APK Location:" "Yellow"
            Write-Host "  src-tauri\gen\android\app\build\outputs\apk\"
            Write-Host ""
            if (-not $IsDevMode) {
                $buildVariant = if ($IsDebugBuild) { "debug" } else { "release" }
                $apkRoot = Join-Path $ScriptRoot "src-tauri\gen\android\app\build\outputs\apk"
                $apkFiles = @()
                if (Test-Path $apkRoot) {
                    $apkFiles = Get-ChildItem -Path $apkRoot -Recurse -Filter "*.apk" |
                        Where-Object { $_.FullName -match "\\$buildVariant\\" } |
                        Sort-Object LastWriteTime -Descending
                }

                if ($apkFiles.Count -gt 0) {
                    Write-Color "APK File(s):" "Yellow"
                    $apkFiles | ForEach-Object {
                        $relative = Resolve-Path -Relative $_.FullName
                        Write-Host "  $relative"
                    }
                    Write-Host ""
                    Write-Color "Install:" "Yellow"
                    $installPath = Resolve-Path -Relative $apkFiles[0].FullName
                    Write-Host "  adb install -r $installPath"
                }
                else {
                    Write-Color "APK File:" "Yellow"
                    Write-Host "  No APK file found under src-tauri\gen\android\app\build\outputs\apk\"
                }
            }
        }
        else { Write-Err "Android build failed"; exit 1 }
    }
    catch { Write-Err "Build error: $_"; exit 1 }
}

# Execute
switch ($Target) {
    "windows" { Build-Windows -IsDevMode $Dev }
    "android" { Build-Android -IsDevMode $Dev -IsDebugBuild $AndroidDebugBuild }
}
