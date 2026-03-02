import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Generate a soft circular radial gradient for the particles
const createCircleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
        const center = 32;
        const radius = 32;
        const gradient = context.createRadialGradient(center, center, 0, center, center, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(center, center, radius, 0, Math.PI * 2);
        context.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};

const BrainParticles = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const groupRef = useRef<THREE.Group>(null);

    const circleTexture = useMemo(() => createCircleTexture(), []);

    const count = 12000;

    // Generate accurate organic brain shape via Volumetric Point Cloud Rejection
    const [positions, colors, originalPositions, randomFactors] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const randomFactors = new Float32Array(count * 3);

        const colorDeep = new THREE.Color("#3730A3"); // Deep Indigo
        const colorMid = new THREE.Color("#6D28D9"); // Vibrant Violet
        const colorOuter = new THREE.Color("#0369A1"); // Deep Ocean Blue

        let i = 0;

        while (i < count) {
            // Generate random point in bounding box [-3, 3]
            const x = (Math.random() - 0.5) * 6.0;
            const y = (Math.random() - 0.5) * 6.0;
            const z = (Math.random() - 0.5) * 6.0;

            let inCerebrum = false;
            let inCerebellum = false;

            // --- Check Volume A: The Cerebrum ---
            // (x*x)/1.0 + (y*y)/1.6 + (z*z)/2.0 <= 1
            if ((x * x) / 1.0 + (y * y) / 1.6 + (z * z) / 2.0 <= 1) {
                // Apply cutoffs
                if (y >= -0.4 && Math.abs(x) >= 0.15) {
                    inCerebrum = true;
                }
            }

            // --- Check Volume B: The Cerebellum ---
            // (x*x)/0.8 + ((y+0.6)*(y+0.6))/0.4 + ((z+0.8)*(z+0.8))/0.7 <= 1
            if ((x * x) / 0.8 + ((y + 0.6) * (y + 0.6)) / 0.4 + ((z + 0.8) * (z + 0.8)) / 0.7 <= 1) {
                inCerebellum = true;
            }

            // If point falls in either valid volume
            if (inCerebrum || inCerebellum) {
                const idx = i * 3;

                positions[idx] = x;
                positions[idx + 1] = y;
                positions[idx + 2] = z;

                originalPositions[idx] = x;
                originalPositions[idx + 1] = y;
                originalPositions[idx + 2] = z;

                // Individual variation for particle drifting/breathing
                randomFactors[idx] = Math.random() * Math.PI * 2;
                randomFactors[idx + 1] = Math.random() * Math.PI * 2;
                randomFactors[idx + 2] = Math.random() * Math.PI * 2;

                // --- Color Mapping (Depth-based) ---
                // Calculate distance from center (approximate depth)
                const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);

                // Normalize distance roughly between 0 (deep) and 2.0+ (outer edge)
                const normalizedDepth = Math.min(Math.max(distanceFromCenter / 1.6, 0), 1);

                // Interpolate colors based on depth (Deep -> Mid -> Outer)
                let mixedColor = new THREE.Color();
                if (normalizedDepth < 0.5) {
                    // Deep to Mid
                    const t = normalizedDepth * 2.0;
                    mixedColor.lerpColors(colorDeep, colorMid, t);
                } else {
                    // Mid to Outer
                    const t = (normalizedDepth - 0.5) * 2.0;
                    mixedColor.lerpColors(colorMid, colorOuter, t);
                }

                colors[idx] = mixedColor.r;
                colors[idx + 1] = mixedColor.g;
                colors[idx + 2] = mixedColor.b;

                i++;
            }
        }

        return [positions, colors, originalPositions, randomFactors];
    }, []);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // Global float and rotation
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
            groupRef.current.rotation.y += delta * 0.05;
        }

        // Deep organic "breathing" / drift per particle
        if (pointsRef.current) {
            const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                const idx = i * 3;
                // Additive sine waves for complex organic motion
                positionsArray[idx] = originalPositions[idx] + Math.sin(time * 0.8 + randomFactors[idx]) * 0.02;
                positionsArray[idx + 1] = originalPositions[idx + 1] + Math.sin(time * 1.1 + randomFactors[idx + 1]) * 0.03;
                positionsArray[idx + 2] = originalPositions[idx + 2] + Math.sin(time * 0.9 + randomFactors[idx + 2]) * 0.02;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group ref={groupRef}>
            <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={0.08}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.NormalBlending}
                    opacity={0.85}
                    map={circleTexture}
                    alphaTest={0.001}
                />
            </Points>
        </group>
    );
};

export const ParticleBrain = () => {
    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 6.5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <BrainParticles />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>
        </div>
    );
};
