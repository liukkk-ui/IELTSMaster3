import { Link, useLocation } from "wouter";
import { Settings, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", active: location === "/" },
    { href: "/practice", label: "Practice", active: location.startsWith("/practice") },
    { href: "/review", label: "Review", active: location === "/review" },
  ];

  return (
    <header className="macos-blur border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">FreeSpell</h1>
              <p className="text-sm text-muted-foreground">IELTS Vocabulary Practice</p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 hover:bg-muted"
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
