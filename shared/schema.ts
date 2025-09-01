import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull(), // "Beginner", "Intermediate", "Advanced"
  wordCount: integer("word_count").notNull().default(0),
});

export const words = pgTable("words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull().references(() => units.id),
  word: text("word").notNull(),
  phonetic: text("phonetic"),
  definition: text("definition"),
  audioUrl: text("audio_url"),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull().references(() => units.id),
  userId: text("user_id").notNull().default("default_user"), // simplified for demo
  completedWords: integer("completed_words").notNull().default(0),
  totalAttempts: integer("total_attempts").notNull().default(0),
  correctAttempts: integer("correct_attempts").notNull().default(0),
  lastPracticedAt: timestamp("last_practiced_at"),
});

export const practiceAttempts = pgTable("practice_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wordId: varchar("word_id").notNull().references(() => words.id),
  userId: text("user_id").notNull().default("default_user"),
  userSpelling: text("user_spelling").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptedAt: timestamp("attempted_at").notNull().default(sql`now()`),
});

export const errorWords = pgTable("error_words", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  wordId: varchar("word_id").notNull().references(() => words.id),
  userId: text("user_id").notNull().default("default_user"),
  userSpelling: text("user_spelling").notNull(),
  attemptCount: integer("attempt_count").notNull().default(1),
  lastAttemptedAt: timestamp("last_attempted_at").notNull().default(sql`now()`),
  resolved: boolean("resolved").notNull().default(false),
});

export const practiceSettings = pgTable("practice_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().default("default_user"),
  playAudioAutomatically: boolean("play_audio_automatically").notNull().default(true),
  showDefinitions: boolean("show_definitions").notNull().default(true),
  practiceSpeed: text("practice_speed").notNull().default("normal"), // "slow", "normal", "fast"
});

// Insert schemas
export const insertUnitSchema = createInsertSchema(units).omit({ id: true, wordCount: true });
export const insertWordSchema = createInsertSchema(words).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertPracticeAttemptSchema = createInsertSchema(practiceAttempts).omit({ id: true });
export const insertErrorWordSchema = createInsertSchema(errorWords).omit({ id: true });
export const insertPracticeSettingsSchema = createInsertSchema(practiceSettings).omit({ id: true });

// Types
export type Unit = typeof units.$inferSelect;
export type Word = typeof words.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type PracticeAttempt = typeof practiceAttempts.$inferSelect;
export type ErrorWord = typeof errorWords.$inferSelect;
export type PracticeSettings = typeof practiceSettings.$inferSelect;

export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertPracticeAttempt = z.infer<typeof insertPracticeAttemptSchema>;
export type InsertErrorWord = z.infer<typeof insertErrorWordSchema>;
export type InsertPracticeSettings = z.infer<typeof insertPracticeSettingsSchema>;
