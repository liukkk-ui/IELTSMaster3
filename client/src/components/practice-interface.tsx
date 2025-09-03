import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Volume2, X, ChevronLeft, ChevronRight, Lightbulb, Settings } from "lucide-react";
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
  const [dictData, setDictData] = useState<{
    word: string;
    phonetic: string | null;
    partOfSpeech: string | null;
    definition: string | null;
    example: string | null;
    audio: string | null;
  } | null>(null);
  const [loadingDict, setLoadingDict] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.8,
    pitch: 1,
    volume: 0.8,
    accent: 'us' // 'us', 'uk', 'au'
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Auto-select best voice based on accent preference
      const preferredVoices = voices.filter(voice => {
        const lang = voice.lang.toLowerCase();
        if (voiceSettings.accent === 'uk') {
          return lang.includes('gb') || lang.includes('en-gb');
        } else if (voiceSettings.accent === 'au') {
          return lang.includes('au') || lang.includes('en-au');
        } else {
          return lang.includes('us') || lang.includes('en-us') || (!lang.includes('gb') && !lang.includes('au') && lang.startsWith('en'));
        }
      });
      
      if (preferredVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(preferredVoices[0]);
      } else if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceSettings.accent, selectedVoice]);

  const submitAttemptMutation = useMutation({
    mutationFn: async (attemptData: {
      wordId: string;
      userSpelling: string;
      isCorrect: boolean;
      userId: string;
    }) => {
      const response = await apiRequest("POST", "/api/practice-attempts", attemptData);
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
    setDictData(null);
    onNext();
  };

  const handlePrevious = () => {
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    setDictData(null);
    onPrevious();
  };

  const handleSkip = () => {
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    onNext();
  };

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Audio not available",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive"
      });
    }
  };

  const getVoicesByAccent = (accent: string) => {
    return availableVoices.filter(voice => {
      const lang = voice.lang.toLowerCase();
      switch (accent) {
        case 'uk':
          return lang.includes('gb') || lang.includes('en-gb');
        case 'au':
          return lang.includes('au') || lang.includes('en-au');
        case 'us':
        default:
          return lang.includes('us') || lang.includes('en-us') || (!lang.includes('gb') && !lang.includes('au') && lang.startsWith('en'));
      }
    });
  };

  const changeAccent = (accent: string) => {
    setVoiceSettings(prev => ({ ...prev, accent }));
    const voicesForAccent = getVoicesByAccent(accent);
    if (voicesForAccent.length > 0) {
      setSelectedVoice(voicesForAccent[0]);
    }
  };

  const fetchDefinition = async (wordText: string) => {
    setLoadingDict(true);
    try {
      const response = await fetch(`/api/dictionary/${encodeURIComponent(wordText)}`);
      if (response.ok) {
        const data = await response.json();
        setDictData(data);
      } else {
        setDictData(null);
      }
    } catch (error) {
      console.error('Failed to fetch definition:', error);
      setDictData(null);
    } finally {
      setLoadingDict(false);
    }
  };

  const toggleHint = () => {
    const newShowHint = !showHint;
    setShowHint(newShowHint);
    
    if (newShowHint && !dictData) {
      fetchDefinition(word.word);
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Button
              onClick={playAudio}
              className="w-16 h-16 rounded-full hover:opacity-90"
              data-testid="button-play-audio"
            >
              <Volume2 className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="h-8 w-8 p-0"
              data-testid="button-voice-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="bg-muted/30 rounded-lg p-4 mb-4 max-w-md mx-auto">
              <h4 className="font-medium text-foreground mb-3">Voice Settings</h4>
              
              {/* Accent Selection */}
              <div className="mb-3">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Accent</label>
                <div className="flex gap-2">
                  {[
                    { value: 'us', label: 'US', flag: '🇺🇸' },
                    { value: 'uk', label: 'UK', flag: '🇬🇧' },
                    { value: 'au', label: 'AU', flag: '🇦🇺' }
                  ].map((accent) => (
                    <Button
                      key={accent.value}
                      variant={voiceSettings.accent === accent.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeAccent(accent.value)}
                      className="flex items-center gap-1"
                      data-testid={`button-accent-${accent.value}`}
                    >
                      <span>{accent.flag}</span>
                      <span>{accent.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              {availableVoices.length > 0 && (
                <div className="mb-3">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Voice</label>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      setSelectedVoice(voice || null);
                    }}
                    className="w-full p-2 rounded border border-border bg-background text-foreground text-sm"
                    data-testid="select-voice"
                  >
                    {getVoicesByAccent(voiceSettings.accent).map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speed Control */}
              <div className="mb-3">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Speed: {voiceSettings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  className="w-full"
                  data-testid="slider-speed"
                />
              </div>

              {/* Volume Control */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Volume: {Math.round(voiceSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                  data-testid="slider-volume"
                />
              </div>
            </div>
          )}
          
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
                onClick={toggleHint}
                disabled={loadingDict}
                data-testid="button-hint"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {loadingDict ? 'Loading...' : 'Hint'}
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
        {showHint && (
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-3">💡 Hint:</p>
            
            {/* Word Length */}
            <div className="mb-3">
              <p className="text-foreground">
                <span className="font-medium">Length:</span> {word.word.length} letters
              </p>
            </div>

            {/* Dictionary Definition */}
            {loadingDict ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-muted-foreground">Loading definition...</div>
              </div>
            ) : dictData ? (
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Definition:</span>
                  <p className="text-foreground mt-1">{dictData.definition}</p>
                </div>
                {dictData.partOfSpeech && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Part of Speech:</span>
                    <span className="text-foreground ml-2 italic">{dictData.partOfSpeech}</span>
                  </div>
                )}
                {dictData.example && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Example:</span>
                    <p className="text-foreground mt-1 italic">"{dictData.example}"</p>
                  </div>
                )}
                {dictData.phonetic && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phonetic:</span>
                    <span className="text-foreground ml-2 font-mono">{dictData.phonetic}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No definition available for this word.
              </div>
            )}
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
