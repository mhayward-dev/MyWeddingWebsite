# Square Image Resizer Script with adjustable vertical crop
# Resizes image to square dimensions with custom vertical position

param(
    [string]$InputPath,
    [string]$OutputPath,
    [string]$ReferencePath,
    [double]$VerticalPosition = 0.5  # 0 = top, 0.5 = center, 1 = bottom
)

Add-Type -AssemblyName System.Drawing

# Get reference image dimensions
$refImg = [System.Drawing.Image]::FromFile($ReferencePath)
$targetSize = $refImg.Width  # Use width as the square dimension
Write-Host "Reference image dimensions: $($refImg.Width) x $($refImg.Height)"
Write-Host "Creating square image: $targetSize x $targetSize"
$refImg.Dispose()

# Load the source image
$img = [System.Drawing.Image]::FromFile($InputPath)
Write-Host "Source image dimensions: $($img.Width) x $($img.Height)"

# Determine crop dimensions for square
$minDim = [Math]::Min($img.Width, $img.Height)
$cropX = [int](($img.Width - $minDim) / 2)

# Adjust vertical crop based on VerticalPosition parameter
if ($img.Height -gt $minDim) {
    $availableShift = $img.Height - $minDim
    $cropY = [int]($availableShift * $VerticalPosition)
} else {
    $cropY = 0
}

Write-Host "Crop position: X=$cropX, Y=$cropY (VerticalPosition=$VerticalPosition)"

# Create cropped square bitmap
$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $minDim, $minDim)
$croppedBitmap = New-Object System.Drawing.Bitmap($minDim, $minDim)
$graphics = [System.Drawing.Graphics]::FromImage($croppedBitmap)
$graphics.DrawImage($img, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

# Create resized bitmap
$resizedBitmap = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
$graphics2 = [System.Drawing.Graphics]::FromImage($resizedBitmap)
$graphics2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics2.DrawImage($croppedBitmap, 0, 0, $targetSize, $targetSize)

# Save the result
$resizedBitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Clean up
$graphics.Dispose()
$graphics2.Dispose()
$img.Dispose()
$croppedBitmap.Dispose()
$resizedBitmap.Dispose()

Write-Host "Square image created successfully: $targetSize x $targetSize saved to $OutputPath"
