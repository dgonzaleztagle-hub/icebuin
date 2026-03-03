import * as XLSX from 'xlsx'
import type { Product } from '../data/mockProducts'

export type { Product }

/**
 * Parsea un archivo Excel y convierte las filas en objetos Product
 */
export function parseExcelFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Leer datos como arrays para mejor control
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        console.log('Total rows from Excel:', rows.length)
        console.log('Headers (row 0):', rows[0])
        console.log('First product (row 1):', rows[1])
        
        if (!rows || rows.length <= 1) {
          resolve([])
          return
        }

        // Usar la primera fila como headers
        const headers = rows[0] as string[]
        
        // Buscar índices de columnas (con trim para espacios extra)
        // El nombre NO tiene encabezado, siempre está en índice 0
        const columnIndexes = {
          nombre: 0, // La primera columna SIEMPRE es el nombre (sin header)
          precioUnit: headers.findIndex(h => h && h.toLowerCase().includes('precios')),
          precioMayor: headers.findIndex(h => h && h.toLowerCase().includes('mayor ')),
          umbralMayor: headers.findIndex(h => h && h.toLowerCase().includes('precio mayor desde')),
          sku: headers.findIndex(h => h && (h.toUpperCase() === 'SKU' || h.toLowerCase() === 'sku')), // Busca exactamente "SKU"
          imagen: headers.findIndex(h => h && h.toUpperCase() === 'IMAGEN'),
          favorito: headers.findIndex(h => h && h.toLowerCase().includes('favorito') && !h.toLowerCase().includes('superfavorito')),
          superfavorito: headers.findIndex(h => h && h.toLowerCase().includes('superfavorito')),
        }

        console.log('Headers:', headers)
        console.log('Column indexes:', columnIndexes)

        // Si no encuentra columna SKU por nombre, usa posición fija (columna H = índice 7)
        const skuColumnIndex = columnIndexes.sku >= 0 ? columnIndexes.sku : 7;
        
        console.log('Using SKU column index:', skuColumnIndex)

        // Convertir filas a Products
        const products: Product[] = rows
          .slice(1) // Skip header
          .filter((row: any[]) => row && row[columnIndexes.nombre] && String(row[columnIndexes.nombre]).trim() !== '')
          .map((row: any[], index: number) => {
            const sku = String(row[skuColumnIndex] || index + 1).trim()
            const nombre = String(row[columnIndexes.nombre] || '').trim()
            const precioUnit = Number(row[columnIndexes.precioUnit]) || 0
            const precioMayor = row[columnIndexes.precioMayor] ? Number(row[columnIndexes.precioMayor]) : null
            const umbralMayor = row[columnIndexes.umbralMayor] ? String(row[columnIndexes.umbralMayor]).trim() : null
            
            // Helper para convertir valores booleanos del Excel
            const parseBoolean = (value: any): boolean => {
              if (typeof value === 'boolean') return value
              if (typeof value === 'number') return value !== 0
              const str = String(value || '').toLowerCase().trim()
              return str === 'verdadero' || str === 'true' || str === '1' || str === 'sí' || str === 'si'
            }
            
            const favorito = columnIndexes.favorito >= 0 ? parseBoolean(row[columnIndexes.favorito]) : false
            const superfavorito = columnIndexes.superfavorito >= 0 ? parseBoolean(row[columnIndexes.superfavorito]) : false

            return {
              sku,
              nombre,
              categoria: 'otros', // Se asignará después
              precioUnit,
              precioMayor: precioMayor && precioMayor > 0 ? precioMayor : null,
              umbralMayor,
              favorito,
              superfavorito,
              visible: true,
            }
          })

        console.log('Processed products:', products.length)
        if (products.length > 0) {
          console.log('First product:', products[0])
          console.log('Last product:', products[products.length - 1])
        }
        resolve(products)
      } catch (error) {
        reject(new Error(`Error al parsear Excel: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer archivo'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Detecta categorías basadas en el nombre del producto
 */
export function detectCategory(productName: string): string {
  const name = productName.toLowerCase()

  // VEGANO (primero para evitar que "hamburguesa de soya" se detecte como "vacuno")
  if (name.includes('soya') || name.includes('garbanzo') || name.includes('poroto negro')) 
    return 'vegano'

  // VACUNO
  if (name.includes('churrasco') || name.includes('lomito') || name.includes('carne molida') || 
      name.includes('carne picada') || name.includes('albóndiga') || name.includes('albondiga') ||
      name.includes('hamburguesa') || name.includes('hambuerguesa') || name.includes('surtido') || 
      name.includes('estuche de hambuerguesa') || name.includes('estuche de hamburguesa') ||
      name.includes('surtido mariscos')) 
    return 'vacuno'
  
  // CERDO
  if (name.includes('chuleta') || name.includes('cerdo') || name.includes('salchicha')) 
    return 'cerdo'
  
  // POLLO
  if (name.includes('pollo') || name.includes('cubito') || name.includes('alitas') || name.includes('suprema')) 
    return 'pollo'
  
  // MARISCOS
  if (name.includes('camarón') || name.includes('camaron') || name.includes('mariscos') || 
      name.includes('pescado')) 
    return 'mariscos'
  
  // PAPAS
  if (name.includes('papas') || name.includes('frita') || name.includes('papa duquesa')) 
    return 'papas'
  
  // HELADOS
  if (name.includes('helado') || name.includes('palito') || name.includes('cassata') ||
      name.includes('chomp') || name.includes('crazy') || name.includes('daknky') || 
      name.includes('danky') || name.includes('kriko') || name.includes('mega') || 
      name.includes('mustang') || name.includes('sanhe') || name.includes('savory') || 
      name.includes('trululu') || name.includes('cola de tigre') || name.includes('paleta') ||
      name.includes('fruti-fru') || name.includes('fru fruna') || name.includes('cremino') ||
      name.includes('paleton') || name.includes('pala palito') || name.includes('brazuka') ||
      name.includes('splash') || name.includes('choco fru') || name.includes('crocante') ||
      name.includes('chiry fru')) 
    return 'helados'
  
  // PIZZAS
  if (name.includes('pizza')) 
    return 'pizzas'
  
  // FRUTAS
  if (name.includes('fruta') || name.includes('frutilla') || name.includes('maracuyá') || 
      name.includes('maracuya') || name.includes('arándano') || name.includes('arandano') ||
      name.includes('durazno') || name.includes('mango') || name.includes('piña') ||
      name.includes('frutos del bosque') || name.includes('pulpa')) 
    return 'frutas'
  
  // VERDURAS
  if (name.includes('verdura') || name.includes('arvejas') || name.includes('arveja') ||
      name.includes('choclo') || name.includes('edamame') || name.includes('ajo') || 
      name.includes('cebolla') || name.includes('champi') || 
      name.includes('zanahoria') || name.includes('esparrago') || name.includes('habas') || 
      name.includes('mix de pimentones') || name.includes('poroto verde') || name.includes('primavera') || 
      name.includes('sofrito') || name.includes('tortilla') || name.includes('zapallo') ||
      name.includes('pasta choclo') || name.includes('ensalada jardinera')) 
    return 'verduras'
  
  // Otros (default)
  return 'otros'
}

/**
 * Procesa productos del Excel y asigna categorías
 */
export function processProducts(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    categoria: detectCategory(product.nombre),
  }))
}
