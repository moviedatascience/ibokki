# Builds an HTML contact sheet from a folder of generated art options.
# Previews are downscaled + JPEG-encoded as data URIs so the file stays small
# enough to publish as an Artifact; originals are untouched.
#
# Usage:
#   powershell -File build-gallery.ps1 -InputDir art\review\fireball -Output gallery.html -Title "Fireball — options"
#
# Expects PNG filenames like: <asset>__opt1__seed123456.png
# (double-underscore-separated tokens become the caption lines)

param(
    [Parameter(Mandatory = $true)][string]$InputDir,
    [Parameter(Mandatory = $true)][string]$Output,
    [string]$Title = "Art options",
    [int]$MaxWidth = 640,
    [int]$JpegQuality = 85
)

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path $InputDir -Filter *.png -File | Sort-Object Name
if (-not $files) { Write-Error "No PNGs in $InputDir"; exit 1 }

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [long]$JpegQuality)

$cards = New-Object System.Collections.ArrayList
foreach ($f in $files) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    try {
        $scale = [Math]::Min(1.0, $MaxWidth / $img.Width)
        $w = [int]($img.Width * $scale)
        $h = [int]($img.Height * $scale)
        $thumb = New-Object System.Drawing.Bitmap($w, $h)
        $g = [System.Drawing.Graphics]::FromImage($thumb)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $w, $h)
        $g.Dispose()
        $ms = New-Object System.IO.MemoryStream
        $thumb.Save($ms, $jpegCodec, $encParams)
        $thumb.Dispose()
        $b64 = [Convert]::ToBase64String($ms.ToArray())
        $ms.Dispose()
        # Board-crop preview: center crop at the 92:74 aspect of the in-game art window,
        # rendered small so silhouette legibility is judged at true display size (style bible §15).
        $aspect = 92.0 / 74.0
        if (($img.Width / [double]$img.Height) -gt $aspect) {
            $cH = $img.Height; $cW = [int]($img.Height * $aspect)
        } else {
            $cW = $img.Width; $cH = [int]($img.Width / $aspect)
        }
        $cX = [int](($img.Width - $cW) / 2); $cY = [int](($img.Height - $cH) / 2)
        $cropBmp = New-Object System.Drawing.Bitmap(184, 148)
        $cg = [System.Drawing.Graphics]::FromImage($cropBmp)
        $cg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $cg.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, 184, 148)), (New-Object System.Drawing.Rectangle($cX, $cY, $cW, $cH)), [System.Drawing.GraphicsUnit]::Pixel)
        $cg.Dispose()
        $cms = New-Object System.IO.MemoryStream
        $cropBmp.Save($cms, $jpegCodec, $encParams)
        $cropBmp.Dispose()
        $cb64 = [Convert]::ToBase64String($cms.ToArray())
        $cms.Dispose()

        $tokens = $f.BaseName -split '__'
        $chips = ($tokens | Select-Object -Skip 1 | ForEach-Object { '<span class="chip">' + $_ + '</span>' }) -join ''
        $caption = '<span class="cap-name">' + $tokens[0] + '</span>' + $chips
        $boardStrip = '<div class="board"><img src="data:image/jpeg;base64,' + $cb64 + '" alt="board crop"/><span>board read at 92&times;74</span></div>'
        $card = '<figure><img src="data:image/jpeg;base64,' + $b64 + '" alt="' + $f.BaseName + '"/>' + $boardStrip + '<figcaption>' + $caption + '</figcaption></figure>'
        [void]$cards.Add($card)
    } finally {
        $img.Dispose()
    }
}

$style = @'
<style>
  :root {
    --bg: #f2f2ec; --surface: #fbfbf7; --ink: #23281f; --muted: #6d7263;
    --line: #d8d9cd; --accent: #8a6d1f; --chip-bg: #ece9dc;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0e1411; --surface: #17201a; --ink: #e8e6df; --muted: #9aa192;
      --line: #2a352d; --accent: #ffd36b; --chip-bg: #222c25;
    }
  }
  :root[data-theme="dark"] {
    --bg: #0e1411; --surface: #17201a; --ink: #e8e6df; --muted: #9aa192;
    --line: #2a352d; --accent: #ffd36b; --chip-bg: #222c25;
  }
  :root[data-theme="light"] {
    --bg: #f2f2ec; --surface: #fbfbf7; --ink: #23281f; --muted: #6d7263;
    --line: #d8d9cd; --accent: #8a6d1f; --chip-bg: #ece9dc;
  }
  body { font-family: system-ui, sans-serif; margin: 0; background: var(--bg); color: var(--ink); }
  main { max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem 3rem; }
  .eyebrow { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); margin: 0 0 .35rem; }
  h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 1.5rem; text-wrap: balance; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
  figure { margin: 0; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  figure img { display: block; width: 100%; height: auto; }
  .board { display: flex; align-items: center; gap: .6rem; padding: .6rem .8rem 0; }
  .board img { width: 92px; height: 74px; border: 1px solid var(--line); border-radius: 3px; }
  .board span { font-size: .7rem; color: var(--muted); font-family: ui-monospace, Consolas, monospace; }
  figcaption { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; padding: .6rem .8rem; font-size: .8rem; font-family: ui-monospace, Consolas, monospace; }
  .cap-name { color: var(--muted); margin-right: auto; }
  .chip { background: var(--chip-bg); border: 1px solid var(--line); border-radius: 999px; padding: .1rem .55rem; font-variant-numeric: tabular-nums; }
</style>
'@

$html = '<title>' + $Title + '</title>' + $style + '<main><p class="eyebrow">Ibokki art review</p><h1>' + $Title + '</h1><div class="grid">' + ($cards -join "`n") + '</div></main>'
$outDir = Split-Path -Parent ([System.IO.Path]::GetFullPath($Output))
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Force $outDir | Out-Null }
[System.IO.File]::WriteAllText($Output, $html, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ("Wrote {0} ({1:N0} KB, {2} images)" -f $Output, ((Get-Item $Output).Length / 1KB), $cards.Count)
