import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

interface StarProps {
  position: [number, number, number];
  size: number;
  speed: number;
  color: THREE.Color;
}

// Star component
const Star = ({ position, size, speed, color }: StarProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [spring, api] = useSpring(() => ({
    scale: [1, 1, 1] as [number, number, number],
    position: position,
    config: { mass: 2, tension: 500, friction: 50 }
  }));

  useEffect(() => {
    const randomDelay = Math.random() * 2000;
    const interval = setInterval(() => {
      api.start({
        scale: [Math.random() * 0.5 + 0.8, Math.random() * 0.5 + 0.8, 1] as [number, number, number],
        delay: randomDelay
      });
    }, 2000 + randomDelay);

    return () => clearInterval(interval);
  }, [api]);

  useFrame(({ clock }) => {
    if (mesh.current) {
      // Falling effect
      mesh.current.position.y -= speed * 0.01;
      
      // Reset position when star goes below the screen
      if (mesh.current.position.y < -10) {
        mesh.current.position.y = 10;
        mesh.current.position.x = Math.random() * 40 - 20;
        mesh.current.position.z = Math.random() * 10 - 5;
      }
      
      // Subtle twinkling effect
      const time = clock.getElapsedTime();
      const twinkle = Math.sin(time * speed * 2) * 0.1 + 0.9;
      mesh.current.scale.set(size * twinkle, size * twinkle, 1);
    }
  });

  return (
    <animated.mesh ref={mesh} position={spring.position} scale={spring.scale}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </animated.mesh>
  );
};

// Stars field component
const Stars = () => {
  const { viewport } = useThree();
  
  // Generate random stars
  const stars = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      position: [
        Math.random() * 40 - 20,
        Math.random() * 20 - 10,
        Math.random() * 10 - 5
      ] as [number, number, number],
      size: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.2 + 0.05,
      color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.6, 0.8, 0.8)
    }));
  }, [viewport]);

  return (
    <>
      {stars.map((props) => (
        <Star key={props.id} {...props} />
      ))}
    </>
  );
};

// Main component
export const StarryBackgroundScene = () => {
  return (
    <>
      <Stars />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
      </EffectComposer>
    </>
  );
};

// Wrapper component with Canvas
export const StarryBackground = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#050816']} />
        <StarryBackgroundScene />
      </Canvas>
    </div>
  );
}; 