const XLSX = require('xlsx');

const wb = XLSX.readFile('public/PRECIOS.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];

console.log('Sheet name:', wb.SheetNames[0]);
console.log('\nFirst 5 rows:');

const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
data.slice(0, 5).forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

console.log('\nColumn headers:');
console.log(data[0]);

console.log('\nTotal rows:', data.length);
