import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Camera, Activity, ClipboardList, LayoutDashboard, MessageCircle, Shield } from "lucide-react";

const features = [
  { to: "/journal", icon: BookOpen, title: "AI Journal", desc: "Write daily entries and get AI-powered sentiment analysis" },
  { to: "/mood-camera", icon: Camera, title: "Mood Camera", desc: "Detect facial emotions in real-time with your webcam" },
  { to: "/burnout-check", icon: Activity, title: "Burnout Check", desc: "Predict burnout risk based on your lifestyle inputs" },
  { to: "/questionnaire", icon: ClipboardList, title: "Wellbeing Quiz", desc: "Quick mental health questionnaire for self-assessment" },
  { to: "/dashboard", icon: LayoutDashboard, title: "Insights Dashboard", desc: "View mood trends, scores, and AI-generated suggestions" },
  { to: "/chatbot", icon: MessageCircle, title: "AI Chatbot", desc: "Have a supportive conversation with our wellbeing AI" },
];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="container relative py-12 space-y-20 min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-0 inset-x-0 h-96 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full w-[800px] h-[400px] bg-primary/10 blur-[100px] opacity-70" />
      </div>

      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-8 pt-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 shadow-lg shadow-primary/5 relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/10 animate-pulse" />
          <Brain className="h-10 w-10 text-primary relative z-10" />
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-tight">
          Your AI-Powered <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Wellbeing</span> Companion
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          MindLens analyzes your journal entries, facial expressions, and lifestyle patterns to help you understand and improve your mental wellbeing.
        </p>
        {!user && (
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="h-14 px-8 text-base rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" asChild><Link to="/auth">Get Started</Link></Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5" asChild><Link to="/dashboard">View Dashboard</Link></Button>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={user ? to : "/auth"} className="block group">
            <Card className="h-full bg-card/60 backdrop-blur-md border-primary/10 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-transparent group-hover:from-primary/20 group-hover:to-primary/5 border border-primary/10 transition-colors">
                  <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl mb-2">{title}</CardTitle>
                <CardDescription className="text-base">{desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      {/* Privacy Notice */}
      <section className="max-w-2xl mx-auto">
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="flex-row items-start gap-3">
            <Shield className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div>
              <CardTitle className="text-base">Privacy & Disclaimer</CardTitle>
              <CardDescription className="mt-1">
                MindLens is an educational tool and does <strong>not</strong> provide medical diagnoses or advice. Your data is private and encrypted. If you're experiencing mental health difficulties, please contact a qualified professional or crisis helpline.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
