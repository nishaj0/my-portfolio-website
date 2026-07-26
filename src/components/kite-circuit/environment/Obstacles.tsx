'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  BARRIER_DEPTH,
  BARRIER_HALF_H,
  BARRIER_HALF_W,
  CAMERA_START_Z,
  KITE_HOME_Y,
  OBSTACLE_LOOP_LENGTH,
  ORBITER_CHUNK,
  ORBITER_COUNT,
  ORBITER_RADIUS,
  SLIDER_HALF_H,
  SLIDER_HALF_W,
  SPINNER_LENGTH,
  SPINNER_THICKNESS,
  obstaclePose,
} from '../course';
import type { ObstacleState, RunState } from '../types';

type ObstaclesProps = {
  flightDistance: React.MutableRefObject<number>;
  obstacles: ObstacleState[];
  runState: React.MutableRefObject<RunState>;
};

const obstacleMaterial = {
  color: '#ffffff',
  roughness: 0.08,
  metalness: 0.24,
  emissive: '#ffffff',
  emissiveIntensity: 0.95,
  clearcoat: 0.58,
  clearcoatRoughness: 0.08,
  toneMapped: false,
};

function Obstacle({
  flightDistance,
  obstacle,
  runState,
}: {
  flightDistance: React.MutableRefObject<number>;
  obstacle: ObstacleState;
  runState: React.MutableRefObject<RunState>;
}) {
  const group = useRef<THREE.Group>(null);
  const orbiterChildren = useRef<THREE.Mesh[]>([]);

  const geometry = useMemo(() => {
    switch (obstacle.kind) {
      case 'barrier':
        return new THREE.BoxGeometry(BARRIER_HALF_W * 2, BARRIER_HALF_H * 2, BARRIER_DEPTH);
      case 'spinner':
        return new THREE.BoxGeometry(SPINNER_LENGTH, SPINNER_THICKNESS, SPINNER_THICKNESS);
      case 'slider':
        return new THREE.BoxGeometry(SLIDER_HALF_W * 2, SLIDER_HALF_H * 2, BARRIER_DEPTH);
      case 'orbiter':
        return new THREE.BoxGeometry(ORBITER_CHUNK * 2, ORBITER_CHUNK * 2, ORBITER_CHUNK * 2);
    }
  }, [obstacle.kind]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const initialPose = obstaclePose(
    obstacle.kind,
    obstacle.z - CAMERA_START_Z,
    obstacle.phase,
    obstacle.lane,
    0,
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    let relativeZ = obstacle.z - (CAMERA_START_Z - flightDistance.current);
    if (runState.current === 'running' && relativeZ > 14) {
      obstacle.z -= Math.ceil((relativeZ - 14) / OBSTACLE_LOOP_LENGTH) * OBSTACLE_LOOP_LENGTH;
      relativeZ = obstacle.z - (CAMERA_START_Z - flightDistance.current);
    }
    const pose = obstaclePose(obstacle.kind, relativeZ, obstacle.phase, obstacle.lane, clock.elapsedTime);
    group.current.position.set(pose.x, pose.y, obstacle.z);
    group.current.rotation.z = pose.rotZ;

    if (obstacle.kind === 'orbiter' && orbiterChildren.current.length === ORBITER_COUNT) {
      for (let i = 0; i < ORBITER_COUNT; i++) {
        const childAngle = pose.rotZ + (i / ORBITER_COUNT) * Math.PI * 2;
        orbiterChildren.current[i].position.set(
          Math.cos(childAngle) * ORBITER_RADIUS,
          Math.sin(childAngle) * ORBITER_RADIUS,
          0,
        );
      }
    }
  });

  if (obstacle.kind === 'orbiter') {
    return (
      <group ref={group} position={[initialPose.x, initialPose.y, obstacle.z]}>
        {Array.from({ length: ORBITER_COUNT }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) orbiterChildren.current[i] = el;
            }}
            geometry={geometry}
            castShadow
          >
            <meshPhysicalMaterial {...obstacleMaterial} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={group} position={[initialPose.x, initialPose.y, obstacle.z]}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial {...obstacleMaterial} />
      </mesh>
    </group>
  );
}

export default function Obstacles({ flightDistance, obstacles, runState }: ObstaclesProps) {
  return (
    <>
      {obstacles.map((obstacle) => (
        <Obstacle
          key={obstacle.id}
          flightDistance={flightDistance}
          obstacle={obstacle}
          runState={runState}
        />
      ))}
    </>
  );
}
