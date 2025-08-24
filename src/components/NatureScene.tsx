import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Stars, 
  Float, 
  Text3D, 
  OrbitControls,
  useTexture,
  Plane,
  Sphere,
  Box
} from '@react-three/drei';
import * as THREE from 'three';
import waterfallImage from '@/assets/waterfall-background.jpg';

// Animated Waterfall Component
function Waterfall() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(waterfallImage);
  
  // Animate water flow effect
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      if (material.map) {
        material.map.offset.y = (state.clock.elapsedTime * 0.1) % 1;
      }
    }
  });

  return (
    <Plane 
      ref={meshRef}
      args={[6, 8]} 
      position={[-3, 0, -8]}
      rotation={[0, 0.3, 0]}
    >
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </Plane>
  );
}

// Swaying Trees
function SwayingTree({ position }: { position: [number, number, number] }) {
  const treeRef = useRef<THREE.Group>(null);
  const swayAmount = Math.random() * 0.5 + 0.3;
  
  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * swayAmount * 0.1;
    }
  });

  return (
    <group ref={treeRef} position={position}>
      {/* Tree trunk */}
      <Box args={[0.3, 4, 0.3]} position={[0, 1, 0]}>
        <meshLambertMaterial color="#4a3429" />
      </Box>
      {/* Tree canopy */}
      <Sphere args={[1.5, 8, 6]} position={[0, 3.5, 0]}>
        <meshLambertMaterial color="#2d5016" />
      </Sphere>
      <Sphere args={[1.2, 8, 6]} position={[0.5, 4, 0.3]}>
        <meshLambertMaterial color="#335c1a" />
      </Sphere>
    </group>
  );
}

// Floating Fireflies
function Firefly({ position }: { position: [number, number, number] }) {
  const firefly = useRef<THREE.Mesh>(null);
  const drift = useMemo(() => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random() * 2 - 1,
    speed: Math.random() * 0.5 + 0.2
  }), []);

  useFrame((state) => {
    if (firefly.current) {
      const time = state.clock.elapsedTime * drift.speed;
      firefly.current.position.x = position[0] + Math.sin(time) * drift.x;
      firefly.current.position.y = position[1] + Math.cos(time * 0.7) * drift.y;
      firefly.current.position.z = position[2] + Math.sin(time * 0.5) * drift.z;
      
      // Pulsing glow effect
      const intensity = (Math.sin(time * 2) + 1) * 0.5;
      if (firefly.current.material instanceof THREE.MeshBasicMaterial) {
        firefly.current.material.opacity = 0.4 + intensity * 0.6;
      }
    }
  });

  return (
    <Sphere ref={firefly} args={[0.05, 8, 6]} position={position}>
      <meshBasicMaterial 
        color="#ffff88" 
        transparent 
        opacity={0.8}
      />
    </Sphere>
  );
}

// Main Nature Scene
function Scene() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 2, 6);
  }, [camera]);

  return (
    <>
      {/* Ambient Environment */}
      <Environment preset="forest" background={false} />
      <Stars 
        radius={100} 
        depth={50} 
        count={1000} 
        factor={4} 
        saturation={0.8} 
        fade 
        speed={0.5}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#ffd89b" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        color="#ffb347"
        castShadow
      />
      <pointLight 
        position={[0, 5, 2]} 
        intensity={0.4} 
        color="#ffeaa7" 
      />
      
      {/* Waterfall */}
      <Waterfall />
      
      {/* Forest Elements */}
      {Array.from({ length: 8 }, (_, i) => (
        <SwayingTree 
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            0,
            (Math.random() - 0.5) * 15 - 5
          ]}
        />
      ))}
      
      {/* Floating Fireflies */}
      {Array.from({ length: 12 }, (_, i) => (
        <Float
          key={i}
          speed={0.5 + Math.random() * 0.5}
          rotationIntensity={0.1}
          floatIntensity={0.3}
        >
          <Firefly 
            position={[
              (Math.random() - 0.5) * 15,
              1 + Math.random() * 4,
              (Math.random() - 0.5) * 10
            ]}
          />
        </Float>
      ))}
      
      {/* Ground Plane */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshLambertMaterial color="#2d5016" />
      </Plane>
      
      {/* Gentle camera movement */}
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function NatureScene() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}