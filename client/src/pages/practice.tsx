import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { PracticeInterface } from "@/components/practice-interface";
import type { Word, ErrorWord } from "@shared/schema";

export default function Practice() {
  const [, params] = useRoute("/practice/:unitId");
  const [, reviewParams] = useRoute("/practice/review");
  const [, testPaperParams] = useRoute("/practice/test-paper/:testPaperId");
  const unitId = params?.unitId;
  const testPaperId = testPaperParams?.testPaperId;
  const isReviewMode = !!reviewParams;
  const isTestPaperMode = !!testPaperId;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  // Fetch words based on mode - review, test paper, specific unit, or random practice
  const { data: words, isLoading } = useQuery<Word[]>({
    queryKey: isReviewMode 
      ? ["/api/error-words"] 
      : isTestPaperMode 
        ? ["/api/test-papers", testPaperId, "words"] 
        : unitId 
          ? ["/api/units", unitId, "words"] 
          : ["/api/words/random"],
    queryFn: async ({ queryKey }) => {
      if (isReviewMode) {
        const response = await fetch('/api/error-words');
        if (!response.ok) throw new Error('Failed to fetch error words');
        const errorWords: (ErrorWord & { word: Word })[] = await response.json();
        return errorWords.map(errorWord => errorWord.word); // Extract just the word data
      } else if (isTestPaperMode) {
        const response = await fetch(`/api/test-papers/${testPaperId}/words`);
        if (!response.ok) throw new Error('Failed to fetch test paper words');
        return response.json();
      } else if (unitId) {
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

  // Check loading state FIRST to prevent error flashes
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

  // Check if we have no words available
  if (!words || words.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isReviewMode ? "No Error Words to Review" : "No Words Available"}
          </h2>
          <p className="text-muted-foreground">
            {isReviewMode 
              ? "Great job! You don't have any words to review right now."
              : "No words found for practice. Please try again later."
            }
          </p>
        </div>
      </main>
    );
  }

  const currentWord = words[currentWordIndex];

  // Final safety check for current word (shouldn't happen after above checks)
  if (!currentWord) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading word...</h2>
          <p className="text-muted-foreground">Preparing your practice session.</p>
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
        isReviewMode={isReviewMode}
      />
    </main>
  );
}
