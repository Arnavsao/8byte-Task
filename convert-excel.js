const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('E555815F_58D029050B.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Print first few rows
console.log('Portfolio Data:');
console.log(JSON.stringify(data.slice(0, 5), null, 2));
console.log('\nTotal rows:', data.length);

// Save to JSON file
fs.writeFileSync('backend/data/portfolio.json', JSON.stringify(data, null, 2));
console.log('\nData saved to backend/data/portfolio.json');
