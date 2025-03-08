import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Text, 
  MeshDistortMaterial, 
  GradientTexture,
  Sparkles,
  useTexture
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../../../app/providers/theme-provider';

interface FloatingObjectProps {
  position: [number, number, number];
  color?: string;
  scale?: number;
  rotationSpeed?: number;
  floatIntensity?: number;
  distort?: boolean;
  geometry?: 'sphere' | 'box' | 'torus' | 'dodecahedron';
}

function FloatingObject({
  position,
  color = '#ffffff',
  scale = 1,
  rotationSpeed = 0.01,
  floatIntensity = 1,
  distort = false,
  geometry = 'dodecahedron',
}: FloatingObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { scale: animatedScale } = useSpring({
    scale: hovered ? 1.2 : 1,
    config: { tension: 300, friction: 10 }
  });
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.x += rotationSpeed * 0.5;
    meshRef.current.rotation.y += rotationSpeed;
  });

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  const renderGeometry = () => {
    switch (geometry) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case 'dodecahedron':
      default:
        return <dodecahedronGeometry args={[1, 0]} />;
    }
  };

  return (
    <Float speed={1.5 * floatIntensity} rotationIntensity={0.5 * floatIntensity} floatIntensity={floatIntensity}>
      <animated.mesh 
        ref={meshRef} 
        position={position} 
        scale={animatedScale.to(s => [s * scale, s * scale, s * scale])}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {renderGeometry()}
        {distort ? (
          <MeshDistortMaterial 
            color={color} 
            speed={2} 
            distort={0.3} 
            roughness={0} 
            metalness={1}
          />
        ) : (
          <meshStandardMaterial 
            color={color} 
            roughness={0.1} 
            metalness={0.8}
            emissive={color}
            emissiveIntensity={0.2}
          />
        )}
      </animated.mesh>
    </Float>
  );
}

function AICore() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current || !innerRef.current) return;
    
    meshRef.current.rotation.y += 0.005;
    innerRef.current.rotation.y -= 0.01;
    
    // Pulse effect
    const t = state.clock.getElapsedTime();
    innerRef.current.scale.set(
      1 + Math.sin(t * 2) * 0.04,
      1 + Math.sin(t * 2) * 0.04,
      1 + Math.sin(t * 2) * 0.04
    );
  });
  
  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);
  
  return (
    <group>
      {/* Outer sphere */}
      <mesh 
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color={isDarkMode ? "#ffffff" : "#000000"} 
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
      
      {/* Inner core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color={isDarkMode ? "#ffffff" : "#000000"} 
          roughness={0}
          metalness={1}
          emissive={isDarkMode ? "#ffffff" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Particles */}
      <Sparkles 
        count={50}
        scale={5}
        size={0.4}
        speed={0.3}
        color={isDarkMode ? "#ffffff" : "#000000"}
        opacity={0.5}
      />
    </group>
  );
}

function AIText() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const textRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!textRef.current) return;
    const t = clock.getElapsedTime();
    textRef.current.position.y = Math.sin(t * 0.5) * 0.1;
  });
  
  return (
    <Text
      ref={textRef}
      position={[0, -2, 0]}
      fontSize={0.5}
      color={isDarkMode ? "white" : "black"}
      anchorX="center"
      anchorY="middle"
      font="/fonts/Inter-Bold.woff"
      letterSpacing={0.05}
    >
      AI POWERED
    </Text>
  );
}

function PostProcessingEffects() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={isDarkMode ? 0.4 : 0.2}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0005, 0.0005]}
      />
    </EffectComposer>
  );
}

interface SceneProps {
  isActive?: boolean;
}

function Scene({ isActive = true }: SceneProps) {
  const { camera } = useThree();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  useEffect(() => {
    if (isActive) {
      camera.position.set(0, 0, 10);
    } else {
      camera.position.set(0, 0, 20);
    }
  }, [isActive, camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color={isDarkMode ? "#ffffff" : "#000000"} />
      
      <group position={[0, 0, 0]}>
        <AICore />
        <AIText />
        
        <FloatingObject 
          position={[-4, 2, -2]} 
          color={isDarkMode ? "#ffffff" : "#000000"} 
          rotationSpeed={0.01} 
          floatIntensity={1.5}
          geometry="sphere"
          scale={0.5}
        />
        <FloatingObject 
          position={[4, -2, -2]} 
          color={isDarkMode ? "#ffffff" : "#000000"} 
          rotationSpeed={0.015} 
          floatIntensity={1}
          geometry="box"
          scale={0.5}
        />
        <FloatingObject 
          position={[3, 3, -3]} 
          color={isDarkMode ? "#ffffff" : "#000000"} 
          rotationSpeed={0.02} 
          floatIntensity={2}
          geometry="torus"
          scale={0.4}
          distort
        />
        <FloatingObject 
          position={[-3, -3, -3]} 
          color={isDarkMode ? "#ffffff" : "#000000"} 
          rotationSpeed={0.025} 
          floatIntensity={1.2}
          geometry="dodecahedron"
          scale={0.4}
        />
      </group>
      
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="city" />
      <PostProcessingEffects />
    </>
  );
}

interface ThreeDSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  className?: string;
}

export function ThreeDScene({ isActive = true, className, ...props }: ThreeDSceneProps) {
  return (
    <div className={cn("w-full h-full min-h-[400px]", className)} {...props}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <Scene isActive={isActive} />
      </Canvas>
    </div>
  );
} 