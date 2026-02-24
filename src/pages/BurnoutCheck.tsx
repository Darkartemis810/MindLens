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

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sleep (hours/day)</Label>
              <Input type="number" min={0} max={24} value={sleepHours} onChange={(e) => setSleepHours(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Study (hours/day)</Label>
              <Input type="number" min={0} max={24} value={studyHours} onChange={(e) => setStudyHours(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Screen Time (hours/day)</Label>
              <Input type="number" min={0} max={24} value={screenTime} onChange={(e) => setScreenTime(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Social Interaction (1-10)</Label>
              <Input type="number" min={1} max={10} value={socialInteraction} onChange={(e) => setSocialInteraction(+e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Self-Reported Stress Level: {stressLevel[0]}/10</Label>
            <Slider value={stressLevel} onValueChange={setStressLevel} min={1} max={10} step={1} />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            {loading ? "Analyzing..." : "Check Burnout Risk"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Burnout Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge className={`text-lg px-4 py-1 ${riskColor(result.risk_level)}`}>{result.risk_level} Risk</Badge>
            <div>
              <p className="text-sm font-medium mb-2">Personalized Tips:</p>
              <ul className="space-y-1">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {tip}
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
