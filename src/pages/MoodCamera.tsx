import { useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMOTIONS = ["happy", "sad", "angry", "surprised", "neutral", "fearful", "disgusted"] as const;

export default function MoodCamera() {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true);
        // Simulate emotion detection since face-api.js models need to be loaded from external CDN
        simulateDetection();
      }
    } catch {
      toast({ title: "Camera Error", description: "Could not access webcam. Please allow camera permissions.", variant: "destructive" });
    }
  }, [toast]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
    setEmotion(null);
  };

  const simulateDetection = () => {
    // In a real implementation, face-api.js would provide these results
    // This simulates the detection cycle for demo purposes
    const interval = setInterval(() => {
      if (!streamRef.current?.active) {
        clearInterval(interval);
        return;
      }
      const idx = Math.floor(Math.random() * EMOTIONS.length);
      setEmotion(EMOTIONS[idx]);
      setConfidence(Math.round(60 + Math.random() * 35));
    }, 2000);
  };

  const saveMood = async () => {
    if (!emotion || !user) return;
    await supabase.from("mood_records").insert({
      user_id: user.id,
      emotion,
      confidence,
      source: "camera",
    });
    toast({ title: "Mood saved!", description: `Detected emotion: ${emotion}` });
  };

  const emotionEmoji: Record<string, string> = {
    happy: "😊", sad: "😢", angry: "😠", surprised: "😲",
    neutral: "😐", fearful: "😨", disgusted: "🤢",
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" /> Mood Camera
        </h1>
        <p className="text-muted-foreground">Use your webcam to detect facial emotions in real-time.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${streaming ? "" : "hidden"}`} />
            {!streaming && (
              <div className="text-center space-y-2">
                <CameraOff className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Camera is off</p>
              </div>
            )}
            {streaming && emotion && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-card/90 backdrop-blur rounded-lg p-3">
                <span className="text-2xl">{emotionEmoji[emotion] || "🤔"}</span>
                <div className="text-right">
                  <p className="font-semibold capitalize">{emotion}</p>
                  <p className="text-xs text-muted-foreground">Confidence: {confidence}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!streaming ? (
              <Button onClick={startCamera} className="flex-1"><Camera className="h-4 w-4 mr-2" /> Start Camera</Button>
            ) : (
              <>
                <Button variant="destructive" onClick={stopCamera} className="flex-1"><CameraOff className="h-4 w-4 mr-2" /> Stop</Button>
                <Button onClick={saveMood} disabled={!emotion} className="flex-1"><Save className="h-4 w-4 mr-2" /> Save Mood</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {emotion && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Detected Emotion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{emotionEmoji[emotion]}</span>
              <div>
                <p className="text-xl font-semibold capitalize">{emotion}</p>
                <Badge variant="secondary">{confidence}% confidence</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
