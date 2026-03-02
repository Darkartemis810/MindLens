import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera, Sparkles, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const protocols = [
    {
        id: "step-1",
        number: "01",
        title: "Track",
        description: "Quietly log your emotional state using our secure facial telemetry or simple check-ins.",
        icon: Camera,
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        id: "step-2",
        number: "02",
        title: "Analyze",
        description: "Advanced AI processes your inputs entirely on your device to discover hidden burnout patterns.",
        icon: Sparkles,
        color: "text-purple-500",
        bg: "bg-purple-50"
    },
    {
        id: "step-3",
        number: "03",
        title: "Thrive",
        description: "Receive actionable, empathetic insights to re-regulate your nervous system and regain focus.",
        icon: TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-50"
    }
];

export const LandingProtocol = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.step-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 70%",
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="protocol" ref={containerRef} className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-display font-semibold text-slate-900 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Three steps to reclaiming your cognitive clarity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

                    {/* Connecting line (hidden on mobile) */}
                    <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-slate-100 z-0" />

                    {protocols.map((protocol, index) => {
                        const Icon = protocol.icon;
                        return (
                            <div key={protocol.id} className="step-card relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className={`w-24 h-24 rounded-[2rem] ${protocol.bg} flex items-center justify-center shadow-sm border border-white`}>
                                    <Icon className={`w-10 h-10 ${protocol.color}`} />
                                </div>
                                <div className="space-y-2 max-w-xs">
                                    <h3 className="text-xl font-display font-semibold text-slate-900">
                                        {protocol.number}. {protocol.title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed">
                                        {protocol.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
};
