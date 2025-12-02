const XLSX = require('xlsx');
const path = require('path');

// Función detectCategory (copia de excelParser.ts)
function detectCategory(productName) {
  const name = productName.toLowerCase();

  // VACUNO
  if (name.includes('churrasco') || name.includes('lomito') || name.includes('carne molida') || 
      name.includes('carne picada') || name.includes('albóndiga') || name.includes('albondiga') ||
      name.includes('hamburguesa') || name.includes('surtido') || name.includes('estuche de hamburguesa')) 
    return 'vacuno'
  
  // CERDO
  if (name.includes('chuleta') || name.includes('cerdo') || name.includes('salchicha')) 
    return 'cerdo'
  
  // POLLO
  if (name.includes('pollo') || name.includes('cubito') || name.includes('alitas')) 
    return 'pollo'
  
  // MARISCOS
  if (name.includes('camarón') || name.includes('camaron') || name.includes('mariscos') || 
      name.includes('pescado')) 
    return 'mariscos'
  
  // PAPAS
  if (name.includes('papas') || name.includes('frita')) 
    return 'papas'
  
  // HELADOS
  if (name.includes('helado') || name.includes('palito') || name.includes('cassata') ||
      name.includes('chomp') || name.includes('crazy frambuesa') || name.includes('daknky') ||
      name.includes('kriko') || name.includes('megas') || name.includes('mustangs') ||
      name.includes('sanhe') || name.includes('savory') || name.includes('trululu') ||
      name.includes('cola de tigre')) 
    return 'helados'
  
  // PIZZAS
  if (name.includes('pizza')) 
    return 'pizzas'
  
  // FRUTAS
  if (name.includes('fruta') || name.includes('frutilla') || name.includes('maracuyá') || 
      name.includes('maracuya') || name.includes('arándano') || name.includes('arandano') ||
      name.includes('durazno') || name.includes('mango') || name.includes('piña') ||
      name.includes('frutos del bosque')) 
    return 'frutas'
  
  // VERDURAS
  if (name.includes('verdura') || name.includes('arvejas') || name.includes('choclo') || 
      name.includes('edamame') || name.includes('ajo') || name.includes('cebolla') ||
      name.includes('champiñón') || name.includes('champinon') || name.includes('zanahoria') ||
      name.includes('esparrago') || name.includes('habas') || name.includes('mix de pimentones') ||
      name.includes('poroto verde') || name.includes('primavera') || name.includes('sofrito') ||
      name.includes('tortilla') || name.includes('zapallo')) 
    return 'verduras'
  
  // Otros (default)
  return 'otros'
}

// Leer Excel
const inputPath = path.join(__dirname, '../public/PRECIOS.xlsx');
const workbook = XLSX.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir a JSON
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`📊 Leyendo ${rows.length} filas del Excel...`);

if (rows.length <= 1) {
  console.error('❌ El Excel está vacío o no tiene datos');
  process.exit(1);
}

// Headers originales
const headers = rows[0];
console.log(`📋 Headers originales:`, headers);

// Encontrar índices de columnas importantes
const nombreIdx = 0; // Nombre siempre es la primera columna
const skuIdx = headers.findIndex(h => h && h.toLowerCase().includes('sku'));
const precioUnitIdx = headers.findIndex(h => h && h.toLowerCase().includes('precios'));
const precioMayorIdx = headers.findIndex(h => h && h.toLowerCase().includes('mayor'));

console.log(`🔍 Indices encontrados:`, { nombreIdx, skuIdx, precioUnitIdx, precioMayorIdx });

// Nuevos headers
const newHeaders = [
  ...headers,
  'categoria',
  'favorito',
  'superfavorito',
  'visible'
];

// Procesar datos
const processedRows = [newHeaders];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
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
  console.log(`✅ Producto ${i}: "${nombre}" → ${categoria}`);
}

// Crear nuevo workbook
const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.aoa_to_sheet(processedRows);

// Ajustar ancho de columnas
newWorksheet['!cols'] = [
  { wch: 35 }, // nombre
  { wch: 12 }, // precios
  { wch: 12 }, // mayor
  { wch: 20 }, // umbral
  { wch: 12 }, // sku
  { wch: 15 }, // categoria
  { wch: 10 }, // favorito
  { wch: 15 }, // superfavorito
  { wch: 10 }  // visible
];

XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Productos');

// Guardar
const outputPath = path.join(__dirname, '../public/PRECIOS.xlsx');
XLSX.writeFile(newWorkbook, outputPath);

console.log(`\n✨ Excel mejorado guardado en: ${outputPath}`);
console.log(`📦 Total productos procesados: ${processedRows.length - 1}`);
