import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Target, Trophy, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">FreeSpell</h1>
              <p className="text-sm text-muted-foreground">IELTS Vocabulary Practice</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Master IELTS Vocabulary with FreeSpell
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Practice spelling with the complete Wang Lu IELTS Corpus. Track your progress, 
            review errors, and improve your vocabulary retention with our intelligent learning system.
          </p>
          <div className="space-x-4">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-start-learning"
            >
              Start Learning Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Why Choose FreeSpell?</h3>
          <p className="text-lg text-muted-foreground">
            Everything you need to master IELTS vocabulary in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Complete Wang Lu Corpus</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                7,631 carefully selected IELTS vocabulary words organized into 8 comprehensive chapters.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Smart Practice System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Excel-based test papers, error tracking, and personalized review sessions for optimal learning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor your improvement with detailed statistics and achievement milestones.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>Free & Accessible</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                No hidden fees, no limitations. Start learning immediately with your Replit account.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl font-bold mb-4">Ready to Boost Your IELTS Score?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who've improved their vocabulary with FreeSpell.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started-cta"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 FreeSpell. Built for IELTS success.</p>
        </div>
      </footer>
    </div>
  );
}