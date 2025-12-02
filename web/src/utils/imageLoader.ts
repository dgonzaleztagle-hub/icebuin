// Mapa de imágenes disponibles - se genera desde public/images
// En desarrollo, usa el middleware /api/image/ de Vite
// En producción, usa la ruta /api/image?sku=... (serverless function en Vercel)

const imageFormats = ['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.gif']

export function getImagePath(sku: string): string {
  const skuNum = parseInt(sku)
  const imageName = `SKU${String(skuNum).padStart(4, '0')}`
  
  // Tanto en desarrollo como en producción, usa el mismo endpoint
  // En dev: middleware de Vite lo maneja
  // En prod: serverless function /api/image.ts lo maneja
  return `/api/image?sku=${imageName}`
}

// Lista de imágenes disponibles (importadas dinámicamente)
export async function findImagePath(sku: string): Promise<string | null> {
  const skuNum = parseInt(sku)
  const imageName = `SKU${String(skuNum).padStart(4, '0')}`
  
  for (const format of imageFormats) {
    try {
      const path = `/images/${imageName}${format}`
      // Intenta cargar la imagen
      const response = await fetch(path, { method: 'HEAD' })
      if (response.ok) {
        return path
      }
    } catch (e) {
      // Continúa con el siguiente formato
    }
  }
  
  return null
}
