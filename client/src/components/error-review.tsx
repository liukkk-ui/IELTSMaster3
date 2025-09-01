import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Volume2, Play } from "lucide-react";
import type { ErrorWord, Word } from "@shared/schema";

interface ErrorReviewProps {
  errorWords: (ErrorWord & { word: Word })[];
}

export function ErrorReview({ errorWords }: ErrorReviewProps) {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  const playAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleWordSelection = (wordId: string) => {
    setSelectedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  const selectAllWords = () => {
    setSelectedWords(new Set(errorWords.map(error => error.wordId)));
  };

  const clearSelection = () => {
    setSelectedWords(new Set());
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (errorWords.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No Error Words!</h2>
        <p className="text-muted-foreground mb-6">
          Great job! You don't have any words that need review right now.
        </p>
        <Link href="/practice">
          <Button data-testid="button-continue-practice">
            Continue Practice
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Error Review</h2>
          <p className="text-muted-foreground">
            {errorWords.length} word{errorWords.length !== 1 ? 's' : ''} to review
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={selectedWords.size === errorWords.length ? clearSelection : selectAllWords}
            data-testid="button-select-all"
          >
            {selectedWords.size === errorWords.length ? "Clear All" : "Select All"}
          </Button>
          {selectedWords.size > 0 && (
            <Button data-testid="button-practice-selected">
              Practice Selected ({selectedWords.size})
            </Button>
          )}
          <Link href="/practice">
            <Button data-testid="button-start-review">
              <Play className="mr-2 h-4 w-4" />
              Start Review
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {errorWords.map((errorWord) => (
          <div 
            key={errorWord.id} 
            className={`bg-muted/30 rounded-lg p-4 border transition-all cursor-pointer ${
              selectedWords.has(errorWord.wordId) 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => toggleWordSelection(errorWord.wordId)}
            data-testid={`card-error-word-${errorWord.word.word}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">{errorWord.word.word}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(errorWord.word.word);
                }}
                className="w-8 h-8 p-0 hover:bg-primary/20"
                data-testid={`button-play-audio-${errorWord.word.word}`}
              >
                <Volume2 className="h-3 w-3 text-primary" />
              </Button>
            </div>
            
            <div className="space-y-1 text-sm mb-3">
              <p className="text-destructive">
                Your spelling: <span className="font-mono bg-destructive/10 px-1 rounded">
                  {errorWord.userSpelling}
                </span>
              </p>
              <p className="text-muted-foreground">
                Attempts: <span className="font-medium">{errorWord.attemptCount}</span>
              </p>
              <p className="text-muted-foreground">
                Last practiced: {formatTimeAgo(errorWord.lastAttemptedAt)}
              </p>
              {errorWord.word.phonetic && (
                <p className="text-muted-foreground font-mono text-xs">
                  {errorWord.word.phonetic}
                </p>
              )}
            </div>
            
            {errorWord.word.definition && (
              <div className="text-xs text-muted-foreground bg-background/50 rounded p-2 mb-3">
                {errorWord.word.definition}
              </div>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              className="w-full bg-accent/10 border-accent text-accent hover:bg-accent hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to practice for this specific word
              }}
              data-testid={`button-practice-word-${errorWord.word.word}`}
            >
              Practice Again
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
