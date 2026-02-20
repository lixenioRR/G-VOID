Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param($size, $outFile)
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(5, 5, 5))
    
    $half = $size / 2
    $pad = $size * 0.15
    
    # Outer glow triangle
    $glowColor = [System.Drawing.Color]::FromArgb(80, 54, 226, 123)
    $glowBrush = New-Object System.Drawing.SolidBrush($glowColor)
    $outerPoints = New-Object System.Drawing.PointF[] 3
    $outerPoints[0] = New-Object System.Drawing.PointF($half, $pad * 0.8)
    $outerPoints[1] = New-Object System.Drawing.PointF($size - $pad * 0.5, $size - $pad * 0.8)
    $outerPoints[2] = New-Object System.Drawing.PointF($pad * 0.5, $size - $pad * 0.8)
    $g.FillPolygon($glowBrush, $outerPoints)
    
    # Main green triangle
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(54, 226, 123))
    $mainPoints = New-Object System.Drawing.PointF[] 3
    $mainPoints[0] = New-Object System.Drawing.PointF($half, $pad * 1.2)
    $mainPoints[1] = New-Object System.Drawing.PointF($size - $pad * 0.8, $size - $pad)
    $mainPoints[2] = New-Object System.Drawing.PointF($pad * 0.8, $size - $pad)
    $g.FillPolygon($greenBrush, $mainPoints)
    
    # Inner void (black triangle)
    $voidBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(5, 5, 5))
    $innerPoints = New-Object System.Drawing.PointF[] 3
    $innerPoints[0] = New-Object System.Drawing.PointF($half, $pad * 2.0)
    $innerPoints[1] = New-Object System.Drawing.PointF($size - $pad * 1.4, $size - $pad * 1.3)
    $innerPoints[2] = New-Object System.Drawing.PointF($pad * 1.4, $size - $pad * 1.3)
    $g.FillPolygon($voidBrush, $innerPoints)
    
    $g.Dispose()
    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $outFile"
}

Create-Icon 192 "c:\Users\Çağatay Lüleci\Desktop\Proje Telegram Cloud\public\icon-192.png"
Create-Icon 512 "c:\Users\Çağatay Lüleci\Desktop\Proje Telegram Cloud\public\icon-512.png"
Write-Host "Done!"
