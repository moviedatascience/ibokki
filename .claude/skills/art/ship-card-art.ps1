# Ships web-sized card illustrations for the client.
# The filed masters (apps/client/public/art/cards/<defId>.png, 1024x752, ~1.2 MB) stay the
# source of truth; the client loads art/cards/web/<defId>.jpg instead. A board card is
# 92 world units wide (~300 device px at the largest world scale on a 2x display), so a
# 512x376 JPEG is ample and ~15x smaller. Full-res masters on every board sprite made the
# two-tab online e2e miss its deadline on CI's GPU-less runners (2026-10-11).
#
# Every defId in manifest.json gets a derivative; stale ones are rebuilt when the master
# is newer. Run after filing any winner (the vitest guard fails on a missing derivative).
#
# Usage: powershell -File ship-card-art.ps1 [-Force]

param([switch]$Force)

Add-Type -AssemblyName System.Drawing

$cards = Join-Path $PSScriptRoot "..\..\..\apps\client\public\art\cards" | Resolve-Path
$web = Join-Path $cards "web"
New-Item -ItemType Directory -Force $web | Out-Null

$W = 512
$H = 376
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

$ids = Get-Content (Join-Path $cards "manifest.json") -Raw | ConvertFrom-Json
$built = 0
foreach ($id in $ids) {
    $src = Join-Path $cards "$id.png"
    $dst = Join-Path $web "$id.jpg"
    if (-not (Test-Path $src)) { Write-Warning "manifest lists $id but $src is missing"; continue }
    if (-not $Force -and (Test-Path $dst) -and ((Get-Item $dst).LastWriteTime -ge (Get-Item $src).LastWriteTime)) { continue }

    $img = [System.Drawing.Image]::FromFile($src)
    try {
        $bmp = New-Object System.Drawing.Bitmap($W, $H)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        # Cover-fit: masters are 1024x752 already, so this is a straight scale; other
        # aspect ratios are center-cropped rather than letterboxed.
        $scale = [Math]::Max($W / $img.Width, $H / $img.Height)
        $sw = $W / $scale
        $sh = $H / $scale
        $srcRect = New-Object System.Drawing.RectangleF((($img.Width - $sw) / 2), (($img.Height - $sh) / 2), $sw, $sh)
        $g.DrawImage($img, (New-Object System.Drawing.RectangleF(0, 0, $W, $H)), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
        $bmp.Save($dst, $jpeg, $params)
        $bmp.Dispose()
        $built++
    } finally {
        $img.Dispose()
    }
}

$total = (Get-ChildItem $web -Filter *.jpg | Measure-Object -Property Length -Sum)
Write-Output ("Built {0} card-art derivatives; {1} in web/ ({2:N1} MB)" -f $built, $total.Count, ($total.Sum / 1MB))
