import { useQuery } from "@tanstack/react-query";
import { DashboardOverview } from "@/components/dashboard-overview";
import { UnitSelection } from "@/components/unit-selection";
import { QuickActions } from "@/components/quick-actions";
import type { Unit, UserProgress } from "@shared/schema";

export default function Home() {
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (unitsLoading || progressLoading || statsLoading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-20 bg-muted rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <DashboardOverview stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <UnitSelection units={units || []} progress={progress || []} />
        <QuickActions />
      </div>
    </main>
  );
}
