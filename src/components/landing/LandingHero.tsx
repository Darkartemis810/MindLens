import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ParticleBrain } from './ParticleBrain';

export const LandingHero = () => {
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".stagger-fade-up",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power2.out", delay: 0.2 }
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative min-h-[100dvh] w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 overflow-hidden pt-20"
        >
            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">

                {/* Left Side: Copy & CTA */}
                <div className="text-left space-y-8 pt-10 lg:pt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold tracking-wide stagger-fade-up uppercase">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        MindLens OS 3.0 Active
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-semibold tracking-tight text-slate-900 leading-[1.1] stagger-fade-up">
                        Understand your mind.<br />Prevent burnout.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed stagger-fade-up">
                        Real-time emotional telemetry and AI journaling designed for student wellbeing. Track distress signals before they become crises.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-4 stagger-fade-up">
                        <Link
                            to="/dashboard"
                            className="bg-secondary text-white hover:bg-blue-600 shadow-md hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 px-8 py-4 rounded-full text-base font-semibold tracking-wide w-full sm:w-auto text-center"
                        >
                            Login
                        </Link>
                        <a
                            href="#features"
                            className="px-6 py-4 text-slate-500 hover:text-slate-900 font-medium transition-colors w-full sm:w-auto text-center"
                        >
                            Explore Features
                        </a>
                    </div>
                </div>

                {/* Right Side: 3D Interactive Canvas */}
                <div className="h-[500px] lg:h-[700px] w-full relative stagger-fade-up pointer-events-auto rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/40">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                    <ParticleBrain />
                </div>

            </div>
        </section>
    );
};
