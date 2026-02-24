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
        supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(7),
        supabase.from("mood_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(7),
        supabase.from("burnout_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("questionnaire_scores").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      ]);
      setJournals(jRes.data || []);
      setMoods(mRes.data || []);
      setBurnout(bRes.data?.[0] || null);
      setQuestionnaire(qRes.data?.[0] || null);

      // Get AI suggestions
      setLoadingSuggestions(true);
      try {
        const { data } = await supabase.functions.invoke("ai-suggestions", {
          body: {
            latestJournal: jRes.data?.[0],
            latestMood: mRes.data?.[0],
            latestBurnout: bRes.data?.[0],
            latestQuestionnaire: qRes.data?.[0],
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
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6 text-primary" /> Insights Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Mood */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Journal Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestJournal ? (
              <>
                <p className="text-3xl font-bold">{latestJournal.mood_score}/10</p>
                <Badge variant="outline" className="mt-1">{latestJournal.emotion}</Badge>
              </>
            ) : <p className="text-sm text-muted-foreground">No entries yet</p>}
          </CardContent>
        </Card>

        {/* Camera Emotion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Camera className="h-4 w-4" /> Camera Emotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestMood ? (
              <>
                <p className="text-3xl font-bold capitalize">{latestMood.emotion}</p>
                <Badge variant="outline" className="mt-1">{latestMood.confidence}% confidence</Badge>
              </>
            ) : <p className="text-sm text-muted-foreground">No snapshots yet</p>}
          </CardContent>
        </Card>

        {/* Burnout Risk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="h-4 w-4" /> Burnout Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            {burnout ? (
              <Badge className={`text-lg px-3 py-1 ${riskColor(burnout.risk_level)}`}>{burnout.risk_level}</Badge>
            ) : <p className="text-sm text-muted-foreground">Not assessed</p>}
          </CardContent>
        </Card>

        {/* Questionnaire */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Brain className="h-4 w-4" /> Wellbeing Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questionnaire ? (
              <>
                <p className="text-3xl font-bold">{questionnaire.total_score}/24</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">A:{questionnaire.anxiety_score}</Badge>
                  <Badge variant="outline" className="text-xs">S:{questionnaire.stress_score}</Badge>
                  <Badge variant="outline" className="text-xs">F:{questionnaire.fatigue_score}</Badge>
                </div>
              </>
            ) : <p className="text-sm text-muted-foreground">Not taken yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      {moodChartData.length > 1 && (
        <Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" /> AI Suggestions
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
        <Card>
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
