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
    <div className="container py-12 space-y-16">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
          Your AI-Powered <span className="text-primary">Wellbeing</span> Companion
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          MindLens analyzes your journal entries, facial expressions, and lifestyle patterns to help you understand and improve your mental wellbeing.
        </p>
        {!user && (
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild><Link to="/auth">Get Started</Link></Button>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={user ? to : "/auth"}>
            <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
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
