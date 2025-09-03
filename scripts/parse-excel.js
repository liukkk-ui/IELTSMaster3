import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, '../attached_assets/ielts listening words spell_1756897491290.xls');
const workbook = XLSX.readFile(filePath);

// Get the first worksheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Print the first few rows to understand the structure
console.log('Excel file structure:');
console.log('Sheet name:', sheetName);
console.log('Total rows:', jsonData.length);
console.log('\nFirst 5 rows:');
jsonData.slice(0, 5).forEach((row, index) => {
  console.log(`Row ${index}:`, row);
});

// Print column headers if they exist
if (jsonData.length > 0) {
  console.log('\nColumn headers (first row):');
  jsonData[0].forEach((header, index) => {
    console.log(`Column ${index}:`, header);
  });
}

// Save to JSON for inspection
fs.writeFileSync(
  path.join(__dirname, 'excel-data.json'),
  JSON.stringify(jsonData, null, 2)
);

console.log('\nData saved to scripts/excel-data.json for inspection');