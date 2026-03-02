import { useRef, useState, useCallback, useEffect } from "react";
import * as faceapi from "face-api.js";
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
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setStreaming(false);
  }, []);

  const detectEmotions = useCallback(async () => {
    if (!videoRef.current || !streamRef.current?.active) return;

    simIntervalRef.current = setInterval(async () => {
      if (videoRef.current && streamRef.current?.active) {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
        ).withFaceExpressions();

        if (detection) {
          const expressions = detection.expressions;
          const dominantEmotion = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
          setEmotion(dominantEmotion[0]);
          setConfidence(Math.round(dominantEmotion[1] * 100));
        }
      }
    }, 500);
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        toast({ title: "Model Error", description: "Failed to load emotion detection models.", variant: "destructive" });
      }
    };
    loadModels();
  }, [toast]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true);
        // Execute real emotion detection using face-api.js
        detectEmotions();
      }
    } catch {
      toast({ title: "Camera Error", description: "Could not access webcam. Please allow camera permissions.", variant: "destructive" });
    }
  }, [toast, detectEmotions]);

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
    <div className="container max-w-3xl py-8 space-y-8 relative min-h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Background Glows */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-secondary/15 dark:bg-secondary/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/15 dark:bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="space-y-3 text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 mb-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
          <Camera className="h-8 w-8 text-primary relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <h1 className="text-3xl font-display font-bold">
          Mood <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Camera</span>
        </h1>
        <p className="text-muted-foreground text-lg">Use your webcam to detect facial emotions in real-time.</p>
      </div>

      <Card className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-xl border-primary/10 dark:border-slate-700/50 shadow-xl shadow-primary/5 dark:shadow-none rounded-3xl overflow-hidden relative p-2">
        <CardContent className="pt-4 space-y-6">
          <div className="relative aspect-video bg-background/50 dark:bg-slate-800/50 backdrop-blur-sm border border-primary/20 dark:border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${streaming ? "" : "hidden"}`} />
            {!streaming && (
              <div className="text-center space-y-3 p-6 animate-pulse">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CameraOff className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-base text-muted-foreground font-medium">Camera is off</p>
              </div>
            )}
            {streaming && emotion && (
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-primary/20 dark:border-slate-700 rounded-2xl p-4 shadow-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-4xl filter drop-shadow-sm">{emotionEmoji[emotion] || "🤔"}</span>
                  <div className="text-left">
                    <p className="font-bold capitalize text-lg text-foreground/90 leading-none">{emotion}</p>
                    <p className="text-sm text-primary font-medium mt-1">Confidence: {confidence}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!streaming ? (
              <Button onClick={startCamera} disabled={!isModelsLoaded} className="flex-1 h-14 text-base rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md transition-all hover:-translate-y-0.5">
                <Camera className="h-5 w-5 mr-2" /> {isModelsLoaded ? "Start Camera" : "Loading Models..."}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={stopCamera} className="flex-1 h-14 text-base rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"><CameraOff className="h-5 w-5 mr-2" /> Stop & Clear</Button>
                <Button onClick={saveMood} disabled={!emotion} className="flex-1 h-14 text-base rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md transition-all hover:-translate-y-0.5"><Save className="h-5 w-5 mr-2" /> Save Reading</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {emotion && (
        <Card className="animate-fade-in bg-card/60 dark:bg-slate-900/60 backdrop-blur-md border-primary/10 dark:border-slate-700/50 shadow-lg dark:shadow-none relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">Latest Detection</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-background/50 rounded-2xl border border-primary/10 shadow-sm">
                  <span className="text-4xl block">{emotionEmoji[emotion]}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold capitalize bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{emotion}</p>
                  <Badge variant="outline" className="mt-1 bg-primary/5 border-primary/20 text-primary">{confidence}% Match</Badge>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">Ready to record</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
