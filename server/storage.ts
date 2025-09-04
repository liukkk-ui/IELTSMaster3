import { 
  type Unit, 
  type Word, 
  type UserProgress, 
  type PracticeAttempt, 
  type ErrorWord,
  type PracticeSettings,
  type TestPaper,
  type InsertUnit,
  type InsertWord,
  type InsertUserProgress,
  type InsertPracticeAttempt,
  type InsertErrorWord,
  type InsertPracticeSettings,
  type InsertTestPaper
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface IStorage {
  // Units
  getUnits(): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  
  // Words
  getWordsByUnit(unitId: string): Promise<Word[]>;
  getWord(id: string): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;
  getRandomWords(count: number, excludeUnitIds?: string[]): Promise<Word[]>;
  
  // User Progress
  getUserProgress(unitId: string, userId?: string): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getAllUserProgress(userId?: string): Promise<UserProgress[]>;
  
  // Practice Attempts
  createPracticeAttempt(attempt: InsertPracticeAttempt): Promise<PracticeAttempt>;
  getPracticeAttempts(wordId: string, userId?: string): Promise<PracticeAttempt[]>;
  
  // Error Words
  getErrorWords(userId?: string): Promise<(ErrorWord & { word: Word })[]>;
  createOrUpdateErrorWord(errorWord: InsertErrorWord): Promise<ErrorWord>;
  resolveErrorWord(wordId: string, userId?: string): Promise<void>;
  
  // Practice Settings
  getPracticeSettings(userId?: string): Promise<PracticeSettings | undefined>;
  updatePracticeSettings(settings: InsertPracticeSettings): Promise<PracticeSettings>;
  
  // Test Papers
  getTestPapers(unitId: string): Promise<TestPaper[]>;
  createTestPaper(testPaper: InsertTestPaper): Promise<TestPaper>;
  generateTestPapersForUnit(unitId: string, wordsPerPaper?: number): Promise<TestPaper[]>;
  getTestPaperWords(testPaperId: string): Promise<Word[]>;
}

export class MemStorage implements IStorage {
  private units: Map<string, Unit> = new Map();
  private words: Map<string, Word> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private practiceAttempts: Map<string, PracticeAttempt> = new Map();
  private errorWords: Map<string, ErrorWord> = new Map();
  private practiceSettings: Map<string, PracticeSettings> = new Map();
  private testPapers: Map<string, TestPaper> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Load Wang Lu IELTS Corpus data from JSON file
    const dataPath = path.join(__dirname, 'ielts-vocabulary-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const vocabData = JSON.parse(rawData);

    // Create units and track their IDs
    const unitIdMap = new Map<number, string>();
    
    vocabData.units.forEach((unitData: any) => {
      const unitId = randomUUID();
      const unit: Unit = {
        id: unitId,
        number: unitData.number,
        title: unitData.title,
        description: unitData.description || null,
        difficulty: unitData.difficulty,
        wordCount: unitData.wordCount
      };
      this.units.set(unitId, unit);
      unitIdMap.set(unitData.number, unitId);
    });

    // Group words by unit number
    const wordsByUnit = vocabData.words.reduce((acc: any, wordData: any) => {
      if (!acc[wordData.unitNumber]) {
        acc[wordData.unitNumber] = [];
      }
      acc[wordData.unitNumber].push(wordData);
      return acc;
    }, {});

    // Create words for each unit
    Object.entries(wordsByUnit).forEach(([unitNumberStr, unitWords]: [string, any]) => {
      const unitNumber = parseInt(unitNumberStr);
      const unitId = unitIdMap.get(unitNumber);
      if (!unitId) return;

      unitWords.forEach((wordData: any) => {
        const wordId = randomUUID();
        const word: Word = {
          id: wordId,
          unitId,
          word: wordData.word,
          phonetic: wordData.phonetic || null,
          definition: wordData.definition || null,
          audioUrl: `/api/audio/${wordData.word}.mp3`
        };
        this.words.set(wordId, word);
      });
    });
  }

  async getUnits(): Promise<Unit[]> {
    return Array.from(this.units.values()).sort((a, b) => a.number - b.number);
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    return this.units.get(id);
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const id = randomUUID();
    const newUnit: Unit = { ...unit, id, wordCount: 0 };
    this.units.set(id, newUnit);
    return newUnit;
  }

  async getWordsByUnit(unitId: string): Promise<Word[]> {
    return Array.from(this.words.values()).filter(word => word.unitId === unitId);
  }

  async getWord(id: string): Promise<Word | undefined> {
    return this.words.get(id);
  }

  async createWord(word: InsertWord): Promise<Word> {
    const id = randomUUID();
    const newWord: Word = { ...word, id };
    this.words.set(id, newWord);
    return newWord;
  }

  async getRandomWords(count: number, excludeUnitIds?: string[]): Promise<Word[]> {
    let availableWords = Array.from(this.words.values());
    
    if (excludeUnitIds && excludeUnitIds.length > 0) {
      availableWords = availableWords.filter(word => !excludeUnitIds.includes(word.unitId));
    }
    
    // Shuffle and take requested count
    const shuffled = availableWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getUserProgress(unitId: string, userId = "default_user"): Promise<UserProgress | undefined> {
    const key = `${unitId}-${userId}`;
    return Array.from(this.userProgress.values()).find(p => p.unitId === unitId && p.userId === userId);
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgress(progress.unitId, progress.userId);
    
    if (existing) {
      const updated = { ...existing, ...progress };
      this.userProgress.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: UserProgress = { ...progress, id };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async getAllUserProgress(userId = "default_user"): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async createPracticeAttempt(attempt: InsertPracticeAttempt): Promise<PracticeAttempt> {
    const id = randomUUID();
    const newAttempt: PracticeAttempt = { ...attempt, id };
    this.practiceAttempts.set(id, newAttempt);
    return newAttempt;
  }

  async getPracticeAttempts(wordId: string, userId = "default_user"): Promise<PracticeAttempt[]> {
    return Array.from(this.practiceAttempts.values()).filter(
      attempt => attempt.wordId === wordId && attempt.userId === userId
    );
  }

  async getErrorWords(userId = "default_user"): Promise<(ErrorWord & { word: Word })[]> {
    const errors = Array.from(this.errorWords.values()).filter(
      error => error.userId === userId && !error.resolved
    );
    
    return errors.map(error => {
      const word = this.words.get(error.wordId);
      return { ...error, word: word! };
    }).filter(error => error.word);
  }

  async createOrUpdateErrorWord(errorWord: InsertErrorWord): Promise<ErrorWord> {
    const existing = Array.from(this.errorWords.values()).find(
      error => error.wordId === errorWord.wordId && error.userId === errorWord.userId && !error.resolved
    );

    if (existing) {
      const updated = {
        ...existing,
        attemptCount: existing.attemptCount + 1,
        userSpelling: errorWord.userSpelling,
        lastAttemptedAt: new Date()
      };
      this.errorWords.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newError: ErrorWord = {
        ...errorWord,
        id,
        lastAttemptedAt: new Date(),
        resolved: false
      };
      this.errorWords.set(id, newError);
      return newError;
    }
  }

  async resolveErrorWord(wordId: string, userId = "default_user"): Promise<void> {
    const error = Array.from(this.errorWords.values()).find(
      error => error.wordId === wordId && error.userId === userId && !error.resolved
    );
    
    if (error) {
      error.resolved = true;
      this.errorWords.set(error.id, error);
    }
  }

  async getPracticeSettings(userId = "default_user"): Promise<PracticeSettings | undefined> {
    return Array.from(this.practiceSettings.values()).find(s => s.userId === userId);
  }

  async updatePracticeSettings(settings: InsertPracticeSettings): Promise<PracticeSettings> {
    const existing = await this.getPracticeSettings(settings.userId);
    
    if (existing) {
      const updated = { ...existing, ...settings };
      this.practiceSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newSettings: PracticeSettings = { ...settings, id };
      this.practiceSettings.set(id, newSettings);
      return newSettings;
    }
  }

  // Test Papers
  async getTestPapers(unitId: string): Promise<TestPaper[]> {
    const testPapers = Array.from(this.testPapers.values())
      .filter(paper => paper.unitId === unitId)
      .sort((a, b) => a.paperNumber - b.paperNumber);
    
    // If no test papers exist for this unit, generate them
    if (testPapers.length === 0) {
      return await this.generateTestPapersForUnit(unitId);
    }
    
    return testPapers;
  }

  async createTestPaper(testPaper: InsertTestPaper): Promise<TestPaper> {
    const id = randomUUID();
    const newTestPaper: TestPaper = {
      id,
      ...testPaper,
      createdAt: new Date()
    };
    
    this.testPapers.set(id, newTestPaper);
    return newTestPaper;
  }

  async generateTestPapersForUnit(unitId: string, wordsPerPaper: number = 30): Promise<TestPaper[]> {
    const words = await this.getWordsByUnit(unitId);
    const unit = await this.getUnit(unitId);
    
    if (!words.length || !unit) {
      return [];
    }

    // Clear existing test papers for this unit
    Array.from(this.testPapers.values())
      .filter(paper => paper.unitId === unitId)
      .forEach(paper => this.testPapers.delete(paper.id));

    const testPapers: TestPaper[] = [];
    const totalPapers = Math.ceil(words.length / wordsPerPaper);

    for (let i = 0; i < totalPapers; i++) {
      const startIndex = i * wordsPerPaper;
      const endIndex = Math.min(startIndex + wordsPerPaper, words.length);
      const paperWords = words.slice(startIndex, endIndex);
      
      const testPaper: TestPaper = {
        id: randomUUID(),
        unitId,
        paperNumber: i + 1,
        title: `${unit.title} - Test ${i + 1}`,
        wordsPerPaper,
        wordIds: paperWords.map(w => w.id),
        createdAt: new Date()
      };
      
      this.testPapers.set(testPaper.id, testPaper);
      testPapers.push(testPaper);
    }

    return testPapers;
  }

  async getTestPaperWords(testPaperId: string): Promise<Word[]> {
    const testPaper = this.testPapers.get(testPaperId);
    if (!testPaper) {
      return [];
    }

    const wordIds = testPaper.wordIds as string[];
    return wordIds
      .map(id => this.words.get(id))
      .filter((word): word is Word => word !== undefined);
  }
}

export const storage = new MemStorage();
