import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función detectCategory (identica a TypeScript)
function detectCategory(productName) {
  const name = productName.toLowerCase();

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

// Leer Excel
const inputPath = path.join(__dirname, '../public/PRECIOS.xlsx');
console.log(`📂 Leyendo: ${inputPath}`);
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Obtener rangos de datos
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log(`📊 Rango del sheet: ${XLSX.utils.encode_range(range)}`);

// Convertir a JSON para inspeccionar
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
console.log(`📋 Total filas: ${rows.length}`);
console.log(`📋 Primera fila (headers):`, rows[0]);
console.log(`📋 Segunda fila (data):`, rows[1]);

if (rows.length <= 1) {
  console.error('❌ No hay datos en el Excel');
  process.exit(1);
}

// Headers
const headers = rows[0];
const nombreIdx = 0;

// Si ya existe "categoria", recrear sin ella
let headersCleaned = headers;
const catIdx = headers.findIndex(h => h === 'categoria');
const favIdx = headers.findIndex(h => h === 'favorito');
if (catIdx >= 0) {
  console.log(`⚠️  Encontrada columna 'categoria' en índice ${catIdx}, removiendo columnas duplicadas...`);
  headersCleaned = headers.slice(0, catIdx);
}

// Nuevos headers
const newHeaders = [
  ...headersCleaned,
  'categoria',
  'favorito',
  'superfavorito',
  'visible'
];

console.log(`\n📝 Headers finales:`, newHeaders);

// Procesar datos
const processedRows = [newHeaders];
let processedCount = 0;

for (let i = 1; i < rows.length; i++) {
  let row = rows[i];
  
  // Si ya tiene categoría, limpiarla
  if (catIdx >= 0) {
    row = row.slice(0, catIdx);
  }
  
  const nombre = row[nombreIdx] ? String(row[nombreIdx]).trim() : '';
  
  // Skip filas vacías
  if (!nombre) continue;
  
  // Detectar categoría
  const categoria = detectCategory(nombre);
  
  // Agregar columnas nuevas
  const newRow = [
    ...row,
    categoria,
    false, // favorito
    false, // superfavorito
    true   // visible
  ];
  
  processedRows.push(newRow);
  processedCount++;
  
  if (processedCount <= 5 || processedCount % 50 === 0 || nombre.includes('HAMBUERGUESA TRADICIONAL')) {
    console.log(`✅ [${i}] "${nombre.substring(0, 40)}..." → ${categoria}`);
  }
}

// Crear nuevo workbook
const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.aoa_to_sheet(processedRows);

// Ajustar ancho de columnas
newWorksheet['!cols'] = [
  { wch: 35 },
  { wch: 12 },
  { wch: 12 },
  { wch: 20 },
  { wch: 12 },
  { wch: 15 },
  { wch: 10 },
  { wch: 15 },
  { wch: 10 }
];

XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Productos');

// Guardar
const outputPath = path.join(__dirname, '../public/PRECIOS.xlsx');
XLSX.writeFile(newWorkbook, outputPath);

console.log(`\n✨ Excel mejorado guardado en: ${outputPath}`);
console.log(`📦 Total productos procesados: ${processedCount}`);
