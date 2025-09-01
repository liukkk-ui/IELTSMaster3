import { Book, CheckCircle, AlertTriangle, Trophy } from "lucide-react";

interface DashboardOverviewProps {
  stats?: {
    totalWords: number;
    masteredWords: number;
    errorWords: number;
    currentStreak: number;
    overallAccuracy?: number;
  };
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const defaultStats = {
    totalWords: 0,
    masteredWords: 0,
    errorWords: 0,
    currentStreak: 0,
    overallAccuracy: 0
  };

  const data = stats || defaultStats;
  const completionPercentage = data.totalWords > 0 ? Math.round((data.masteredWords / data.totalWords) * 100) : 0;

  return (
    <section className="mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Continue your IELTS vocabulary journey with Wang Lu Corpus</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Book className="text-primary text-xl" />
            </div>
            <span className="text-2xl font-bold text-foreground" data-testid="text-total-words">
              {data.totalWords}
            </span>
          </div>
          <h3 className="font-medium text-foreground mb-1">Total Words</h3>
          <p className="text-sm text-muted-foreground">Wang Lu Corpus</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success text-xl" />
            </div>
            <span className="text-2xl font-bold text-foreground" data-testid="text-mastered-words">
              {data.masteredWords}
            </span>
          </div>
          <h3 className="font-medium text-foreground mb-1">Mastered</h3>
          <p className="text-sm text-success">{completionPercentage}% Complete</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-warning text-xl" />
            </div>
            <span className="text-2xl font-bold text-foreground" data-testid="text-error-words">
              {data.errorWords}
            </span>
          </div>
          <h3 className="font-medium text-foreground mb-1">Need Review</h3>
          <p className="text-sm text-warning">Recent Errors</p>
        </div>
        
        <div className="bg-card rounded-xl p-6 border border-border card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Trophy className="text-accent text-xl" />
            </div>
            <span className="text-2xl font-bold text-foreground" data-testid="text-current-streak">
              {data.currentStreak}
            </span>
          </div>
          <h3 className="font-medium text-foreground mb-1">Day Streak</h3>
          <p className="text-sm text-accent">Keep it up!</p>
        </div>
      </div>
    </section>
  );
}
