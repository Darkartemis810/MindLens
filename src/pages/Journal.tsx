import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Sparkles, Mic, MicOff, Languages, Phone, AlertTriangle } from "lucide-react";
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

  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const recognitionRef = useRef<any>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  const emergencyKeywords = ["suicide", "kill myself", "want to die", "end it all", "end my life", "no reason to live", "can't go on"];

  const checkEmergency = (text: string) => {
    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setContent((prev) => prev + (prev.length > 0 && !prev.endsWith(" ") ? " " : "") + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
          if (event.error !== 'no-speech') {
            toast({ title: "Microphone Error", description: "Could not access microphone or error occurred.", variant: "destructive" });
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [toast]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({ title: "Not Supported", description: "Speech recognition is not supported in this browser.", variant: "destructive" });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language;
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech start error:", e);
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    if (checkEmergency(content)) {
      setShowEmergency(true);
      return;
    }

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

      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 shadow-xl relative">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 dark:bg-primary/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
        <CardContent className="pt-6 space-y-4 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            <Textarea
              placeholder="How are you feeling today? Write freely about your thoughts, feelings, and experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none border-primary/20 focus-visible:ring-indigo-500/50 relative z-10 bg-background/50 backdrop-blur-sm text-base p-4 pb-14 shadow-inner rounded-2xl transition-all duration-300 dark:bg-slate-800/50 dark:border-slate-700"
            />

            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-20 px-2 pointer-events-auto">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-2 py-1.5 rounded-md border border-primary/10 transition-colors hover:border-primary/20">
                <Languages className="w-4 h-4 text-primary/70" />
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (isRecording) {
                      recognitionRef.current?.stop();
                      setIsRecording(false);
                    }
                  }}
                  className="bg-transparent border-none text-sm font-medium text-foreground focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="sm"
                className={`h-9 px-4 gap-2 rounded-full transition-all ${isRecording ? "animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 backdrop-blur-sm dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/50"}`}
                onClick={toggleRecording}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? "Recording..." : "Voice Input"}
              </Button>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={loading || !content.trim()} className="w-full h-12 text-base bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md hover:shadow-lg hover:shadow-indigo-500/25">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
            {loading ? "Analyzing..." : "Analyze & Save"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in relative overflow-hidden border-primary/20 dark:border-slate-700/50 bg-primary/5 dark:bg-slate-900/60 shadow-lg backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex flex-wrap gap-2">
              <Badge className={`px-3 py-1 text-sm ${sentimentColor(result.sentiment)}`}>{result.sentiment}</Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 bg-background/50">{result.emotion}</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-secondary/50">Mood: {result.mood_score}/10</Badge>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm shadow-inner">
              <p className="text-base leading-relaxed">{result.insight}</p>
            </div>
            {result.keywords.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Highlighted Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((k, i) => (
                    <Badge key={i} variant="outline" className="text-sm px-3 py-1 border-primary/10 bg-primary/5 text-foreground/80 hover:bg-primary/10 transition-colors cursor-default">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full border-destructive/50 shadow-2xl shadow-destructive/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" /> Emergency Alert Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We noticed signs of severe distress in your journal. Please know that you are not alone and help is available right now.
              </p>

              <div className="bg-muted p-4 rounded-xl border border-destructive/20 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold">National Crisis Lifeline</p>
                    <a href="tel:988" className="text-xl font-bold text-destructive hover:underline">988</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold">Local Emergency Police</p>
                    <a href="tel:911" className="text-xl font-bold text-destructive hover:underline">911</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowEmergency(false)}>Close</Button>
                <Button variant="destructive" onClick={() => window.location.href = "tel:988"}>
                  <Phone className="h-4 w-4 mr-2" /> Call Help Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
