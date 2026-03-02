import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export const LandingBackground = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-auto bg-primary">
            <Particles
                id="tsparticles"
                options={{
                    background: {
                        color: {
                            value: "#050505", // Void Black
                        },
                    },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "grab",
                            },
                            resize: {
                                enable: true,
                            },
                        },
                        modes: {
                            grab: {
                                distance: 180,
                                links: {
                                    opacity: 0.8,
                                    color: "#EAB308", // Synapse Gold
                                },
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#3B82F6", // Neuro Blue for distant nodes
                        },
                        links: {
                            color: "#171717", // Cortex Gray links
                            distance: 150,
                            enable: true,
                            opacity: 0.3,
                            width: 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "bounce",
                            },
                            random: true,
                            speed: 0.4,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                width: 800,
                                height: 800,
                            },
                            value: 100,
                        },
                        opacity: {
                            value: 0.4,
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 2 },
                        },
                    },
                    detectRetina: true,
                }}
            />
        </div>
    );
};
