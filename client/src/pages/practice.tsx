import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { PracticeInterface } from "@/components/practice-interface";
import type { Word } from "@shared/schema";

export default function Practice() {
  const [, params] = useRoute("/practice/:unitId");
  const unitId = params?.unitId;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  // Fetch words based on whether we have a unitId or doing random practice
  const { data: words, isLoading } = useQuery<Word[]>({
    queryKey: unitId ? ["/api/units", unitId, "words"] : ["/api/words/random"],
    queryFn: async ({ queryKey }) => {
      if (unitId) {
        const response = await fetch(`/api/units/${unitId}/words`);
        if (!response.ok) throw new Error('Failed to fetch unit words');
        return response.json();
      } else {
        const response = await fetch('/api/words/random?count=20');
        if (!response.ok) throw new Error('Failed to fetch random words');
        return response.json();
      }
    }
  });

  const currentWord = words?.[currentWordIndex];

  const handleNextWord = () => {
    if (words && currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
    }
  };

  const updateSessionStats = (isCorrect: boolean) => {
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      total: prev.total + 1
    }));
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!words || words.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Words Available</h2>
          <p className="text-muted-foreground">No words found for practice.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <PracticeInterface
        word={currentWord}
        currentIndex={currentWordIndex}
        totalWords={words.length}
        onNext={handleNextWord}
        onPrevious={handlePreviousWord}
        onStatsUpdate={updateSessionStats}
        sessionStats={sessionStats}
        unitId={unitId}
      />
    </main>
  );
}
