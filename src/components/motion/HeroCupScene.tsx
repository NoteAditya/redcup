"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function Cup({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9B2D3A"),
        roughness: 0.38,
        metalness: 0.16,
      }),
    [],
  );
  const rim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#F3E4E2"),
        roughness: 0.55,
        metalness: 0.05,
      }),
    [],
  );
  const deep = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#6E1F2A"),
        roughness: 0.42,
        metalness: 0.1,
      }),
    [],
  );

  useEffect(() => {
    let alive = true;
    let frames = 0;
    const tick = () => {
      if (!alive) return;
      frames += 1;
      invalidate();
      if (frames < 120) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const id = window.setInterval(() => invalidate(), 1000 / 24);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [invalidate]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const tx = pointer.current.x * 0.35;
    const ty = pointer.current.y * 0.25;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tx + t * 0.12, 0.08);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.22 + ty, 0.08);
    group.current.position.y = Math.sin(t * 0.9) * 0.04;
  });

  return (
    <group ref={group} position={[0, -0.1, 0]} scale={1.12}>
      <mesh position={[0, 0.05, 0]} material={mat}>
        <cylinderGeometry args={[0.72, 0.55, 1.15, 32, 1, true]} />
      </mesh>
      <mesh position={[0, 0.08, 0]} material={deep}>
        <cylinderGeometry args={[0.66, 0.5, 1.05, 32, 1, true]} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} material={deep}>
        <circleGeometry args={[0.52, 32]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rim}>
        <torusGeometry args={[0.69, 0.045, 12, 48]} />
      </mesh>
    </group>
  );
}

export function HeroCupScene({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop="demand"
      camera={{ position: [0, 0.35, 3.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", stencil: false }}
      style={{ width: "100%", height: "100%" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.05} />
      <directionalLight position={[-2, 2, 1]} intensity={0.35} color="#F0A8A8" />
      <Cup pointer={pointer} />
    </Canvas>
  );
}
