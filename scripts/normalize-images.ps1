#!/usr/bin/env pwsh

# Script para normalizar nombres de imágenes
# Convierte todas las imágenes a formato sku0xxx.jpg (minúscula)

$imagePath = "C:\Users\dgonz\OneDrive\Desktop\proyectos\ICEBUIN\web\public\images"
cd $imagePath

# Obtener todos los archivos de imagen (excepto .gitkeep)
$files = Get-ChildItem -Name | Where-Object { $_ -ne ".gitkeep" }

$convertedCount = 0
$skippedCount = 0

foreach ($file in $files) {
    # Extraer el número SKU usando regex
    if ($file -match "sku(\d+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) {
        $skuNumber = $matches[1]
        # Formatear con ceros a la izquierda (4 dígitos)
        $skuFormatted = [int]$skuNumber
        $newName = "sku$($skuFormatted.ToString("0000")).jpg"
        
        # Solo renombrar si es diferente
        if ($file -ne $newName) {
            try {
                Rename-Item -Path $file -NewName $newName -ErrorAction Stop
                Write-Host "OK Renombrado: $file to $newName"
                $convertedCount++
            }
            catch {
                Write-Host "ERROR renombrando $file : $_"
            }
        }
        else {
            $skippedCount++
        }
    }
    else {
        Write-Host "WARN No se pudo extraer SKU de: $file"
    }
}

Write-Host ""
Write-Host "=== Resumen ==="
Write-Host "Archivos renombrados: $convertedCount"
Write-Host "Archivos sin cambios: $skippedCount"
Write-Host "Total procesados: $($convertedCount + $skippedCount)"
