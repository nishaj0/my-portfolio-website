'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_START_Z, ROAD_LENGTH, WATER_Y } from '../course';
import type { NitroState, RunState } from '../types';
import { OCEAN_FRAGMENT_SHADER, OCEAN_VERTEX_SHADER } from './OceanMaterial';

type DarkWaterProps = {
  flightDistance: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<NitroState>;
  reducedMotion: boolean;
  runState: React.MutableRefObject<RunState>;
};

export default function DarkWater({ flightDistance, nitro, reducedMotion, runState }: DarkWaterProps) {
  const water = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uMotion: { value: 0.42 } }), []);

  useFrame((_, delta) => {
    if (water.current) water.current.position.z = CAMERA_START_Z - flightDistance.current - ROAD_LENGTH * 0.3;
    if (!material.current || reducedMotion || runState.current !== 'running') return;
    const pace = THREE.MathUtils.lerp(1, 1.8, nitro.current.intensity);
    material.current.uniforms.uTime.value += delta;
    material.current.uniforms.uMotion.value += (0.42 * pace - material.current.uniforms.uMotion.value) * (1 - Math.exp(-delta * 5));
  });

  return (
    <mesh ref={water} position={[0, WATER_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[420, ROAD_LENGTH, 1, 1]} />
      <shaderMaterial ref={material} vertexShader={OCEAN_VERTEX_SHADER} fragmentShader={OCEAN_FRAGMENT_SHADER} uniforms={uniforms} />
    </mesh>
  );
}
