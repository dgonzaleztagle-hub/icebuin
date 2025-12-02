import XLSX from 'xlsx';

const wb = XLSX.readFile('public/PRECIOS.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const nombreIdx = 0;

const soya = rows.find(r => r[nombreIdx] && r[nombreIdx].includes('SOYA'));
if (soya) {
  console.log('Encontrado producto con SOYA:');
  console.log(`"${soya[nombreIdx]}"`);
  console.log(`Caracteres: ${JSON.stringify(soya[nombreIdx])}`);
}
