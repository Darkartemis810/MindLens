import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  sentiment: string;
  emotion: string;
  mood_score: number;
  insight: string;
  keywords: string[];
}

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-journal", {
        body: { content },
      });

      if (error) throw error;
      
      const analysis: AnalysisResult = data;
      setResult(analysis);

      // Save to DB
      await supabase.from("journal_entries").insert({
        user_id: user.id,
        content,
        sentiment: analysis.sentiment,
        emotion: analysis.emotion,
        mood_score: analysis.mood_score,
        ai_insight: analysis.insight,
        keywords: analysis.keywords,
      });

      toast({ title: "Journal saved", description: "Your entry has been analyzed and saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to analyze journal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor = (s: string) => {
    if (s === "positive") return "bg-success text-success-foreground";
    if (s === "negative") return "bg-destructive text-destructive-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Journal Entry
        </h1>
        <p className="text-muted-foreground">Write about your day — our AI will analyze your mood and emotions.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="How are you feeling today? Write freely about your thoughts, feelings, and experiences..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <Button onClick={handleSubmit} disabled={loading || !content.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing..." : "Analyze & Save"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={sentimentColor(result.sentiment)}>{result.sentiment}</Badge>
              <Badge variant="outline">{result.emotion}</Badge>
              <Badge variant="secondary">Mood: {result.mood_score}/10</Badge>
            </div>
            <p className="text-sm leading-relaxed">{result.insight}</p>
            {result.keywords.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Highlighted Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.map((k, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
