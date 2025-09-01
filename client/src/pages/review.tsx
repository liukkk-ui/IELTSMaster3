import { useQuery } from "@tanstack/react-query";
import { ErrorReview } from "@/components/error-review";
import type { ErrorWord, Word } from "@shared/schema";

export default function Review() {
  const { data: errorWords, isLoading } = useQuery<(ErrorWord & { word: Word })[]>({
    queryKey: ["/api/error-words"],
  });

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <ErrorReview errorWords={errorWords || []} />
    </main>
  );
}
