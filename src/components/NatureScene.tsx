import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Stars, 
  Float, 
  OrbitControls,
  Plane,
  Sphere,
  Box,
  Cylinder
} from '@react-three/drei';
import * as THREE from 'three';

// Animated Waterfall with flowing particles
function AnimatedWaterfall() {
  const particlesRef = useRef<THREE.Points>(null);
  const waterMeshRef = useRef<THREE.Mesh>(null);
  
  // Create water particles
  const particles = useMemo(() => {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;     // x
      positions[i * 3 + 1] = Math.random() * 8 + 2;     // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // z
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;     // x velocity
      velocities[i * 3 + 1] = -Math.random() * 0.1 - 0.02;  // y velocity (downward)
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02; // z velocity
    }
    
    return { positions, velocities, count: particleCount };
  }, []);
  
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particles.count; i++) {
        // Update positions
        positions[i * 3] += particles.velocities[i * 3];
        positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
        
        // Reset particles that fall too low
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 8 + Math.random() * 2;
          positions[i * 3] = (Math.random() - 0.5) * 4;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate main water surface
    if (waterMeshRef.current) {
      waterMeshRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <group position={[-4, 0, -6]}>
      {/* Main waterfall surface */}
      <Plane 
        ref={waterMeshRef}
        args={[3, 6]} 
        position={[0, 3, 0]}
      >
        <meshPhongMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.6}
          shininess={100}
          reflectivity={0.5}
        />
      </Plane>
      
      {/* Water particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#B0E0E6" 
          size={0.05} 
          transparent 
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Enhanced Swaying Trees with animated leaves
function SwayingTree({ position }: { position: [number, number, number] }) {
  const treeRef = useRef<THREE.Group>(null);
  const leavesRefs = useRef<THREE.Mesh[]>([]);
  const swayAmount = Math.random() * 0.5 + 0.3;
  const swaySpeed = Math.random() * 0.5 + 0.5;
  
  useFrame((state) => {
    if (treeRef.current) {
      const time = state.clock.elapsedTime * swaySpeed;
      treeRef.current.rotation.z = Math.sin(time + position[0]) * swayAmount * 0.15;
      treeRef.current.rotation.x = Math.cos(time * 0.7 + position[2]) * swayAmount * 0.05;
    }
    
    // Animate individual leaf clusters
    leavesRefs.current.forEach((leafMesh, index) => {
      if (leafMesh) {
        const leafTime = state.clock.elapsedTime * (0.8 + index * 0.1);
        leafMesh.rotation.y = Math.sin(leafTime) * 0.2;
        leafMesh.rotation.z = Math.cos(leafTime * 0.7) * 0.1;
      }
    });
  });

  return (
    <group ref={treeRef} position={position}>
      {/* Tree trunk with texture-like appearance */}
      <Cylinder args={[0.15, 0.2, 4, 8]} position={[0, 2, 0]}>
        <meshLambertMaterial color="#5D4037" />
      </Cylinder>
      
      {/* Multiple leaf clusters for more realistic look */}
      <Sphere 
        ref={(el) => el && (leavesRefs.current[0] = el)} 
        args={[1.2, 12, 8]} 
        position={[0, 4, 0]}
      >
        <meshLambertMaterial color="#2E7D32" />
      </Sphere>
      <Sphere 
        ref={(el) => el && (leavesRefs.current[1] = el)} 
        args={[0.8, 10, 6]} 
        position={[0.7, 4.2, 0.3]}
      >
        <meshLambertMaterial color="#388E3C" />
      </Sphere>
      <Sphere 
        ref={(el) => el && (leavesRefs.current[2] = el)} 
        args={[0.6, 8, 6]} 
        position={[-0.4, 4.5, -0.2]}
      >
        <meshLambertMaterial color="#43A047" />
      </Sphere>
    </group>
  );
}

