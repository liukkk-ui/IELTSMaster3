import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Volume2, X, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Word } from "@shared/schema";

interface PracticeInterfaceProps {
  word: Word;
  currentIndex: number;
  totalWords: number;
  onNext: () => void;
  onPrevious: () => void;
  onStatsUpdate: (isCorrect: boolean) => void;
  sessionStats: {
    correct: number;
    incorrect: number;
    total: number;
  };
  unitId?: string;
}

export function PracticeInterface({
  word,
  currentIndex,
  totalWords,
  onNext,
  onPrevious,
  onStatsUpdate,
  sessionStats,
  unitId
}: PracticeInterfaceProps) {
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctSpelling: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitAttemptMutation = useMutation({
    mutationFn: async (attemptData: {
      wordId: string;
      userSpelling: string;
      isCorrect: boolean;
      userId: string;
    }) => {
      const response = await apiRequest("POST", "/api/practice-attempts", {
        ...attemptData,
        attemptedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/error-words"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (unitId) {
        queryClient.invalidateQueries({ queryKey: ["/api/progress", unitId] });
      }
    }
  });

  const spellCheckMutation = useMutation({
    mutationFn: async (data: { wordId: string; userSpelling: string }) => {
      const response = await apiRequest("POST", "/api/spell-check", data);
      return response.json();
    },
    onSuccess: (result) => {
      setFeedback({
        show: true,
        isCorrect: result.isCorrect,
        correctSpelling: result.correctSpelling
      });
      
      onStatsUpdate(result.isCorrect);
      
      // Submit the attempt
      submitAttemptMutation.mutate({
        wordId: word.id,
        userSpelling: result.userSpelling,
        isCorrect: result.isCorrect,
        userId: "default_user"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check spelling. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!userInput.trim()) {
      toast({
        title: "Please enter a word",
        description: "Type your spelling before submitting.",
        variant: "destructive"
      });
      return;
    }

    spellCheckMutation.mutate({
      wordId: word.id,
      userSpelling: userInput.trim()
    });
  };

  const handleNext = () => {
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    onNext();
  };

  const handlePrevious = () => {
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    onPrevious();
  };

  const handleSkip = () => {
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    onNext();
  };

  const playAudio = () => {
    // Simple audio feedback using Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.8;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Audio not available",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !feedback) {
      handleSubmit();
    } else if (e.key === "Enter" && feedback) {
      handleNext();
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / totalWords) * 100);
  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-8">
      {/* Practice Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {unitId ? `Unit Practice` : "Random Practice"}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span data-testid="text-word-progress">Word {currentIndex + 1} of {totalWords}</span>
            <span data-testid="text-accuracy">Accuracy: {accuracy}%</span>
            <span data-testid="text-session-stats">
              Correct: {sessionStats.correct} | Incorrect: {sessionStats.incorrect}
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          data-testid="button-exit-practice"
        >
          <X className="mr-2 h-4 w-4" />
          Exit
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-secondary rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Word Practice Area */}
      <div className="text-center mb-8">
        <div className="mb-6">
          <Button
            onClick={playAudio}
            className="w-16 h-16 rounded-full mb-4 hover:opacity-90"
            data-testid="button-play-audio"
          >
            <Volume2 className="h-6 w-6" />
          </Button>
          <p className="text-sm text-muted-foreground mb-2">Listen and spell the word</p>
          {word.phonetic && (
            <div className="text-lg text-muted-foreground font-mono">{word.phonetic}</div>
          )}
        </div>

        {/* Spelling Input */}
        <div className="max-w-md mx-auto mb-6">
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`text-2xl text-center py-4 px-6 ${
              feedback?.show
                ? feedback.isCorrect
                  ? "border-success bg-success/5"
                  : "border-destructive bg-destructive/5"
                : ""
            }`}
            placeholder="Type the word here..."
            disabled={feedback?.show || spellCheckMutation.isPending}
            data-testid="input-spelling"
          />
          
          {feedback?.show && (
            <div className="mt-2 text-sm">
              {feedback.isCorrect ? (
                <div className="text-success">
                  <span className="font-medium">✓ Correct!</span> Well done.
                </div>
              ) : (
                <div className="text-destructive">
                  <span className="font-medium">✗ Incorrect.</span> The correct spelling is: <strong>{feedback.correctSpelling}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            data-testid="button-previous"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {!feedback?.show ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleSkip}
                data-testid="button-skip"
              >
                Skip
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={spellCheckMutation.isPending}
                data-testid="button-submit"
              >
                {spellCheckMutation.isPending ? "Checking..." : "Submit"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowHint(!showHint)}
                data-testid="button-hint"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Hint
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={currentIndex >= totalWords - 1}
              data-testid="button-next"
            >
              {currentIndex >= totalWords - 1 ? "Complete" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Hint */}
        {showHint && word.definition && (
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Hint:</p>
            <p className="text-foreground">{word.definition}</p>
          </div>
        )}

        {/* Word Definition */}
        {word.definition && (
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Definition:</p>
            <p className="text-foreground">{word.definition}</p>
          </div>
        )}
      </div>
    </div>
  );
}
