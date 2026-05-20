# Desktop Pet - start/stop script
# Usage:
#   .\pet.ps1          start (default)
#   .\pet.ps1 start    start
#   .\pet.ps1 stop     stop
#   .\pet.ps1 restart  restart
param([string]$action = "start")

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Ensure Node.js is in PATH
$nodePath = "D:\Program Files\nodejs"
if ($env:Path -notlike "*$nodePath*") {
  $env:Path = "$nodePath;$env:Path"
}

function Start-Pet {
  Write-Host "[PET] Starting desktop pet..." -ForegroundColor Cyan

  # IMPORTANT: Must completely REMOVE the env var, not just set it to empty.
  # If ELECTRON_RUN_AS_NODE is set to ANY value (including empty string),
  # Electron runs in pure Node mode -- no window, no cat.
  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

  # Launch electron directly (not via npm start, which re-sets the env var)
  $electronCmd = Join-Path $scriptDir "node_modules\.bin\electron.cmd"
  $proc = Start-Process -FilePath $electronCmd `
    -ArgumentList "." `
    -WorkingDirectory $scriptDir `
    -WindowStyle Hidden `
    -PassThru

  Write-Host "[PET] Desktop pet started (PID: $($proc.Id))" -ForegroundColor Green
  Write-Host "       Right-click the tray icon to open settings" -ForegroundColor Gray
}

function Stop-Pet {
  Write-Host "[PET] Looking for desktop pet processes..." -ForegroundColor Cyan

  $found = $false
  Get-Process -Name "electron" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
      $cmd = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
      if ($cmd -match "desktop-pet") {
        Write-Host "       Killing PID: $($_.Id)..." -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force
        $found = $true
      }
    } catch {}
  }

  if ($found) {
    Write-Host "[PET] Desktop pet stopped" -ForegroundColor Green
  } else {
    Write-Host "[PET] No running desktop pet process found" -ForegroundColor Gray
  }
}

switch ($action) {
  "start"  { Start-Pet }
  "run"    { Start-Pet }
  "stop"   { Stop-Pet }
  "kill"   { Stop-Pet }
  "restart" {
    Stop-Pet
    Start-Sleep -Seconds 1
    Start-Pet
  }
  default {
    Write-Host "[PET] Unknown argument: $action`nUsage: .\pet.ps1 [start|stop|restart]" -ForegroundColor Red
  }
}



