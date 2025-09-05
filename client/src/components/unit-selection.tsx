import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Unit, UserProgress } from "@shared/schema";

interface UnitSelectionProps {
  units: Unit[];
  progress: UserProgress[];
}

export function UnitSelection({ units, progress }: UnitSelectionProps) {
  const getUnitProgress = (unitId: string) => {
    return progress.find(p => p.unitId === unitId);
  };

  const getProgressPercentage = (unit: Unit, unitProgress?: UserProgress) => {
    if (!unitProgress || unit.wordCount === 0) return 0;
    return Math.round((unitProgress.completedWords / unit.wordCount) * 100);
  };

  const getAccuracy = (unitProgress?: UserProgress) => {
    if (!unitProgress || unitProgress.totalAttempts === 0) return 0;
    return Math.round((unitProgress.correctAttempts / unitProgress.totalAttempts) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-primary';
      case 'intermediate': return 'bg-warning';
      case 'advanced': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  return (
    <section className="lg:col-span-2">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Practice Units</h3>
          <div className="flex items-center space-x-2">
            <Link href="/practice">
              <Button className="hover:opacity-90" data-testid="button-continue-practice">
                Continue Practice
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map((unit) => {
            const unitProgress = getUnitProgress(unit.id);
            const progressPercentage = getProgressPercentage(unit, unitProgress);
            const accuracy = getAccuracy(unitProgress);
            
            return (
              <Link
                key={unit.id}
                href={`/practice/${unit.id}`}
                className="bg-muted/30 rounded-lg p-4 border border-border card-hover cursor-pointer block"
                data-testid={`card-unit-${unit.number}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#82a6c9]">
                      <span className="text-white font-semibold text-sm">
                        {unit.number}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{unit.title}</h4>
                      <p className="text-sm text-muted-foreground">{unit.wordCount} words</p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{unit.difficulty}</span>
                  <span className={`font-medium ${accuracy >= 80 ? 'text-success' : accuracy >= 60 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {accuracy > 0 ? `${accuracy}% accuracy` : 'Not started'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/practice/${unit.id}`;
                    }}
                    data-testid={`button-practice-unit-${unit.number}`}
                  >
                    Practice All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={(e) => {
                      e.preventDefault(); 
                      window.location.href = `/test-papers/${unit.id}`;
                    }}
                    data-testid={`button-test-papers-unit-${unit.number}`}
                  >
                    Test Papers
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
