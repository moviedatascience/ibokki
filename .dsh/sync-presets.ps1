# Sync repo-owned agent presets into $DSH_HOME/.agent-presets (the live roster root).
# DSH discovers presets there immediately (no restart needed). Run after editing
# .dsh/agent-presets/<id>/ in the repo, and on a fresh machine after cloning.
#
# Idempotent: prunes destination presets that no longer exist in the repo, and
# remove-then-copies each source preset so a re-run can never leave stale or
# nested debris behind.
$ErrorActionPreference = 'Stop'

$homeRoot = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$src = Join-Path $PSScriptRoot 'agent-presets'
$dst = Join-Path $homeRoot '.agent-presets'

if (-not (Test-Path $src)) { throw "no source presets at $src" }
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$srcDirs = @(Get-ChildItem -Directory $src)
$srcNames = @($srcDirs | ForEach-Object { $_.Name })

# Prune stale destination presets not present in the repo (this also clears the
# nested `ic/ic` / `lead/lead` debris older sync runs produced).
$pruned = @()
Get-ChildItem -Directory $dst -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Name -notin $srcNames) {
        Remove-Item -Recurse -Force $_.FullName
        $pruned += $_.Name
    }
}

$copied = @()
foreach ($dir in $srcDirs) {
    $target = Join-Path $dst $dir.Name
    # Copy-Item -Recurse into an existing directory NESTS the source inside the
    # target instead of overwriting it. Delete the target first so each preset is
    # replaced wholesale (idempotent, self-healing).
    if (Test-Path $target) { Remove-Item -Recurse -Force $target }
    Copy-Item -Recurse -Force $dir.FullName $target
    $copied += $dir.Name
}

Write-Host "Synced presets: $($copied -join ', ')"
if ($pruned.Count) { Write-Host "Pruned stale:   $($pruned -join ', ')" }
Write-Host "Installed to:   $dst"
Write-Host ""
Write-Host "Pick the preset in the GUI session picker for new sessions"
Write-Host "(or set 'agent-presets:' -> 'default: lead' in $homeRoot\settings.yaml)."
