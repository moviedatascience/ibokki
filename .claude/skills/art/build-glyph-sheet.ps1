# Rebuilds the glyph review sheet from art/glyphs/*.svg.
# Each SVG's inner content is inlined as a <symbol>; the sheet shows 64/24/11 px
# in ink and token tint on parchment and felt (style bible §10/§15 review sizes).
#
# Usage: powershell -File build-glyph-sheet.ps1 -Output <path\glyph-sheet.html> [-Title "..."]

param(
    [Parameter(Mandatory = $true)][string]$Output,
    [string]$Title = "Invocation crests &amp; component pips",
    [string]$Eyebrow = "Ibokki glyphs",
    [string]$ManifestPath = ""   # optional JSON: [{id,file,title,sub,tintL,tintD}, ...] overrides the default set
)

$glyphDir = Join-Path $PSScriptRoot "..\..\..\art\glyphs" | Resolve-Path

# Display metadata per glyph file. tintL = print-pigment tint (parchment), tintD = UI token tint (felt).
$meta = @(
    @{ id = "eye";  file = "eye.svg";  title = "The Eye";              sub = "Divination crest &#8212; tint #a070e0"; tintL = "#7d5ba6"; tintD = "#a070e0" },
    @{ id = "bow";  file = "bow.svg";  title = "The Bow";              sub = "Evocation crest &#8212; tint #e0533d";  tintL = "#c9472e"; tintD = "#e0533d" },
    @{ id = "key";  file = "key.svg";  title = "The Key";              sub = "Abjuration crest &#8212; tint #4a90e2"; tintL = "#3e6fa3"; tintD = "#4a90e2" },
    @{ id = "v";    file = "v.svg";    title = "V &#8212; the spoken rune";   sub = "Verbal pip &#8212; tint #f0b352";   tintL = "#c99a3f"; tintD = "#f0b352" },
    @{ id = "s";    file = "s.svg";    title = "S &#8212; the warding hand";  sub = "Somatic pip &#8212; tint #5bc8c0";  tintL = "#4f9a90"; tintD = "#5bc8c0" },
    @{ id = "m";    file = "m.svg";    title = "M &#8212; the reagent";       sub = "Material pip &#8212; tint #b98cf0"; tintL = "#8f6bb5"; tintD = "#b98cf0" },
    @{ id = "burn";      file = "burn.svg";      title = "Burn";      sub = "status marker &#8212; living flame";              tintL = "#c9472e"; tintD = "#e0533d" },
    @{ id = "ward";      file = "ward.svg";      title = "Ward";      sub = "status marker &#8212; shield with keystone";      tintL = "#3e6fa3"; tintD = "#4a90e2" },
    @{ id = "prophecy";  file = "prophecy.svg";  title = "Prophecy";  sub = "status marker &#8212; hourglass nearly run out";  tintL = "#7d5ba6"; tintD = "#a070e0" },
    @{ id = "hp";        file = "hp.svg";        title = "HP";        sub = "status marker &#8212; woodcut heart";             tintL = "#c9472e"; tintD = "#e0533d" },
    @{ id = "cancelled"; file = "cancelled.svg"; title = "Cancelled"; sub = "status marker &#8212; stamp X";                   tintL = "#c9472e"; tintD = "#e0533d" },
    @{ id = "item";   file = "item.svg";   title = "Item";   sub = "trainer type &#8212; strapped satchel"; tintL = "#c99a3f"; tintD = "#caa46a" },
    @{ id = "gambit"; file = "gambit.svg"; title = "Gambit"; sub = "trainer type &#8212; thrown dice";      tintL = "#c99a3f"; tintD = "#caa46a" }
)

