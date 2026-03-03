import XLSX from 'xlsx';

const wb = XLSX.readFile('public/PRECIOS.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const nombreIdx = 0;
const headers = rows[0];
const categoriaIdx = headers.findIndex(h => h === 'categoria');

console.log(`Headers: ${JSON.stringify(headers)}`);
console.log(`categoriaIdx: ${categoriaIdx}`);

const soya = rows.find(r => r[nombreIdx] && r[nombreIdx].includes('SOYA'));
if (soya) {
  console.log(`Producto: "${soya[nombreIdx]}"`);
  console.log(`Row completa: ${JSON.stringify(soya)}`);
  console.log(`Categoría (índice ${categoriaIdx}): "${soya[categoriaIdx]}"`);
} else {
  console.log('No encontrado SOYA');
}
