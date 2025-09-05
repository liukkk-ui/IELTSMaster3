import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Unit, TestPaper } from "@shared/schema";

export default function TestPapersPage() {
  const { unitId } = useParams<{ unitId: string }>();

  const { data: unit, isLoading: unitLoading } = useQuery<Unit>({
    queryKey: ["/api/units", unitId],
  });

  const { data: testPapers, isLoading: papersLoading } = useQuery<TestPaper[]>({
    queryKey: ["/api/units", unitId, "test-papers"],
  });

  const generatePapersMutation = useMutation({
    mutationFn: async ({ wordsPerPaper, useExcelStructure }: { wordsPerPaper: number, useExcelStructure: boolean }) => {
      const response = await fetch(`/api/units/${unitId}/generate-test-papers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordsPerPaper, useExcelStructure }),
      });
      if (!response.ok) throw new Error("Failed to generate test papers");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units", unitId, "test-papers"] });
    },
  });

  const handleGeneratePapers = (wordsPerPaper: number, useExcelStructure: boolean = true) => {
    generatePapersMutation.mutate({ wordsPerPaper, useExcelStructure });
  };

  if (unitLoading || papersLoading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!unit) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unit not found</h1>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {unit.title} - Test Papers
            </h1>
            <p className="text-muted-foreground">
              {unit.wordCount} words • {unit.difficulty}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleGeneratePapers(30, true)}
            disabled={generatePapersMutation.isPending}
            data-testid="button-generate-excel"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate from Excel
          </Button>
          <Button 
            onClick={() => handleGeneratePapers(30, false)}
            disabled={generatePapersMutation.isPending}
            variant="outline"
            data-testid="button-generate-custom"
          >
            <Plus className="w-4 h-4 mr-2" />
            Custom (30 words)
          </Button>
        </div>
      </div>

      {/* Test Papers Grid */}
      {testPapers && testPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testPapers.map((paper, index) => (
            <Card key={paper.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Test Paper {index + 1}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Words</span>
                  <span className="font-medium">{paper.wordsPerPaper}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    0/{paper.wordsPerPaper}
                  </span>
                </div>
                
                <Progress 
                  value={0} 
                  className="h-2"
                />
                
                <div className="flex gap-2 pt-2">
                  <Link href={`/practice/test-paper/${paper.id}`} className="flex-1">
                    <Button 
                      className="w-full" 
                      size="sm"
                      data-testid={`button-start-test-${index + 1}`}
                    >
                      Start
                    </Button>
                  </Link>
                  {false && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Reset progress logic could go here
                      }}
                      data-testid={`button-reset-test-${index + 1}`}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-muted/30 rounded-lg p-8">
            <h3 className="text-lg font-semibold mb-2">No Test Papers Generated</h3>
            <p className="text-muted-foreground mb-6">
              Create test papers to practice in smaller, manageable chunks.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleGeneratePapers(30, true)}
                disabled={generatePapersMutation.isPending}
                data-testid="button-generate-excel-empty"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate from Excel Structure
              </Button>
              <Button 
                onClick={() => handleGeneratePapers(30, false)}
                disabled={generatePapersMutation.isPending}
                variant="outline"
                data-testid="button-generate-custom-empty"
              >
                <Plus className="w-4 h-4 mr-2" />
                Custom 30-word tests
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}