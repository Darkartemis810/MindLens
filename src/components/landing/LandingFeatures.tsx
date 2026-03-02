import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Camera, Activity, BookOpen, CheckCircle2 } from 'lucide-react';

export const LandingFeatures = () => {
    return (
        <section id="features" className="py-24 px-4 relative z-10 bg-white">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Section Header */}
                <div className="space-y-4 max-w-2xl text-center mx-auto">
                    <h2 className="text-3xl md:text-5xl font-display font-semibold text-slate-900 tracking-tight">
                        Wellbeing Artifacts
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Premium telemetry instruments designed to quietly map your mind and prevent academic burnout before it starts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <MoodCameraCard />
                    <BurnoutIndexCard />
                    <AIJournalCard />
                </div>
            </div>
        </section>
    );
};

// Card 1: Real-Time Mood Camera
const MoodCameraCard = () => {
    const [mood, setMood] = useState<'calm' | 'focused' | 'tired'>('focused');
    const [confidence, setConfidence] = useState(89);

    useEffect(() => {
        const interval = setInterval(() => {
            const moods: ('calm' | 'focused' | 'tired')[] = ['calm', 'focused', 'tired'];
            setMood(moods[Math.floor(Math.random() * moods.length)]);
            setConfidence(Math.floor(Math.random() * 15) + 80); // 80-95%
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-[2rem] p-8 h-[400px] flex flex-col border border-slate-100 luminous-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl text-secondary">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-display font-semibold text-lg text-slate-900">Real-Time Mood</h3>
                    <p className="text-slate-400 text-sm">Facial telemetry active</p>
                </div>
            </div>

            <div className="flex-1 relative bg-slate-50 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-100/50">
                {/* Subtle Face Reticle */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full text-secondary opacity-20 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
                        <path d="M 50 2 L 50 10 M 50 90 L 50 98 M 2 50 L 10 50 M 90 50 L 98 50" stroke="currentColor" strokeWidth="2" />
                    </svg>

                    {/* Active Emoji */}
                    <div className="text-5xl transition-all duration-500 scale-110">
                        {mood === 'calm' && '😌'}
                        {mood === 'focused' && '🧐'}
                        {mood === 'tired' && '😔'}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2 border border-slate-100">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        Confidence: {confidence}%
                    </div>
                </div>
            </div>
        </div>
    );
};

// Card 2: Burnout Index
const BurnoutIndexCard = () => {
    const [load, setLoad] = useState(30);

    // Calculate color based on load
    const getColor = () => {
        if (load < 40) return '#3B82F6'; // Ethereal Blue
        if (load < 75) return '#8B5CF6'; // Calm Lavender
        return '#F59E0B'; // Soft Orange
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 h-[400px] flex flex-col border border-slate-100 luminous-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl text-secondary">
                    <Activity className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-display font-semibold text-lg text-slate-900">Burnout Index</h3>
                    <p className="text-slate-400 text-sm">Cognitive capacity mapping</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-8 px-2">

                <div className="text-center space-y-2">
                    <div className="text-5xl font-display font-light transition-colors duration-500" style={{ color: getColor() }}>
                        {load}%
                    </div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-widest transition-colors duration-500">
                        {load < 40 ? 'Calm & Regulated' : load < 75 ? 'Elevated Load' : 'Strained Capacity'}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>Calm</span>
                        <span>Strained</span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner cursor-pointer" onClick={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        const percent = ((e.clientX - bounds.left) / bounds.width) * 100;
                        setLoad(Math.max(0, Math.min(100, Math.round(percent))));
                    }}>
                        <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: `${load}%`,
                                backgroundColor: getColor(),
                                boxShadow: `0 0 10px ${getColor()}`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Card 3: AI Journal
const AIJournalCard = () => {
    const textRef = useRef<HTMLParagraphElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const text = "I've been feeling incredibly focused this week. The new study routine is really helping me maintain clarity without burning out.";

        let ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

            // Type text
            if (textRef.current) {
                textRef.current.innerHTML = "";
                tl.to(textRef.current, {
                    delay: 0.5,
                    duration: 2,
                    text: text,
                    ease: "none"
                });
            }

            // Pop up badge
            tl.fromTo(badgeRef.current,
                { y: 10, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );

            // Clean away to restart
            tl.to([textRef.current, badgeRef.current], {
                opacity: 0,
                duration: 0.5,
                delay: 2
            });

        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="bg-white rounded-[2rem] p-8 h-[400px] flex flex-col border border-slate-100 luminous-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-50 rounded-2xl text-accent">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-display font-semibold text-lg text-slate-900">AI Journal</h3>
                    <p className="text-slate-400 text-sm">Emotional synthesis</p>
                </div>
            </div>

            <div className="flex-1 relative bg-slate-50 border border-slate-100/50 rounded-2xl p-6 flex flex-col justify-between">

                <p ref={textRef} className="text-slate-600 text-sm leading-relaxed min-h-[100px]"></p>

                <div className="flex justify-end">
                    <div
                        ref={badgeRef}
                        className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-slate-100 opacity-0"
                    >
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-slate-700">Sentiment: Positive</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
