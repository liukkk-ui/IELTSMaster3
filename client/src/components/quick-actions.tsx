import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Star, CheckCircle, AlertTriangle, Trophy } from "lucide-react";
import type { ErrorWord, Word } from "@shared/schema";

export function QuickActions() {
  const { data: errorWords } = useQuery<(ErrorWord & { word: Word })[]>({
    queryKey: ["/api/error-words"],
  });

  const errorCount = errorWords?.length || 0;

  return (
    <aside>
      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle className="text-success text-xs" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Practice session completed</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-warning text-xs" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Reviewed error words</p>
              <p className="text-xs text-muted-foreground">Yesterday</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Trophy className="text-primary text-xs" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Achieved high accuracy</p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
