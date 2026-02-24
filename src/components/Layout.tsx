import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Camera, Activity, ClipboardList, LayoutDashboard, MessageCircle, LogOut, Menu, X, User, Moon, Sun } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/mood-camera", label: "Mood Camera", icon: Camera },
  { to: "/burnout-check", label: "Burnout Check", icon: Activity },
  { to: "/questionnaire", label: "Questionnaire", icon: ClipboardList },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chatbot", label: "AI Chat", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Brain className="h-6 w-6" />
            MindLens
          </Link>

          {user && (
            <>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut} className="hidden md:flex text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </>
          )}
        </div>

        {user && mobileOpen && (
          <nav className="md:hidden border-t bg-card p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${location.pathname === to ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start mt-2">
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </nav>
        )}
      </header>

      <main className="animate-fade-in">{children}</main>

      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-xs text-muted-foreground">
          <p>⚠️ MindLens is not a medical tool. It does not provide diagnoses or medical advice. If you're struggling, please reach out to a mental health professional.</p>
          <p className="mt-1">Your data is private and only visible to you.</p>
        </div>
      </footer>
    </div>
  );
}
