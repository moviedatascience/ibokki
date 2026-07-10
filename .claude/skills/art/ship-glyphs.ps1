# Ships the approved glyph set from art/glyphs/ into the client's public assets.
# - Tintable glyphs: fill="currentColor" -> fill="#ffffff" (Pixi tint is multiplicative,
#   so tintable textures must be white; DOM usage tints via CSS mask, which only reads alpha).
# - cardback-small.svg gains width/height=184x256 (2x intrinsic raster for Pixi) and the
#   corner radius is matched to the CardVisual roundRect (9 world units).
# - cardback.svg (master) and favicon.svg copy as-is.
#
# Usage: powershell -File ship-glyphs.ps1

$src = Join-Path $PSScriptRoot "..\..\..\art\glyphs" | Resolve-Path
$destArt = Join-Path $PSScriptRoot "..\..\..\apps\client\public\art"
$destIcons = Join-Path $destArt "icons"
New-Item -ItemType Directory -Force $destIcons | Out-Null

$tintable = "eye", "bow", "key", "v", "s", "m", "burn", "ward", "prophecy", "hp", "cancelled", "item", "gambit", "seal"
foreach ($n in $tintable) {
    $t = [System.IO.File]::ReadAllText((Join-Path $src "$n.svg"), [System.Text.Encoding]::UTF8)
    $t = $t.Replace('fill="currentColor"', 'fill="#ffffff"')
    [System.IO.File]::WriteAllText((Join-Path $destIcons "$n.svg"), $t, (New-Object System.Text.UTF8Encoding($false)))
}

$back = [System.IO.File]::ReadAllText((Join-Path $src "cardback-small.svg"), [System.Text.Encoding]::UTF8)
$back = $back.Replace('viewBox="0 0 92 128">', 'viewBox="0 0 92 128" width="184" height="256">')
$back = $back.Replace('<rect width="92" height="128" rx="6"', '<rect width="92" height="128" rx="9"')
[System.IO.File]::WriteAllText((Join-Path $destArt "cardback-small.svg"), $back, (New-Object System.Text.UTF8Encoding($false)))

Copy-Item (Join-Path $src "cardback.svg") (Join-Path $destArt "cardback.svg") -Force
Copy-Item (Join-Path $src "favicon.svg") (Join-Path $destArt "favicon.svg") -Force

Write-Output ("Shipped {0} tintable icons + cardback-small + cardback + favicon to {1}" -f $tintable.Count, $destArt)