// Enhanced Floating Fireflies with trails
function Firefly({ position }: { position: [number, number, number] }) {
  const firefly = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef<Float32Array>(new Float32Array(30)); // 10 trail points
  const currentTrailIndex = useRef(0);
  
  const drift = useMemo(() => ({
    x: Math.random() * 3 - 1.5,
    y: Math.random() * 2 - 1,
    z: Math.random() * 3 - 1.5,
    speed: Math.random() * 0.3 + 0.2,
    phase: Math.random() * Math.PI * 2
  }), []);

  useFrame((state) => {
    if (firefly.current) {
      const time = state.clock.elapsedTime * drift.speed;
      const newX = position[0] + Math.sin(time + drift.phase) * drift.x;
      const newY = position[1] + Math.cos(time * 0.7 + drift.phase) * drift.y;
      const newZ = position[2] + Math.sin(time * 0.5 + drift.phase) * drift.z;
      
      firefly.current.position.set(newX, newY, newZ);
      
      // Update trail
      const trailIndex = currentTrailIndex.current * 3;
      trailPositions.current[trailIndex] = newX;
      trailPositions.current[trailIndex + 1] = newY;
      trailPositions.current[trailIndex + 2] = newZ;
      currentTrailIndex.current = (currentTrailIndex.current + 1) % 10;
      
      if (trailRef.current) {
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      // Pulsing glow effect
      const intensity = (Math.sin(time * 3) + 1) * 0.5;
      if (firefly.current.material instanceof THREE.MeshBasicMaterial) {
        firefly.current.material.opacity = 0.6 + intensity * 0.4;
      }
      
      // Scale pulsing
      const scale = 1 + Math.sin(time * 4) * 0.3;
      firefly.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Main firefly */}
      <Sphere ref={firefly} args={[0.03, 6, 4]} position={position}>
        <meshBasicMaterial 
          color="#FFFF66" 
          transparent 
          opacity={0.8}
        />
      </Sphere>
      
      {/* Glowing aura */}
      <Sphere args={[0.08, 8, 6]} position={position}>
        <meshBasicMaterial 
          color="#FFFF88" 
          transparent 
          opacity={0.2}
        />
      </Sphere>
      
      {/* Trail effect */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={10}
            array={trailPositions.current}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#FFFF88" 
          size={0.02} 
          transparent 
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Floating Dust Particles
function FloatingDustParticles() {
  const dustRef = useRef<THREE.Points>(null);
  
  const dustParticles = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;     // x
      positions[i * 3 + 1] = Math.random() * 10;         // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.005;     // x velocity
      velocities[i * 3 + 1] = Math.random() * 0.01 + 0.002;  // y velocity (upward)
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005; // z velocity
    }
    
    return { positions, velocities, count };
  }, []);
  
  useFrame(() => {
    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < dustParticles.count; i++) {
        positions[i * 3] += dustParticles.velocities[i * 3];
        positions[i * 3 + 1] += dustParticles.velocities[i * 3 + 1];
        positions[i * 3 + 2] += dustParticles.velocities[i * 3 + 2];
        
        // Reset particles that float too high
        if (positions[i * 3 + 1] > 12) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 30;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }
      
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={dustParticles.count}
          array={dustParticles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#FFE082" 
        size={0.02} 
        transparent 
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main Nature Scene
function Scene() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 3, 8);
  }, [camera]);

  return (
    <>
      {/* Ambient Environment */}
      <Environment preset="forest" background={false} />
      <Stars 
        radius={100} 
        depth={50} 
        count={800} 
        factor={3} 
        saturation={0.6} 
        fade 
        speed={0.3}
      />
      
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.4} color="#FFD54F" />
      <directionalLight 
        position={[8, 12, 5]} 
        intensity={1.2} 
        color="#FFA726"
        castShadow
      />
      <pointLight 
        position={[-4, 6, -2]} 
        intensity={0.8} 
        color="#FFCC02" 
      />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.5}
        color="#FFE082"
        castShadow
      />
      
      {/* Animated Waterfall */}
      <AnimatedWaterfall />
      
      {/* Forest of Swaying Trees */}
      {Array.from({ length: 12 }, (_, i) => (
        <SwayingTree 
          key={i}
          position={[
            (Math.random() - 0.5) * 25,
            0,
            (Math.random() - 0.5) * 18 - 6
          ]}
        />
      ))}
      
      {/* Animated Fireflies */}
      {Array.from({ length: 18 }, (_, i) => (
        <Float
          key={i}
          speed={0.3 + Math.random() * 0.4}
          rotationIntensity={0.05}
          floatIntensity={0.2}
        >
          <Firefly 
            position={[
              (Math.random() - 0.5) * 20,
              1 + Math.random() * 6,
              (Math.random() - 0.5) * 15
            ]}
          />
        </Float>
      ))}
      
      {/* Floating Dust Particles */}
      <FloatingDustParticles />
      
      {/* Animated Ground with grass-like texture */}
      <Plane args={[60, 60]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshLambertMaterial color="#1B5E20" />
      </Plane>
      
      {/* Some rocks for detail */}
      {Array.from({ length: 8 }, (_, i) => (
        <Sphere 
          key={i} 
          args={[0.3 + Math.random() * 0.4, 8, 6]} 
          position={[
            (Math.random() - 0.5) * 20,
            -1.5,
            (Math.random() - 0.5) * 15
          ]}
        >
          <meshLambertMaterial color="#424242" />
        </Sphere>
      ))}
      
      {/* Gentle camera movement */}
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.15}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 3.5}
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