import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BurnoutResult {
  risk_level: string;
  tips: string[];
}

export default function BurnoutCheck() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BurnoutResult | null>(null);

  const [sleepHours, setSleepHours] = useState(7);
  const [studyHours, setStudyHours] = useState(6);
  const [screenTime, setScreenTime] = useState(5);
  const [socialInteraction, setSocialInteraction] = useState(5);
  const [stressLevel, setStressLevel] = useState([5]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("predict-burnout", {
        body: { sleepHours, studyHours, screenTime, socialInteraction, stressLevel: stressLevel[0] },
      });

      if (error) throw error;

      const res: BurnoutResult = data;
      setResult(res);

      await supabase.from("burnout_results").insert({
        user_id: user.id,
        sleep_hours: sleepHours,
        study_hours: studyHours,
        screen_time: screenTime,
        social_interaction: socialInteraction,
        stress_level: stressLevel[0],
        risk_level: res.risk_level,
        tips: res.tips,
      });

      toast({ title: "Assessment saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (r: string) => {
    if (r === "Low") return "bg-success text-success-foreground";
    if (r === "Medium") return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" /> Burnout Check
        </h1>
        <p className="text-muted-foreground">Enter your lifestyle data to predict your burnout risk level.</p>
      </div>

      <Card className="border-primary/10 shadow-lg shadow-primary/5 bg-card/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute overflow-hidden inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        </div>
        <CardContent className="pt-8 space-y-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base text-foreground/80">Sleep (hours/day)</Label>
              <Input type="number" min={0} max={24} value={sleepHours === 0 ? "" : sleepHours} onChange={(e) => setSleepHours(Math.min(24, Math.max(0, +e.target.value)))} className="bg-background/50 border-primary/20 h-11 text-lg" />
            </div>
            <div className="space-y-3">
              <Label className="text-base text-foreground/80">Study (hours/day)</Label>
              <Input type="number" min={0} max={24} value={studyHours === 0 ? "" : studyHours} onChange={(e) => setStudyHours(Math.min(24, Math.max(0, +e.target.value)))} className="bg-background/50 border-primary/20 h-11 text-lg" />
            </div>
            <div className="space-y-3">
              <Label className="text-base text-foreground/80">Screen Time (hours/day)</Label>
              <Input type="number" min={0} max={24} value={screenTime === 0 ? "" : screenTime} onChange={(e) => setScreenTime(Math.min(24, Math.max(0, +e.target.value)))} className="bg-background/50 border-primary/20 h-11 text-lg" />
            </div>
            <div className="space-y-3">
              <Label className="text-base text-foreground/80">Social Interaction (1-10)</Label>
              <Input type="number" min={1} max={10} value={socialInteraction === 0 ? "" : socialInteraction} onChange={(e) => setSocialInteraction(Math.min(10, Math.max(1, +e.target.value)))} className="bg-background/50 border-primary/20 h-11 text-lg" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <Label className="text-base text-foreground/80">Self-Reported Stress Level</Label>
              <span className="font-display font-bold text-xl text-primary">{stressLevel[0]}/10</span>
            </div>
            <Slider value={stressLevel} onValueChange={setStressLevel} min={1} max={10} step={1} className="py-2" />
          </div>

          <div className="pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="w-full h-14 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Activity className="h-6 w-6 mr-2" />}
              {loading ? "Analyzing Lifestyle Data..." : "Predict Burnout Risk"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in relative overflow-hidden border-primary/20 bg-primary/5 shadow-lg">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none" />
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Risk</span>
              <Badge className={`text-lg px-4 py-1.5 shadow-sm ${riskColor(result.risk_level)}`}>{result.risk_level}</Badge>
            </div>

            <div className="p-5 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm shadow-inner space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Personalized Action Plan</p>
              <ul className="space-y-3">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-base text-foreground/90 flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
