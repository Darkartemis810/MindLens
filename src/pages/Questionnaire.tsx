import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const questions = [
  { id: "q1", text: "How often do you feel nervous or anxious?", category: "anxiety" },
  { id: "q2", text: "How often do you have trouble relaxing?", category: "anxiety" },
  { id: "q3", text: "How often do you feel overwhelmed by your workload?", category: "stress" },
  { id: "q4", text: "How often do you feel like you can't cope with your responsibilities?", category: "stress" },
  { id: "q5", text: "How often do you feel exhausted even after sleeping?", category: "fatigue" },
  { id: "q6", text: "How often do you lose interest in activities you used to enjoy?", category: "fatigue" },
  { id: "q7", text: "How often do you feel isolated from friends or family?", category: "stress" },
  { id: "q8", text: "How often do you feel hopeful about the future?", category: "anxiety", reverse: true },
];

const options = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" },
];

export default function Questionnaire() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<{ total: number; anxiety: number; stress: number; fatigue: number } | null>(null);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!user || !allAnswered) return;

    let anxiety = 0, stress = 0, fatigue = 0;
    questions.forEach((q) => {
      const val = parseInt(answers[q.id]);
      const score = q.reverse ? 3 - val : val;
      if (q.category === "anxiety") anxiety += score;
      else if (q.category === "stress") stress += score;
      else fatigue += score;
    });
    const total = anxiety + stress + fatigue;

    setScores({ total, anxiety, stress, fatigue });
    setSubmitted(true);

    await supabase.from("questionnaire_scores").insert({
      user_id: user.id,
      answers,
      total_score: total,
      anxiety_score: anxiety,
      stress_score: stress,
      fatigue_score: fatigue,
    });

    toast({ title: "Questionnaire saved" });
  };

  const scoreLabel = (total: number) => {
    if (total <= 6) return { label: "Good", color: "bg-success text-success-foreground" };
    if (total <= 14) return { label: "Moderate", color: "bg-warning text-warning-foreground" };
    return { label: "Needs Attention", color: "bg-destructive text-destructive-foreground" };
  };

  return (
    <div className="container max-w-2xl py-8 space-y-8 relative min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="space-y-3 text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 mb-4 shadow-sm">
          <ClipboardList className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">
          Wellbeing <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Questionnaire</span>
        </h1>
        <p className="text-muted-foreground text-lg">Answer these questions to assess your current mental wellbeing.</p>
      </div>

      {!submitted ? (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <Card key={q.id} className="bg-card/60 backdrop-blur-md border-primary/10 shadow-md hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6">
                <p className="font-medium mb-4 text-foreground/90 text-lg">{i + 1}. {q.text}</p>
                <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })} className="gap-3">
                  {options.map((opt) => (
                    <div key={opt.value} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-primary/5 ${answers[q.id] === opt.value ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-background/50'}`} onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}>
                      <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} className="border-primary/50 text-primary" />
                      <Label htmlFor={`${q.id}-${opt.value}`} className="cursor-pointer text-base font-normal">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-8 rounded-xl">
            <CheckCircle className="h-5 w-5 mr-3" /> Submit Questionnaire
          </Button>
        </div>
      ) : scores && (
        <Card className="animate-fade-in bg-card/60 backdrop-blur-xl border-primary/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <CardHeader className="text-center pb-2 relative z-10">
            <CardTitle className="text-2xl font-display">Your Wellbeing Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 relative z-10 pt-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
                <div className="relative bg-background/80 backdrop-blur-sm border-2 border-primary/20 h-32 w-32 rounded-full flex flex-col items-center justify-center shadow-inner">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">{scores.total}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">out of 24</span>
                </div>
              </div>
              <Badge className={`text-lg px-6 py-2 shadow-sm rounded-full ${scoreLabel(scores.total).color}`}>{scoreLabel(scores.total).label}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-background/50 border border-primary/10 p-4 text-center shadow-sm backdrop-blur-sm hover:-translate-y-1 transition-transform">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Anxiety</p>
                <p className="text-2xl font-bold text-primary">{scores.anxiety}</p>
              </div>
              <div className="rounded-2xl bg-background/50 border border-primary/10 p-4 text-center shadow-sm backdrop-blur-sm hover:-translate-y-1 transition-transform delay-75">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Stress</p>
                <p className="text-2xl font-bold text-primary">{scores.stress}</p>
              </div>
              <div className="rounded-2xl bg-background/50 border border-primary/10 p-4 text-center shadow-sm backdrop-blur-sm hover:-translate-y-1 transition-transform delay-150">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Fatigue</p>
                <p className="text-2xl font-bold text-primary">{scores.fatigue}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); setScores(null); }} className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/5 transition-colors">
              Take Questionnaire Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
