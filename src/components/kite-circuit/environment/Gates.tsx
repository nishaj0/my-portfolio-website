'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_START_Z, FRAME_BEAM, FRAME_HEIGHT, FRAME_WIDTH, gatePose } from '../course';
import type { GatePose, GateState, RunState } from '../types';

type GatesProps = {
  flightDistance: React.MutableRefObject<number>;
  gate: GateState;
  onResolve: (gate: GateState, pose: GatePose) => void;
  runState: React.MutableRefObject<RunState>;
};

export default function Gates({ flightDistance, gate, onResolve, runState }: GatesProps) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const halfWidth = FRAME_WIDTH / 2;
    const halfHeight = FRAME_HEIGHT / 2;
    const innerWidth = halfWidth - FRAME_BEAM;
    const innerHeight = halfHeight - FRAME_BEAM;
    const shape = new THREE.Shape();
    shape.moveTo(-halfWidth, -halfHeight);
    shape.lineTo(halfWidth, -halfHeight);
    shape.lineTo(halfWidth, halfHeight);
    shape.lineTo(-halfWidth, halfHeight);
    shape.closePath();

    const opening = new THREE.Path();
    opening.moveTo(-innerWidth, -innerHeight);
    opening.lineTo(-innerWidth, innerHeight);
    opening.lineTo(innerWidth, innerHeight);
    opening.lineTo(innerWidth, -innerHeight);
    opening.closePath();
    shape.holes.push(opening);

    const frame = new THREE.ExtrudeGeometry(shape, {
      depth: 0.52,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.11,
      bevelThickness: 0.12,
    });
    frame.translate(0, 0, -0.26);
    frame.computeVertexNormals();
    return frame;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  const initialPose = gatePose(gate.z - CAMERA_START_Z, gate.sequence, gate.cycle);

  useFrame(() => {
    if (!group.current) return;
    const relativeZ = gate.z - (CAMERA_START_Z - flightDistance.current);
    const pose = gatePose(relativeZ, gate.sequence, gate.cycle);
    group.current.position.set(pose.x, pose.y, gate.z);
    group.current.rotation.z = pose.tilt;
    group.current.scale.setScalar(pose.scale);
    if (relativeZ > -1.1 && runState.current === 'running') onResolve(gate, pose);
  });

  return (
    <group ref={group} position={[initialPose.x, initialPose.y, gate.z]} rotation={[0, 0, initialPose.tilt]}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.08} metalness={0.24} emissive="#ffffff" emissiveIntensity={1.12} clearcoat={0.58} clearcoatRoughness={0.08} toneMapped={false} />
      </mesh>
    </group>
  );
}
