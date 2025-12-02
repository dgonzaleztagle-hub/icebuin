// Mapa de imágenes disponibles en /public/images
// Todas las imágenes están normalizadas como sku####.jpg (minúscula)

const imageFormats = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.gif']

export function getImagePath(sku: string): string {
  const skuNum = parseInt(sku)
  const imageName = `sku${String(skuNum).padStart(4, '0')}`
  
  // Sirve directamente desde /public/images
  return `/images/${imageName}.jpg`
}

// Verifica si una imagen existe (para fallbacks)
export async function findImagePath(sku: string): Promise<string | null> {
  const skuNum = parseInt(sku)
  const imageName = `sku${String(skuNum).padStart(4, '0')}`
  
  // Intenta primero con .jpg (nombre estándar)
  try {
    const path = `/images/${imageName}.jpg`
    const response = await fetch(path, { method: 'HEAD' })
    if (response.ok) {
      return path
    }
  } catch (e) {
    // Si no existe, devuelve el path de todas formas
    // el navegador mostrará el placeholder en onError
  }
  
  return `/images/${imageName}.jpg`
}
