'use client';

import { Cloud, Clouds } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_START_Z, WATER_Y } from '../course';
import type { NitroState, RunState } from '../types';

type CloudBanksProps = {
  flightDistance: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<NitroState>;
  reducedMotion: boolean;
  runState: React.MutableRefObject<RunState>;
};

type BankProps = {
  side: -1 | 1;
  reducedMotion: boolean;
};

function CloudBank({ side, reducedMotion }: BankProps) {
  const x = (value: number) => value * side;
  const speed = reducedMotion ? 0 : 0.075;

  return (
    <>
      <Cloud position={[x(23.5), WATER_Y + 2.85, -27]} bounds={[8.8, 4.4, 13]} segments={42} volume={7.6} smallestVolume={0.45} growth={5.8} speed={speed} fade={46} opacity={0.7} color="#e5e7ea" seed={side === -1 ? 7 : 19} />
      <Cloud position={[x(19.8), WATER_Y + 1.8, -79]} bounds={[6.2, 2.8, 10]} segments={30} volume={5.2} smallestVolume={0.4} growth={4.3} speed={speed * 0.82} fade={38} opacity={0.57} color="#c6c9ce" seed={side === -1 ? 31 : 43} />
      <Cloud position={[x(16.8), WATER_Y + 0.9, -133]} bounds={[3.7, 1.35, 7]} segments={18} volume={3.2} smallestVolume={0.35} growth={2.8} speed={speed * 0.64} fade={30} opacity={0.4} color="#aeb2b8" seed={side === -1 ? 59 : 71} />
    </>
  );
}

// The sandbox reference uses Drei's depth-sorted cloud sprites. Here they are
// arranged as physical, asymmetrical banks outside the floating road instead
// of as camera-facing fog laid over the scene.
export default function CloudBanks({ flightDistance, nitro, reducedMotion, runState }: CloudBanksProps) {
  const banks = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!banks.current) return;
    banks.current.position.z = CAMERA_START_Z - flightDistance.current;
    if (!reducedMotion && runState.current === 'running') {
      banks.current.position.x = Math.sin(flightDistance.current * 0.017) * 0.12 * nitro.current.intensity;
      banks.current.position.y = Math.sin(flightDistance.current * 0.025) * 0.035;
    } else {
      banks.current.position.x = 0;
      banks.current.position.y = 0;
    }
  });

  return (
    <group ref={banks} renderOrder={-1}>
      <Clouds limit={180} range={180} frustumCulled={false}>
        <CloudBank side={-1} reducedMotion={reducedMotion} />
        <CloudBank side={1} reducedMotion={reducedMotion} />
      </Clouds>
    </group>
  );
}
