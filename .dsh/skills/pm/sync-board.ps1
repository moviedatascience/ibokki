# sync-board.ps1 — reconcile the GitHub Projects kanban (project #2, owner moviedatascience)
# against the ibokki codebase. REPORT ONLY — never mutates GitHub or the repo.
#
# Usage (from the repo root, gh authenticated with `project` + `repo` scopes):
#   pwsh .dsh/skills/pm/sync-board.ps1            # report only
#   pwsh .dsh/skills/pm/sync-board.ps1 -Propose   # also print proposed gh commands (still not run)
#
# Output: a plain-text report on stdout + a JSON snapshot at .dsh/notes/board-sync.json
# (gitignored scratch) so a replacement PM can diff against the previous run.

param(
    [string]$Owner = "moviedatascience",
    [int]$ProjectNumber = 2,
    [string]$Repo = "moviedatascience/ibokki",
    [string]$Milestone = "1.0",
    [switch]$Propose
)
$ErrorActionPreference = "Stop"

function Invoke-GhJson([string[]]$GhArgs) {
    # Capture stdout only; stderr (warnings) is discarded so JSON parsing stays clean.
    $out = & gh @GhArgs 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw ("gh " + ($GhArgs -join " ") + " failed (exit " + $LASTEXITCODE + ")")
    }
    ($out -join "`n") | ConvertFrom-Json
}

# --- preflight ---
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw "gh CLI not on PATH" }

Write-Host "== Board: project #$ProjectNumber (owner $Owner) =="

# --- project ---
$projects = Invoke-GhJson @("project", "list", "--owner", $Owner, "--format", "json")
$proj = $projects | Where-Object { $_.number -eq $ProjectNumber }
if (-not $proj) { throw "project #$ProjectNumber not found under owner $Owner" }
Write-Host ("Project: {0}  (number {1})" -f $proj.title, $proj.number)

# --- fields (find Status + Priority by name, case-insensitive) ---
$fields = Invoke-GhJson @("project", "field-list", "$ProjectNumber", "--owner", $Owner, "--format", "json")
$statusField = $fields | Where-Object { $_.name -match "(?i)status" } | Select-Object -First 1
$prioField   = $fields | Where-Object { $_.name -match "(?i)priority" } | Select-Object -First 1

# --- items ---
$items = @(Invoke-GhJson @("project", "item-list", "$ProjectNumber", "--owner", $Owner, "--format", "json", "--limit", "200"))
Write-Host ("Items on board: {0}" -f $items.Count)

$byStatus = @{}
$linked = @{}   # issue/PR number -> true, from item content
foreach ($it in $items) {
    # Status: find a property whose name equals the status field's name (case-insensitive)
    $s = $null
    if ($statusField) {
        foreach ($p in $it.PSObject.Properties) {
            if ($p.Name -ieq $statusField.name) { $s = $p.Value; break }
        }
    }
    if ([string]::IsNullOrWhiteSpace([string]$s)) { $s = "(unset)" }
    if (-not $byStatus.ContainsKey($s)) { $byStatus[$s] = 0 }
    $byStatus[$s]++

    $content = $it.content
    if ($content -and $content.number) { $linked[[int]$content.number] = $true }
}

Write-Host ""
Write-Host "Status distribution:"
$byStatus.GetEnumerator() | Sort-Object Name | ForEach-Object { Write-Host ("  {0,-24} {1}" -f $_.Key, $_.Value) }

# --- issues in milestone ---
Write-Host ""
Write-Host "== Milestone '$Milestone' issues (repo $Repo) =="
$issues = @(Invoke-GhJson @("issue", "list", "--repo", $Repo, "--milestone", $Milestone, "--state", "all", "--limit", "300", "--json", "number,title,state,labels,assignees,updatedAt"))
Write-Host ("Issues in milestone: {0}" -f $issues.Count)

$openNotOnBoard = @()
foreach ($iss in $issues) {
    if ($iss.state -eq "open" -and -not $linked.ContainsKey([int]$iss.number)) {
        $openNotOnBoard += $iss
    }
}
Write-Host ("Open milestone issues NOT on the board: {0}" -f $openNotOnBoard.Count)
foreach ($iss in $openNotOnBoard) {
    Write-Host ("  - #{0} {1}" -f $iss.number, $iss.title)
}

# --- proposal mode ---
if ($Propose) {
    Write-Host ""
    Write-Host "== Proposed changes (NOT applied — review before running) =="
    foreach ($iss in $openNotOnBoard) {
        $title = "#{0} {1}" -f $iss.number, $iss.title
        Write-Host ("gh project item-create {0} --owner {1} --title '{2}'" -f $ProjectNumber, $Owner, $title)
    }
    Write-Host "# then set Status + Priority fields per P0/P1/P2; get the human's sign-off first."
}

# --- snapshot ---
$notes = Join-Path $PSScriptRoot "..\..\notes"
New-Item -ItemType Directory -Force -Path $notes | Out-Null
$snap = [ordered]@{
    generatedAt    = (Get-Date).ToString("o")
    project        = $proj.title
    itemCount      = $items.Count
    status         = $byStatus
    milestoneOpen  = @($issues | Where-Object { $_.state -eq "open" }).Count
    openNotOnBoard = @($openNotOnBoard | ForEach-Object { "#$($_.number) $($_.title)" })
}
$snap | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $notes "board-sync.json") -Encoding UTF8
Write-Host ""
Write-Host "Snapshot saved to .dsh/notes/board-sync.json"