if ($ManifestPath) {
    $meta = [System.IO.File]::ReadAllText($ManifestPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
}

$defs = New-Object System.Text.StringBuilder
$sections = New-Object System.Text.StringBuilder

function Cells([string]$id, [string]$c64, [string]$lab, [string]$color) {
    $s = ""
    foreach ($sz in 64, 24, 11) {
        $l = if ($sz -eq 64) { "64 $lab" } else { "$sz" }
        $s += '<div class="cell"><svg width="' + $sz + '" height="' + $sz + '" style="color:' + $color + '"><use href="#g-' + $id + '"/></svg><b>' + $l + '</b></div>'
    }
    return $s
}

foreach ($g in $meta) {
    $path = Join-Path $glyphDir $g.file
    if (-not (Test-Path $path)) { Write-Warning "missing $($g.file), skipping"; continue }
    $raw = [System.IO.File]::ReadAllText($path)
    if ($raw -notmatch '(?s)<svg[^>]*>(.*)</svg>') { Write-Warning "no svg content in $($g.file)"; continue }
    $inner = $Matches[1].Trim()
    [void]$defs.AppendLine(('<symbol id="g-{0}" viewBox="0 0 100 100" fill="currentColor">{1}</symbol>' -f $g.id, $inner))

    $sec = '<section><h2>' + $g.title + '<small>' + $g.sub + '</small></h2><div class="grounds">'
    $sec += '<div class="ground parchment">' + (Cells $g.id 64 "ink" "#2b2320") + '<div class="gap"></div>' + (Cells $g.id 64 "tint" $g.tintL) + '</div>'
    $sec += '<div class="ground felt">' + (Cells $g.id 64 "bone" "#e8e6df") + '<div class="gap"></div>' + (Cells $g.id 64 "tint" $g.tintD) + '</div>'
    $sec += '</div></section>'
    [void]$sections.AppendLine($sec)
}

$template = @'
<title>Ibokki glyphs</title>
<style>
  :root { --bg: #f2f2ec; --ink: #23281f; --muted: #6d7263; --line: #d8d9cd; --accent: #8a6d1f; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0e1411; --ink: #e8e6df; --muted: #9aa192; --line: #2a352d; --accent: #ffd36b; } }
  :root[data-theme="dark"] { --bg: #0e1411; --ink: #e8e6df; --muted: #9aa192; --line: #2a352d; --accent: #ffd36b; }
  :root[data-theme="light"] { --bg: #f2f2ec; --ink: #23281f; --muted: #6d7263; --line: #d8d9cd; --accent: #8a6d1f; }
  body { font-family: system-ui, sans-serif; margin: 0; background: var(--bg); color: var(--ink); }
  main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }
  .eyebrow { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin: 0 0 .35rem; }
  h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 .4rem; text-wrap: balance; }
  .note { color: var(--muted); font-size: .85rem; margin: 0 0 1.8rem; }
  section { margin-bottom: 2rem; }
  h2 { font-size: 1rem; font-weight: 600; margin: 0 0 .6rem; }
  h2 small { color: var(--muted); font-weight: 400; margin-left: .5rem; }
  .grounds { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .grounds { grid-template-columns: 1fr; } }
  .ground { border: 1px solid var(--line); border-radius: 10px; padding: 1rem 1.1rem; display: flex; align-items: flex-end; gap: 1.05rem; flex-wrap: wrap; }
  .ground.parchment { background: #ddcfae; }
  .ground.felt { background: #121a15; }
  .cell { display: flex; flex-direction: column; align-items: center; gap: .35rem; }
  .cell svg { display: block; }
  .cell b { font-size: .62rem; font-weight: 400; font-family: ui-monospace, Consolas, monospace; }
  .ground.parchment .cell b { color: #5a4a3a; }
  .ground.felt .cell b { color: #9aa192; }
  .gap { width: .4rem; }
</style>
<main>
<p class="eyebrow">{EYEBROW}</p>
<h1>{TITLE}</h1>
<p class="note">Hand-authored woodcut SVGs (not generated). Each at 64 / 24 / 11 px, in ink and in its token tint, on parchment and on felt. Judge the 11 px column hardest &#8212; that's where pips live.</p>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
{DEFS}
</defs></svg>
{SECTIONS}
</main>
'@

$html = $template.Replace('{EYEBROW}', $Eyebrow).Replace('{TITLE}', $Title).Replace('{DEFS}', $defs.ToString()).Replace('{SECTIONS}', $sections.ToString())
$outDir = Split-Path -Parent ([System.IO.Path]::GetFullPath($Output))
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Force $outDir | Out-Null }
[System.IO.File]::WriteAllText($Output, $html, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ("Wrote {0} ({1} glyphs)" -f $Output, $meta.Count)
