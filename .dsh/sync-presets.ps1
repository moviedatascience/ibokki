# Sync repo-owned agent presets into $DSH_HOME/.agent-presets (the live roster root).
# DSH discovers presets there immediately (no restart needed). Run after editing
# .dsh/agent-presets/<id>/ in the repo, and on a fresh machine after cloning.
$ErrorActionPreference = 'Stop'

$homeRoot = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$src = Join-Path $PSScriptRoot 'agent-presets'
$dst = Join-Path $homeRoot '.agent-presets'

if (-not (Test-Path $src)) { throw "no source presets at $src" }
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$copied = @()
Get-ChildItem -Directory $src | ForEach-Object {
    $target = Join-Path $dst $_.Name
    Copy-Item -Recurse -Force $_.FullName $target
    $copied += $_.Name
}

Write-Host "Synced presets: $($copied -join ', ')"
Write-Host "Installed to:   $dst"
Write-Host ""
Write-Host "Pick the preset in the GUI session picker for new sessions"
Write-Host "(or set 'agent-presets:' -> 'default: lead' in $homeRoot\settings.yaml)."