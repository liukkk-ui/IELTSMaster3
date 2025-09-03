import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const filePath = path.join(__dirname, '../attached_assets/ielts listening words spell_1756897491290.xls');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Skip the header row
const rows = jsonData.slice(1);

console.log(`Processing ${rows.length} words...`);

// Group words by chapter
const wordsByChapter = {};
rows.forEach((row) => {
  const [chapter, test_paper, word] = row;
  if (!chapter || !word) return;
  
  const chapterKey = chapter.toString();
  if (!wordsByChapter[chapterKey]) {
    wordsByChapter[chapterKey] = [];
  }
  
  wordsByChapter[chapterKey].push({
    word: word.toString().toLowerCase().trim(),
    test_paper: test_paper
  });
});

// Create units data
const units = [];
const words = [];

Object.keys(wordsByChapter).sort((a, b) => parseInt(a) - parseInt(b)).forEach((chapterKey, index) => {
  const chapterNum = parseInt(chapterKey);
  const chapterWords = wordsByChapter[chapterKey];
  
  // Remove duplicates
  const uniqueWords = [...new Map(chapterWords.map(w => [w.word, w])).values()];
  
  // Determine difficulty based on chapter number
  let difficulty = 'Beginner';
  if (chapterNum >= 10 && chapterNum < 20) difficulty = 'Intermediate';
  else if (chapterNum >= 20) difficulty = 'Advanced';
  
  const unit = {
    number: chapterNum,
    title: `Chapter ${chapterNum}`,
    description: `IELTS Listening vocabulary from Wang Lu Chapter ${chapterNum}`,
    difficulty: difficulty,
    wordCount: uniqueWords.length
  };
  
  units.push(unit);
  
  // Add words for this unit
  uniqueWords.forEach(wordData => {
    words.push({
      unitNumber: chapterNum,
      word: wordData.word,
      // Add phonetic and definition placeholders - these would need to be filled from another source
      phonetic: null,
      definition: null
    });
  });
});

console.log(`Created ${units.length} units with ${words.length} unique words`);

// Show unit statistics
console.log('\nUnit Statistics:');
units.forEach(unit => {
  console.log(`Unit ${unit.number}: ${unit.title} - ${unit.wordCount} words (${unit.difficulty})`);
});

// Save the processed data
const outputData = {
  units,
  words,
  metadata: {
    totalUnits: units.length,
    totalWords: words.length,
    source: 'Wang Lu IELTS Corpus',
    processedAt: new Date().toISOString()
  }
};

fs.writeFileSync(
  path.join(__dirname, '../server/ielts-vocabulary-data.json'),
  JSON.stringify(outputData, null, 2)
);

console.log('\nProcessed data saved to server/ielts-vocabulary-data.json');
console.log('Ready to update storage.ts with real vocabulary data!');