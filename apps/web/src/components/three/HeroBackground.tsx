'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Floating 3D Shape Component
function FloatingShape({
  position,
  color,
  geometry = 'icosahedron',
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  geometry?: 'icosahedron' | 'box' | 'sphere';
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.3;
    }
  });

  const geometryMap = {
    icosahedron: new THREE.IcosahedronGeometry(scale, 0),
    box: new THREE.BoxGeometry(scale, scale, scale),
    sphere: new THREE.SphereGeometry(scale * 0.8, 32, 32),
  };

  return (
    <mesh ref={meshRef} position={position}>
      <primitive object={geometryMap[geometry]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Particle Field Component
function ParticleField() {
  return (
    <Stars
      radius={300}
      depth={60}
      count={5000}
      factor={7}
      saturation={0.8}
      fade
      speed={1}
    />
  );
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#00ffff" intensity={0.8} />
        <spotLight
          position={[0, 20, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#ffffff"
        />

        {/* Particle Field */}
        <ParticleField />

        {/* Floating Shapes */}
        <FloatingShape position={[-4, 2, -2]} color="#00ffff" geometry="icosahedron" scale={0.8} />
        <FloatingShape position={[3, -2, -3]} color="#ff00ff" geometry="sphere" scale={0.6} />
        <FloatingShape position={[0, 3, -1]} color="#00ff88" geometry="box" scale={0.5} />
        <FloatingShape position={[-2, -3, -2]} color="#ffaa00" geometry="icosahedron" scale={0.7} />
        <FloatingShape position={[4, 0, -2.5]} color="#00aaff" geometry="sphere" scale={0.9} />
        <FloatingShape position={[2, 2.5, -1.5]} color="#ff0088" geometry="box" scale={0.4} />

        {/* Optional: Enable for interaction */}
        {/* <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} /> */}
      </Canvas>
    </div>
  );
}
