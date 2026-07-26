'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { NitroState, RunState } from '../types';

type BoostTrailProps = {
  flightDistance: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<NitroState>;
  player: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  runState: React.MutableRefObject<RunState>;
};

const VERTEX_SHADER = `
  attribute float aPhase;
  attribute float aLane;
  uniform float uTime;
  uniform float uActive;
  varying float vAlpha;

  void main() {
    float travel = fract(aPhase + uTime * 0.82);
    vec3 p = position;
    p.x += aLane * 0.42 + sin((aPhase + uTime) * 14.0) * 0.04;
    p.y -= 0.12 + travel * 0.16;
    p.z += travel * 7.4;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = mix(4.0, 16.0, travel) * (130.0 / -mvPosition.z);
    vAlpha = uActive * (1.0 - travel) * 0.48;
  }
`;

const FRAGMENT_SHADER = `
  varying float vAlpha;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float softness = 1.0 - smoothstep(0.1, 0.5, length(point));
    gl_FragColor = vec4(vec3(0.96), softness * vAlpha);
  }
`;

export default function BoostTrail({ flightDistance, nitro, player, reducedMotion, runState }: BoostTrailProps) {
  const group = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const lanes = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      phases[index] = index / count;
      lanes[index] = index % 2 === 0 ? -1 : 1;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    buffer.setAttribute('aLane', new THREE.BufferAttribute(lanes, 1));
    return buffer;
  }, []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uActive: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!group.current || !material.current) return;
    group.current.position.set(player.current.x, player.current.y, -flightDistance.current + 0.1);
    const intensity = !reducedMotion && runState.current === 'running' ? nitro.current.intensity : 0;
    material.current.uniforms.uActive.value += (intensity - material.current.uniforms.uActive.value) * Math.min(1, delta * 10);
    if (intensity > 0.01) material.current.uniforms.uTime.value += delta * THREE.MathUtils.lerp(0.6, 1.2, intensity);
  });

  return (
    <points ref={group} geometry={geometry} frustumCulled={false} renderOrder={3}>
      <shaderMaterial ref={material} vertexShader={VERTEX_SHADER} fragmentShader={FRAGMENT_SHADER} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
