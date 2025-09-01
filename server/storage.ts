import { 
  type Unit, 
  type Word, 
  type UserProgress, 
  type PracticeAttempt, 
  type ErrorWord,
  type PracticeSettings,
  type InsertUnit,
  type InsertWord,
  type InsertUserProgress,
  type InsertPracticeAttempt,
  type InsertErrorWord,
  type InsertPracticeSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private units: Map<string, Unit> = new Map();
  private words: Map<string, Word> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private practiceAttempts: Map<string, PracticeAttempt> = new Map();
  private errorWords: Map<string, ErrorWord> = new Map();
  private practiceSettings: Map<string, PracticeSettings> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize Wang Lu IELTS Corpus units and words
    const unitsData = [
      { number: 1, title: "Academic Vocabulary", description: "Essential academic terms for IELTS", difficulty: "Beginner" },
      { number: 2, title: "Travel & Transport", description: "Travel and transportation vocabulary", difficulty: "Beginner" },
      { number: 3, title: "Science & Technology", description: "Scientific and technological terms", difficulty: "Intermediate" },
      { number: 4, title: "Environment & Nature", description: "Environmental and nature-related vocabulary", difficulty: "Intermediate" },
      { number: 5, title: "Business & Economy", description: "Business and economic terminology", difficulty: "Advanced" },
    ];

    const wordsData = [
      // Unit 1: Academic Vocabulary
      { unitNumber: 1, words: [
        { word: "academic", phonetic: "/ˌækəˈdemɪk/", definition: "Relating to education and scholarship; theoretical rather than practical" },
        { word: "analysis", phonetic: "/əˈnæləsɪs/", definition: "Detailed examination of the elements or structure of something" },
        { word: "approach", phonetic: "/əˈproʊtʃ/", definition: "A way of dealing with something; a method or strategy" },
        { word: "assessment", phonetic: "/əˈsesmənt/", definition: "The evaluation or estimation of the nature, quality, or ability of someone or something" },
        { word: "concept", phonetic: "/ˈkɑːnsept/", definition: "An abstract idea; a general notion" },
        { word: "criteria", phonetic: "/kraɪˈtɪriə/", definition: "A principle or standard by which something may be judged or decided" },
        { word: "demonstrate", phonetic: "/ˈdemənstreɪt/", definition: "To clearly show the existence or truth of something by giving proof or evidence" },
        { word: "evaluate", phonetic: "/ɪˈvæljueɪt/", definition: "To form an idea of the amount, number, or value of; assess" },
        { word: "hypothesis", phonetic: "/haɪˈpɑːθəsɪs/", definition: "A supposition or proposed explanation made on the basis of limited evidence" },
        { word: "methodology", phonetic: "/ˌmeθəˈdɑːlədʒi/", definition: "A system of methods used in a particular area of study or activity" }
      ]},
      // Unit 2: Travel & Transport
      { unitNumber: 2, words: [
        { word: "accommodation", phonetic: "/əˌkɑːməˈdeɪʃn/", definition: "A room, group of rooms, or building in which someone may live or stay" },
        { word: "departure", phonetic: "/dɪˈpɑːrtʃər/", definition: "The action of leaving, typically to start a journey" },
        { word: "destination", phonetic: "/ˌdestɪˈneɪʃn/", definition: "The place to which someone or something is going or being sent" },
        { word: "itinerary", phonetic: "/aɪˈtɪnəreri/", definition: "A planned route or journey" },
        { word: "passenger", phonetic: "/ˈpæsɪndʒər/", definition: "A traveler on a public or private conveyance other than the driver, pilot, or crew" },
        { word: "reservation", phonetic: "/ˌrezərˈveɪʃn/", definition: "The action of reserving something; a booking" },
        { word: "terminal", phonetic: "/ˈtɜːrmɪnl/", definition: "A building at an airport where passengers transfer between ground transportation and the facilities" },
        { word: "transport", phonetic: "/ˈtrænspɔːrt/", definition: "Take or carry people or goods from one place to another by means of a vehicle, aircraft, or ship" },
        { word: "voyage", phonetic: "/ˈvɔɪɪdʒ/", definition: "A long journey involving travel by sea or in space" },
        { word: "luggage", phonetic: "/ˈlʌɡɪdʒ/", definition: "Suitcases or other bags in which to pack personal belongings for traveling" }
      ]},
      // Unit 3: Science & Technology
      { unitNumber: 3, words: [
        { word: "experiment", phonetic: "/ɪkˈsperɪmənt/", definition: "A scientific procedure undertaken to make a discovery, test a hypothesis, or demonstrate a known fact" },
        { word: "innovation", phonetic: "/ˌɪnəˈveɪʃn/", definition: "The action or process of innovating; a new method, idea, product, etc." },
        { word: "laboratory", phonetic: "/ˈlæbrətɔːri/", definition: "A room or building equipped for scientific experiments, research, or teaching" },
        { word: "technology", phonetic: "/tekˈnɑːlədʒi/", definition: "The application of scientific knowledge for practical purposes" },
        { word: "research", phonetic: "/rɪˈsɜːrtʃ/", definition: "The systematic investigation into and study of materials and sources" },
        { word: "equipment", phonetic: "/ɪˈkwɪpmənt/", definition: "The necessary items for a particular purpose" },
        { word: "procedure", phonetic: "/prəˈsiːdʒər/", definition: "An established or official way of doing something" },
        { word: "observation", phonetic: "/ˌɑːbzərˈveɪʃn/", definition: "The action or process of observing something or someone carefully" },
        { word: "discovery", phonetic: "/dɪˈskʌvəri/", definition: "The action or process of finding someone or something" },
        { word: "development", phonetic: "/dɪˈveləpmənt/", definition: "The process of developing or being developed" }
      ]}
    ];

    // Create units and track their IDs
    const unitIdMap = new Map<number, string>();
    
    unitsData.forEach(unitData => {
      const unitId = randomUUID();
      const unit: Unit = {
        id: unitId,
        number: unitData.number,
        title: unitData.title,
        description: unitData.description,
        difficulty: unitData.difficulty,
        wordCount: 0
      };
      this.units.set(unitId, unit);
      unitIdMap.set(unitData.number, unitId);
    });

    // Create words for each unit
    wordsData.forEach(unitWords => {
      const unitId = unitIdMap.get(unitWords.unitNumber);
      if (!unitId) return;

      unitWords.words.forEach(wordData => {
        const wordId = randomUUID();
        const word: Word = {
          id: wordId,
          unitId,
          word: wordData.word,
          phonetic: wordData.phonetic,
          definition: wordData.definition,
          audioUrl: `/api/audio/${wordData.word}.mp3`
        };
        this.words.set(wordId, word);
      });

      // Update unit word count
      const unit = this.units.get(unitId);
      if (unit) {
        unit.wordCount = unitWords.words.length;
        this.units.set(unitId, unit);
      }
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
}

export const storage = new MemStorage();
