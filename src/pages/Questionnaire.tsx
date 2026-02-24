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
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" /> Wellbeing Questionnaire
        </h1>
        <p className="text-muted-foreground">Answer these questions to assess your current mental wellbeing.</p>
      </div>

      {!submitted ? (
        <>
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardContent className="pt-6">
                <p className="font-medium mb-3">{i + 1}. {q.text}</p>
                <RadioGroup value={answers[q.id]} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                  {options.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`${q.id}-${opt.value}`} />
                      <Label htmlFor={`${q.id}-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" /> Submit Questionnaire
          </Button>
        </>
      ) : scores && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Your Wellbeing Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{scores.total}</span>
              <span className="text-muted-foreground">/24</span>
              <Badge className={scoreLabel(scores.total).color}>{scoreLabel(scores.total).label}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Anxiety</p>
                <p className="text-xl font-bold">{scores.anxiety}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Stress</p>
                <p className="text-xl font-bold">{scores.stress}</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Fatigue</p>
                <p className="text-xl font-bold">{scores.fatigue}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); setScores(null); }} className="w-full">
              Take Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
