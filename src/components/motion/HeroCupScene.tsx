"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** Orbital Rings symbolizing the 4 algorithmic verification rings & escrow security */
function OrbitalRings({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const ring1 = useRef<THREE.Group>(null);
  const ring2 = useRef<THREE.Group>(null);
  const ring3 = useRef<THREE.Group>(null);

  const ringMat1 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#CBD5E1"),
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6,
      }),
    [],
  );

  const ringMat2 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#E11D48"),
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.45,
      }),
    [],
  );

  const ringMat3 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#94A3B8"),
        metalness: 0.85,
        roughness: 0.25,
        transparent: true,
        opacity: 0.5,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1.current) {
      ring1.current.rotation.x = 1.1 + Math.sin(t * 0.4) * 0.15;
      ring1.current.rotation.y = t * 0.35 + pointer.current.x * 0.2;
      ring1.current.rotation.z = Math.cos(t * 0.3) * 0.1;
    }
    if (ring2.current) {
      ring2.current.rotation.x = 0.8 + Math.cos(t * 0.3) * 0.2;
      ring2.current.rotation.y = -t * 0.25 - pointer.current.x * 0.15;
      ring2.current.rotation.z = 0.4 + pointer.current.y * 0.1;
    }
    if (ring3.current) {
      ring3.current.rotation.x = -0.6 + Math.sin(t * 0.5) * 0.15;
      ring3.current.rotation.y = t * 0.2 + pointer.current.x * 0.1;
    }
  });

  return (
    <>
      <group ref={ring1} position={[0, 0, 0]}>
        <mesh material={ringMat1}>
          <torusGeometry args={[1.35, 0.018, 16, 64]} />
        </mesh>
      </group>
      <group ref={ring2} position={[0, 0.1, 0]}>
        <mesh material={ringMat2}>
          <torusGeometry args={[1.58, 0.014, 16, 64]} />
        </mesh>
      </group>
      <group ref={ring3} position={[0, -0.15, 0]}>
        <mesh material={ringMat3}>
          <torusGeometry args={[1.15, 0.016, 16, 64]} />
        </mesh>
      </group>
    </>
  );
}

/** 3D RedCup Object with realistic studio materials and smooth physics */
function Cup({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);

  // Exterior Crimson Body
  const matBody = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9B2D3A"),
        roughness: 0.32,
        metalness: 0.2,
      }),
    [],
  );

  // Inner Deep Crimson Volume
  const matInner = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#5E1620"),
        roughness: 0.45,
        metalness: 0.1,
      }),
    [],
  );

  // Polished Upper Lip / Rim
  const matRim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#F8FAFC"),
        roughness: 0.18,
        metalness: 0.65,
      }),
    [],
  );

  // Embossed Cup Ring Ribs
  const matRib = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#A83240"),
        roughness: 0.28,
        metalness: 0.22,
      }),
    [],
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const tx = pointer.current.x * 0.45;
    const ty = pointer.current.y * 0.35;

    // Smooth inertia tilt and rotation
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      tx + t * 0.15,
      0.06,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      0.26 + ty,
      0.06,
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -tx * 0.25,
      0.06,
    );

    // Natural hover breathing float
    group.current.position.y = Math.sin(t * 1.1) * 0.06;
  });

  return (
    <group ref={group} position={[0, -0.05, 0]} scale={1.18}>
      {/* Outer Shell */}
      <mesh position={[0, 0.05, 0]} material={matBody}>
        <cylinderGeometry args={[0.74, 0.54, 1.25, 48, 1, true]} />
      </mesh>

      {/* Subtle Structural Grip Ribs (Classic Party Cup Architecture) */}
      <mesh position={[0, 0.15, 0]} material={matRib}>
        <cylinderGeometry args={[0.71, 0.69, 0.08, 48, 1, true]} />
      </mesh>
      <mesh position={[0, -0.05, 0]} material={matRib}>
        <cylinderGeometry args={[0.66, 0.64, 0.08, 48, 1, true]} />
      </mesh>
      <mesh position={[0, -0.22, 0]} material={matRib}>
        <cylinderGeometry args={[0.61, 0.59, 0.08, 48, 1, true]} />
      </mesh>

      {/* Inner Chamber */}
      <mesh position={[0, 0.08, 0]} material={matInner}>
        <cylinderGeometry args={[0.69, 0.49, 1.18, 48, 1, true]} />
      </mesh>

      {/* Base Sealed Disc */}
      <mesh position={[0, -0.57, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matInner}>
        <circleGeometry args={[0.52, 48]} />
      </mesh>

      {/* Top Rounded Lip Rim */}
      <mesh position={[0, 0.67, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matRim}>
        <torusGeometry args={[0.72, 0.045, 16, 64]} />
      </mesh>
    </group>
  );
}

export function HeroCupScene({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.35, 3.4], fov: 40 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Studio Lighting System */}
      <ambientLight intensity={0.8} />
      {/* Key Light */}
      <directionalLight position={[3.5, 4.5, 3]} intensity={1.6} color="#FFFFFF" />
      {/* Rim Light for Dramatic Contour */}
      <directionalLight position={[-3, 2.5, -1.5]} intensity={1.4} color="#FDA4AF" />
      {/* Subtle Upward Fill */}
      <directionalLight position={[0, -3, 2]} intensity={0.4} color="#CBD5E1" />

      {/* 3D Elements */}
      <OrbitalRings pointer={pointer} />
      <Cup pointer={pointer} />
    </Canvas>
  );
}
