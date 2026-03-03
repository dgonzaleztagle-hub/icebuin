import XLSX from 'xlsx';

const wb = XLSX.readFile('public/PRECIOS.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const headers = rows[0];
const categoriaIdx = headers.findIndex(h => h === 'categoria');
const nombreIdx = 0;

const otros = rows.slice(1).filter(row => row[categoriaIdx] === 'otros').map(row => row[nombreIdx]);
console.log('\n📦 Productos en OTROS:');
otros.forEach((nombre, i) => console.log(`${i+1}. ${nombre}`));
console.log(`\n📊 Total en OTROS: ${otros.length}`);
