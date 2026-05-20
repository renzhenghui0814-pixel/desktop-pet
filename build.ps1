# Desktop Pet - Build script
# Packages the app into Windows exe (installer + portable)
#
# Usage:
#   .\build.ps1              Full build (NSIS installer + portable)
#   .\build.ps1 -Quick       Quick build (portable only, for testing)
#   .\build.ps1 -Clean       Clean dist only
param([switch]$Quick, [switch]$Clean)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Ensure Node.js is in PATH
$nodePath = "D:\Program Files\nodejs"
if ((Test-Path $nodePath) -and ($env:Path -notlike "*$nodePath*")) {
  $env:Path = "$nodePath;$env:Path"
}

# Clean
Write-Host "[BUILD] Cleaning dist/..." -ForegroundColor Cyan
Remove-Item -Recurse -Force "$scriptDir\dist" -ErrorAction SilentlyContinue

if ($Clean) {
  Write-Host "[BUILD] Clean done." -ForegroundColor Green
  return
}

# Set Electron mirror for faster download in China
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
Write-Host "[BUILD] Mirror: npmmirror.com" -ForegroundColor Gray

# Determine electron-builder command and arguments
$builderCmd = Join-Path $scriptDir "node_modules\.bin\electron-builder.cmd"
$npxCmd = Join-Path $nodePath "npx.cmd"

if (Test-Path $builderCmd) {
  $builderPath = $builderCmd
  $builderArgs = "$target --x64"
} else {
  $builderPath = $npxCmd
  $builderArgs = "electron-builder $target --x64"
}

if ($Quick) {
  Write-Host "[BUILD] Quick mode: portable only..." -ForegroundColor Yellow
  $target = "--win portable"
} else {
  Write-Host "[BUILD] Full build: NSIS + portable..." -ForegroundColor Yellow
  $target = "--win"
}

Write-Host "[BUILD] Running electron-builder..." -ForegroundColor Cyan
Write-Host ""

# Run build (show output in real-time)
$proc = Start-Process -FilePath $builderPath `
  -ArgumentList $builderArgs `
  -WorkingDirectory $scriptDir `
  -NoNewWindow `
  -Wait `
  -PassThru

if ($proc.ExitCode -ne 0) {
  Write-Host ""
  Write-Host "[BUILD] Failed with exit code: $($proc.ExitCode)" -ForegroundColor Red
  exit $proc.ExitCode
}

Write-Host ""
Write-Host "[BUILD] Build complete!" -ForegroundColor Green
Write-Host ""

# Show output files
$distFiles = Get-ChildItem "$scriptDir\dist" -Recurse -File | Where-Object { $_.Extension -in ".exe", ".msi" }
foreach ($f in $distFiles) {
  $sizeMB = [math]::Round($f.Length / 1MB, 1)
  Write-Host "  $($f.Name) ($sizeMB MB)" -ForegroundColor White
}

Write-Host ""
Write-Host "  Output: $scriptDir\dist\" -ForegroundColor Gray


