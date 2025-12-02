import * as XLSX from 'xlsx'
import type { Product } from '../data/mockProducts'

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
          sku: headers.findIndex(h => h && h.toLowerCase().includes('sku')),
        }

        console.log('Headers:', headers)
        console.log('Column indexes:', columnIndexes)

        // Convertir filas a Products
        const products: Product[] = rows
          .slice(1) // Skip header
          .filter((row: any[]) => row && row[columnIndexes.nombre] && String(row[columnIndexes.nombre]).trim() !== '')
          .map((row: any[], index: number) => {
            const sku = String(row[columnIndexes.sku] || index + 1)
            const nombre = String(row[columnIndexes.nombre] || '').trim()
            const precioUnit = Number(row[columnIndexes.precioUnit]) || 0
            const precioMayor = row[columnIndexes.precioMayor] ? Number(row[columnIndexes.precioMayor]) : null
            const umbralMayor = row[columnIndexes.umbralMayor] ? String(row[columnIndexes.umbralMayor]).trim() : null

            return {
              sku,
              nombre,
              categoria: 'otros', // Se asignará después
              precioUnit,
              precioMayor: precioMayor && precioMayor > 0 ? precioMayor : null,
              umbralMayor,
              favorito: false,
              superfavorito: false,
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

  if (name.includes('papas') || name.includes('frita')) return 'papas'
  if (name.includes('pollo') || name.includes('cubito') || name.includes('alitas')) return 'pollo'
  if (name.includes('camarón') || name.includes('camaron') || name.includes('mariscos')) return 'mariscos'
  if (name.includes('verdura') || name.includes('arvejas') || name.includes('choclo')) return 'verduras'
  if (name.includes('helado') || name.includes('palito')) return 'helados'
  if (name.includes('pizza')) return 'pizzas'
  if (name.includes('fruta') || name.includes('frutilla')) return 'frutas'
  if (name.includes('hamburguesa') || name.includes('surtido')) return 'vacuno'
  if (name.includes('churrasco') || name.includes('lomito') || name.includes('carne molida') || name.includes('albóndiga')) return 'vacuno'
  if (name.includes('chuleta') || name.includes('cerdo')) return 'cerdo'
  if (name.includes('empanada')) return 'otros'
  if (name.includes('pescado') || name.includes('salchicha')) return 'mariscos'

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
