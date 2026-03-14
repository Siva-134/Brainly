import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, RoundedBox, Sphere, Stars, Sparkles } from '@react-three/drei';

function FloatingShapes() {
    return (
        <>
            {/* Added colored light to replace Environment reflection vibe */}
            <pointLight position={[-10, 0, -20]} color="#e0e7ff" intensity={0.5} />
            <pointLight position={[0, -10, 0]} color="#a78bfa" intensity={0.5} />

            {/* Glass Card - Representing Stored Content */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
                <RoundedBox args={[1.8, 2.4, 0.1]} radius={0.1} smoothness={4} position={[-3.5, 1.5, -3]}>
                    <meshPhysicalMaterial
                        color="#ffffff"
                        roughness={0.1}
                        metalness={0.1}
                        transmission={0.9} // Glass-like
                        thickness={0.5}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        ior={1.5}
                    />
                </RoundedBox>
            </Float>

            {/* Ceramic Card - Representing Knowledge */}
            <Float speed={2} rotationIntensity={0.8} floatIntensity={2}>
                <RoundedBox args={[1.5, 2, 0.1]} radius={0.1} smoothness={4} position={[4.5, -1, -4]} rotation={[0, -0.2, 0.1]}>
                    <meshPhysicalMaterial
                        color="#e0e7ff" // Indigo-50
                        roughness={0.2}
                        metalness={0.1}
                        reflectivity={0.5}
                        clearcoat={0.5}
                    />
                </RoundedBox>
            </Float>

            {/* Neural Node (Main) - Representing Idea/Core */}
            <Float speed={1} rotationIntensity={0.2} floatIntensity={1}>
                <Sphere args={[0.8, 32, 32]} position={[2.5, 3.5, -6]}>
                    <meshPhysicalMaterial
                        color="#6366f1" // Indigo
                        roughness={0.2}
                        metalness={0.8} // Metallic look
                        emissive="#4338ca"
                        emissiveIntensity={0.2}
                    />
                </Sphere>
            </Float>

            {/* Small Floating Nodes - Representing Data Points */}
            <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5}>
                <Sphere args={[0.3, 32, 32]} position={[-4, -3, -5]}>
                    <meshStandardMaterial
                        color="#ec4899" // Pink
                        roughness={0.3}
                        metalness={0.5}
                    />
                </Sphere>
            </Float>

            <Float speed={1.8} rotationIntensity={1} floatIntensity={2}>
                <Sphere args={[0.25, 32, 32]} position={[5, 3, -7]}>
                    <meshStandardMaterial
                        color="#06b6d4" // Cyan
                        roughness={0.3}
                        metalness={0.5}
                    />
                </Sphere>
            </Float>

            {/* Particles / Sparkles for magical effect */}
            <Sparkles
                count={100}
                scale={12}
                size={4}
                speed={0.4}
                opacity={0.5}
                color="#ffffff"
            />
        </>
    );
}

const ThreeDBackground = ({ backgroundImage }) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    React.useEffect(() => {
        if (backgroundImage) {
            const img = new Image();
            img.src = backgroundImage;
            img.onload = () => setImageLoaded(true);
        }
    }, [backgroundImage]);

    return (
        <div className="fixed inset-0 z-0 bg-gray-950 overflow-hidden">
            {/* Smooth Loading Background Image */}
            <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
            />

            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={3} />
                <Stars radius={100} depth={50} count={7000} factor={6} saturation={1} fade speed={1} />
                <FloatingShapes />
            </Canvas>

            {/* Overlay Gradient - Darker if no background image, lighter if background image exists */}
            <div className={`absolute inset-0 bg-gradient-to-t ${backgroundImage ? 'from-black/60 via-black/20 to-black/40' : 'from-gray-950 via-gray-950/40 to-gray-950/60'} opacity-40 pointer-events-none`}></div>
        </div>
    );
};

export default ThreeDBackground;
