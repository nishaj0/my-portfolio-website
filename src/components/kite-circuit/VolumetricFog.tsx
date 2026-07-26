'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_START_Z } from './course';
import type { RunState } from './types';

type VolumetricFogProps = {
  flightDistance: React.MutableRefObject<number>;
  reducedMotion: boolean;
  runState: React.MutableRefObject<RunState>;
  scoreRef: React.MutableRefObject<number>;
};

type CloudBank = {
  position: [number, number, number];
  scale: [number, number, number];
  seed: number;
};

const CLOUD_BANKS: CloudBank[] = [
  // Tall foreground banks flank the plane, then each subsequent bank becomes
  // lower and quieter toward the vanishing point—the triangular cloud profile
  // from the supplied composition.
  { position: [-31, -1.15, -26], scale: [32, 15, 82], seed: 0.17 },
  { position: [-38, -1.65, -104], scale: [44, 9.2, 88], seed: 0.41 },
  { position: [-47, -2.05, -190], scale: [58, 5.2, 104], seed: 0.73 },
  { position: [31, -1.15, -30], scale: [32, 14.2, 78], seed: 0.28 },
  { position: [38, -1.65, -112], scale: [43, 8.8, 84], seed: 0.56 },
  { position: [47, -2.05, -198], scale: [56, 4.9, 100], seed: 0.91 },
];

// A focused adaptation of the envelope + AABB ray-marching model used by the
// linked three-volumetric-clouds project. It is a single bounded volume, not a
// collection of flat fog cards, so the rail remains clear and the cloud reads
// with genuine depth as the camera passes it.
const VERTEX_SHADER = `
  varying vec3 vWorldPosition;

  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform mat4 uWorldToLocal;
  uniform vec3 uCameraPosition;
  uniform float uTime;
  uniform float uSeed;
  varying vec3 vWorldPosition;

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y), mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.56;
    for (int i = 0; i < 4; i++) {
      value += amplitude * valueNoise(p);
      p = p * 2.03 + vec3(11.7, 5.3, 9.1);
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 intersectAabb(vec3 ro, vec3 rd) {
    vec3 invRay = 1.0 / rd;
    vec3 t0 = (-0.5 - ro) * invRay;
    vec3 t1 = (0.5 - ro) * invRay;
    vec3 tMin = min(t0, t1);
    vec3 tMax = max(t0, t1);
    return vec2(max(max(tMin.x, tMin.y), tMin.z), min(min(tMax.x, tMax.y), tMax.z));
  }

  float cloudDensity(vec3 p) {
    vec3 uvw = p + 0.5;
    float lowEdge = smoothstep(0.02, 0.22, uvw.y);
    float highEdge = 1.0 - smoothstep(0.68, 0.98, uvw.y);
    float outerEdge = smoothstep(0.0, 0.22, uvw.x) * (1.0 - smoothstep(0.68, 1.0, uvw.x));
    float depthEdge = smoothstep(0.0, 0.16, uvw.z) * (1.0 - smoothstep(0.76, 1.0, uvw.z));
    float envelope = lowEdge * highEdge * outerEdge * depthEdge;
    vec3 noiseCoord = vec3(uvw.x * 3.0 - uTime * 0.024, uvw.y * 2.5, uvw.z * 3.2 + uTime * 0.011) + uSeed * 19.0;
    float base = fbm(noiseCoord);
    float detail = fbm(noiseCoord * 2.7 + 4.2) * 0.28;
    return smoothstep(0.5, 0.78, base + detail) * envelope;
  }

  void main() {
    vec3 worldRay = normalize(vWorldPosition - uCameraPosition);
    vec3 rayOrigin = (uWorldToLocal * vec4(uCameraPosition, 1.0)).xyz;
    vec3 rayDirection = normalize((uWorldToLocal * vec4(worldRay, 0.0)).xyz);
    vec2 hit = intersectAabb(rayOrigin, rayDirection);

    float start = max(hit.x, 0.0);
    if (hit.y <= start) discard;

    float stepSize = (hit.y - start) / 44.0;
    float transmittance = 1.0;
    float light = 0.0;

    for (int index = 0; index < 44; index++) {
      float distance = start + (float(index) + 0.5) * stepSize;
      vec3 samplePoint = rayOrigin + rayDirection * distance;
      float density = cloudDensity(samplePoint);
      float heightLight = smoothstep(-0.5, 0.45, samplePoint.y);
      float scatter = density * mix(0.2, 1.0, heightLight) * 0.085;
      light += scatter * transmittance;
      transmittance *= exp(-density * 0.16);
      if (transmittance < 0.03) break;
    }

    float alpha = clamp(1.0 - transmittance, 0.0, 0.68);
    if (alpha < 0.01) discard;
    vec3 shadow = vec3(0.09, 0.1, 0.11);
    vec3 cloud = mix(shadow, vec3(0.96), clamp(light * 3.4, 0.0, 1.0));
    gl_FragColor = vec4(cloud, alpha);
  }
`;

function CloudVolume({ bank, flightDistance, reducedMotion, runState, scoreRef }: VolumetricFogProps & { bank: CloudBank }) {
  const volume = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const uniforms = useMemo(() => ({
    uWorldToLocal: { value: new THREE.Matrix4() },
    uCameraPosition: { value: new THREE.Vector3() },
    uTime: { value: 0 },
    uSeed: { value: bank.seed },
  }), [bank.seed]);

  useFrame((_, delta) => {
    if (!volume.current || !material.current) return;
    const cameraZ = CAMERA_START_Z - flightDistance.current;
    volume.current.position.set(bank.position[0], bank.position[1], cameraZ + bank.position[2]);
    volume.current.updateMatrixWorld();
    material.current.uniforms.uWorldToLocal.value.copy(volume.current.matrixWorld).invert();
    material.current.uniforms.uCameraPosition.value.copy(camera.position);

    if (!reducedMotion && runState.current === 'running') {
      material.current.uniforms.uTime.value += delta * (0.38 + Math.min(scoreRef.current * 0.00045, 0.7));
    }
  });

  return (
    <mesh ref={volume} position={bank.position} scale={bank.scale} frustumCulled={false} renderOrder={1}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

export default function VolumetricFog(props: VolumetricFogProps) {
  return (
    <>
      {CLOUD_BANKS.map((bank) => <CloudVolume key={bank.seed} bank={bank} {...props} />)}
    </>
  );
}
