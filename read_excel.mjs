import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('./web/public/PRECIOS.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('=== Primera fila (Header presumido) ===');
console.log(data[0]);

console.log('\n=== Segunda fila (Primer producto) ===');
console.log(data[1]);

console.log('\n=== Tercera fila (Segundo producto) ===');
console.log(data[2]);

console.log('\n=== Total de filas:', data.length);
console.log('=== Total de columnas:', data[0]?.length);
