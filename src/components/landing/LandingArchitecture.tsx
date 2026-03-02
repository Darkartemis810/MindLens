import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const LandingArchitecture = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 60%',
                }
            });

            tl.fromTo('.arch-fade',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power2.out' }
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-32 px-4 w-full flex items-center justify-center bg-slate-50 border-y border-slate-100/50"
        >
            <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10 w-full">

                <div className="arch-fade mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-secondary mb-8 shadow-sm">
                    <Lock className="w-8 h-8" />
                </div>

                <h2 className="arch-fade text-5xl md:text-7xl lg:text-8xl font-display font-semibold text-slate-900 tracking-tight leading-[1.1]">
                    Your thoughts are yours.
                </h2>

                <p className="arch-fade text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    100% Local processing. Secure edge AI. No data leaves your device without explicit permission. We built an environment where you can truly unmask.
                </p>

            </div>
        </section>
    );
};
