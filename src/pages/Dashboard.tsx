import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Brain, Activity, BookOpen, Camera, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [burnout, setBurnout] = useState<any>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [jRes, mRes, bRes, qRes] = await Promise.all([
        supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("mood_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("burnout_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("questionnaire_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setJournals(jRes.data || []);
      setMoods(mRes.data || []);
      setBurnout(bRes.data?.[0] || null);
      setQuestionnaire(qRes.data?.[0] || null);

      // Get Comprehensive AI suggestions
      setLoadingSuggestions(true);
      try {
        const { data } = await supabase.functions.invoke("ai-suggestions", {
          body: {
            journalsData: jRes.data || [],
            moodsData: mRes.data || [],
            burnoutData: bRes.data || [],
            questionnaireData: qRes.data || [],
          },
        });
        setSuggestions(data?.suggestions || []);
      } catch { /* ignore */ }
      setLoadingSuggestions(false);
    };
    load();
  }, [user]);

  const moodChartData = journals.slice().reverse().map((j) => ({
    date: new Date(j.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    mood: j.mood_score || 0,
  }));

  const latestJournal = journals[0];
  const latestMood = moods[0];

  const riskColor = (r: string) => {
    if (r === "Low") return "bg-success text-success-foreground";
    if (r === "Medium") return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="container py-8 space-y-8 relative min-h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/15 dark:bg-secondary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/15 dark:bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <h1 className="text-3xl font-display font-bold flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/10">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        Insights Dashboard
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Mood */}
        <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg shadow-primary/5 dark:shadow-none hover:-translate-y-1 transition-transform group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
              <BookOpen className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Journal Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestJournal ? (
              <>
                <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{latestJournal.mood_score}/10</p>
                <Badge variant="outline" className="mt-2 bg-primary/5 border-primary/10">{latestJournal.emotion}</Badge>
              </>
            ) : <p className="text-sm text-muted-foreground">No entries yet</p>}
          </CardContent>
        </Card>

        {/* Camera Emotion */}
        <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg shadow-primary/5 dark:shadow-none hover:-translate-y-1 transition-transform group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
              <Camera className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Camera Emotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestMood ? (
              <>
                <p className="text-3xl font-bold capitalize bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent truncate">{latestMood.emotion}</p>
                <Badge variant="outline" className="mt-2 bg-primary/5 border-primary/10">{latestMood.confidence}% confidence</Badge>
              </>
            ) : <p className="text-sm text-muted-foreground">No snapshots</p>}
          </CardContent>
        </Card>

        {/* Burnout Risk */}
        <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg shadow-primary/5 dark:shadow-none hover:-translate-y-1 transition-transform group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
              <Activity className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Burnout Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {burnout ? (
              <Badge className={`text-xl px-4 py-1.5 shadow-sm ${riskColor(burnout.risk_level)}`}>{burnout.risk_level}</Badge>
            ) : <p className="text-sm text-muted-foreground pt-1">Not assessed</p>}
          </CardContent>
        </Card>

        {/* Questionnaire */}
        <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg shadow-primary/5 dark:shadow-none hover:-translate-y-1 transition-transform group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
              <Brain className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Wellbeing Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionnaire ? (
              <>
                <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{questionnaire.total_score}<span className="text-2xl text-muted-foreground">/24</span></p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1.5 bg-background/50 border-primary/10 text-muted-foreground">A:{questionnaire.anxiety_score}</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 bg-background/50 border-primary/10 text-muted-foreground">S:{questionnaire.stress_score}</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 bg-background/50 border-primary/10 text-muted-foreground">F:{questionnaire.fatigue_score}</Badge>
                </div>
              </>
            ) : <p className="text-sm text-muted-foreground">Not taken</p>}
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      {moodChartData.length > 1 && (
        <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 10]} className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg dark:shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" /> Comprehensive AI Wellbeing Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSuggestions ? (
            <p className="text-sm text-muted-foreground">Generating suggestions...</p>
          ) : suggestions.length > 0 ? (
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">💡</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Complete some assessments to get personalized suggestions.</p>
          )}
        </CardContent>
      </Card>

      {/* Journal Sentiment */}
      {latestJournal?.ai_insight && (
        <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Latest Journal Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{latestJournal.ai_insight}</p>
            <Badge className="mt-2" variant="outline">{latestJournal.sentiment}</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
