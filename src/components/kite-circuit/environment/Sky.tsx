'use client';

import * as THREE from 'three';
import { SKY_FRAGMENT_SHADER, SKY_VERTEX_SHADER } from '../shaders';

export default function Sky() {
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-4}>
      <sphereGeometry args={[420, 48, 28]} />
      <shaderMaterial
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={SKY_FRAGMENT_SHADER}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
