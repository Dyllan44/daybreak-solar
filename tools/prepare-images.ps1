$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$site = Split-Path -Parent $PSScriptRoot
$source = Join-Path (Split-Path -Parent $site) 'assets/website'
$destination = Join-Path $site 'images'
New-Item -ItemType Directory -Force -Path $destination | Out-Null

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object MimeType -eq 'image/jpeg'
$settings = [System.Drawing.Imaging.EncoderParameters]::new(1)
$settings.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
    [System.Drawing.Imaging.Encoder]::Quality, [long]86
)

try {
    foreach ($file in Get-ChildItem -LiteralPath $source -Filter '*.png' -File) {
        $original = [System.Drawing.Image]::FromFile($file.FullName)
        try {
            $widths = switch ($file.BaseName) {
                'hero-rooftop-solar' { 680; 1120; 1672 }
                'home-energy-cutaway' { 680; 1320 }
                default { 480; 960 }
            }
            foreach ($width in $widths) {
                $height = [int][Math]::Round($original.Height * $width / $original.Width)
                $image = [System.Drawing.Bitmap]::new($width, $height)
                $canvas = [System.Drawing.Graphics]::FromImage($image)
                try {
                    $canvas.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $canvas.DrawImage($original, 0, 0, $width, $height)
                    $image.Save((Join-Path $destination "$($file.BaseName)-$width.jpg"), $jpeg, $settings)
                } finally {
                    $canvas.Dispose()
                    $image.Dispose()
                }
            }
        } finally {
            $original.Dispose()
        }
    }
} finally {
    $settings.Dispose()
}
