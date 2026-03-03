import XLSX from 'xlsx';

const wb = XLSX.readFile('public/PRECIOS.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const headers = rows[0];
const categoriaIdx = headers.findIndex(h => h === 'categoria');
const nombreIdx = 0;

// Agrupar por categoría
const categorias = {};
rows.slice(1).forEach(row => {
  if (row[nombreIdx]) {
    const cat = row[categoriaIdx] || 'sin categoría';
    if (!categorias[cat]) categorias[cat] = [];
    categorias[cat].push(row[nombreIdx]);
  }
});

console.log('\n📦 CATEGORÍAS Y PRODUCTOS:\n');
Object.keys(categorias).sort().forEach(cat => {
  console.log(`✅ ${cat.toUpperCase()}: ${categorias[cat].length} productos`);
});

// Mostrar productos específicos que cambiaron
console.log('\n🔄 PRODUCTOS QUE CAMBIARON:\n');
const cambios = [
  ['HAMBUERGUESA TRADICIONAL 185 GRS. KING', 'vacuno'],
  ['ARVEJA 200 GRS. MINUTITO VERDE MINI', 'verduras'],
  ['ENSALADA JARDINERA 200 GRS. MINUTO VERDE', 'verduras'],
  ['CHAMPIÑON LAMINADO 350 GRS. MINUTO VERDE', 'verduras'],
  ['PULPA FRAMBUESA 335 GRS. MINUTO VERDE', 'frutas'],
  ['HAMBUERGUESA DE SOYA LC 100 GRS.', 'vegano'],
  ['HAMBUERGUESA GARBANZO 100 GRS. MINUTO VERDE', 'vegano'],
  ['HAMBUERGUESA POROTO NEGRO 100 GRS. MINUTO VERDE', 'vegano']
];

cambios.forEach(([producto, categoriaEsperada]) => {
  const row = rows.find(r => r[nombreIdx]?.includes(producto.split(' ').slice(0, 2).join(' ')));
  if (row) {
    const categoriaReal = row[categoriaIdx];
    const icono = categoriaReal === categoriaEsperada ? '✅' : '❌';
    console.log(`${icono} "${producto.substring(0, 40)}" → ${categoriaReal}`);
  }
});

console.log(`\n📊 TOTAL PRODUCTOS: ${rows.length - 1}`);
