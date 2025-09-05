import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the parsed Excel data
const excelData = JSON.parse(fs.readFileSync(path.join(__dirname, 'excel-data.json'), 'utf8'));

// Skip header row and organize data
const organizedData = {};

// Process each row (skip header at index 0)
for (let i = 1; i < excelData.length; i++) {
  const [chapter, testPaper, word] = excelData[i];
  
  if (!chapter || !testPaper || !word) continue;
  
  // Initialize chapter if not exists
  if (!organizedData[chapter]) {
    organizedData[chapter] = {};
  }
  
  // Initialize test paper if not exists
  if (!organizedData[chapter][testPaper]) {
    organizedData[chapter][testPaper] = [];
  }
  
  // Add word to test paper
  organizedData[chapter][testPaper].push(word.toString().toLowerCase().trim());
}

// Generate summary
console.log('Test Paper Organization Summary:');
console.log('==============================');

let totalTestPapers = 0;
let totalWords = 0;

Object.keys(organizedData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chapter => {
  const testPapers = Object.keys(organizedData[chapter]);
  const chapterWords = testPapers.reduce((sum, tp) => sum + organizedData[chapter][tp].length, 0);
  
  console.log(`Chapter ${chapter}: ${testPapers.length} test papers, ${chapterWords} words`);
  
  testPapers.sort((a, b) => parseInt(a) - parseInt(b)).forEach(testPaper => {
    const wordCount = organizedData[chapter][testPaper].length;
    console.log(`  Test Paper ${testPaper}: ${wordCount} words`);
    totalWords += wordCount;
  });
  
  totalTestPapers += testPapers.length;
  console.log('');
});

console.log(`Total: ${Object.keys(organizedData).length} chapters, ${totalTestPapers} test papers, ${totalWords} words`);

// Save organized data
const outputPath = path.join(__dirname, 'organized-test-papers.json');
fs.writeFileSync(outputPath, JSON.stringify(organizedData, null, 2));

console.log(`\nOrganized data saved to: ${outputPath}`);

// Also create a mapping file for easy lookup
const testPaperList = [];
Object.keys(organizedData).forEach(chapter => {
  Object.keys(organizedData[chapter]).forEach(testPaper => {
    testPaperList.push({
      chapter: parseInt(chapter),
      testPaper: parseInt(testPaper),
      words: organizedData[chapter][testPaper],
      wordCount: organizedData[chapter][testPaper].length
    });
  });
});

const mappingPath = path.join(__dirname, 'test-paper-mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(testPaperList, null, 2));

console.log(`Test paper mapping saved to: ${mappingPath}`);