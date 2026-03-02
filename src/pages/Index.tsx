import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingArchitecture } from "@/components/landing/LandingArchitecture";
import { LandingProtocol } from "@/components/landing/LandingProtocol";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Index() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-secondary/20 selection:text-secondary-foreground">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingArchitecture />
      <LandingProtocol />
      <LandingFooter />
    </div>
  );
}
