'use client';

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_START_Z, flightSpeed, GATE_STARTS, KITE_HOME_Y, NITRO_CHARGE_PER_SECOND, NITRO_DRAIN_PER_SECOND, NITRO_MAX, OBSTACLE_KINDS, OBSTACLE_STARTS } from './course';
import BoostTrail from './environment/BoostTrail';
import CloudBanks from './environment/CloudBanks';
import CollisionSystem from './environment/CollisionSystem';
import DarkWater from './environment/DarkWater';
import Gates from './environment/Gates';
import Obstacles from './environment/Obstacles';
import PaperPlane from './environment/PaperPlane';
import Roadway from './environment/Roadway';
import Sky from './environment/Sky';
import type { GateState, NitroState, ObstacleState, RunState } from './types';

type FlightSceneProps = {
  flightDistance: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<NitroState>;
  onCrash: () => void;
  onBoostChange: (active: boolean) => void;
  onNitroChange: (amount: number) => void;
  player: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  runId: number;
  runState: React.MutableRefObject<RunState>;
  target: React.MutableRefObject<{ x: number; y: number }>;
};

function CinematicCamera({ flightDistance, nitro, onBoostChange, onNitroChange, reducedMotion, runState }: Pick<FlightSceneProps, 'flightDistance' | 'nitro' | 'onBoostChange' | 'onNitroChange' | 'reducedMotion' | 'runState'>) {
  const { camera } = useThree();
  const lastReportedNitro = useRef(-1);
  const lastReportedBoost = useRef(false);

  useEffect(() => {
    camera.position.set(0, 0.46, CAMERA_START_Z);
    if (camera instanceof THREE.PerspectiveCamera) camera.fov = 42;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(({ clock }, delta) => {
    if (runState.current === 'running') {
      const canBoost = nitro.current.held && !nitro.current.locked && nitro.current.amount > 0.75;
      const canRecharge = !nitro.current.held && !nitro.current.locked;
      const intensityEase = 1 - Math.exp(-delta * (canBoost ? 4.8 : 6.8));
      nitro.current.intensity += ((canBoost ? 1 : 0) - nitro.current.intensity) * intensityEase;
      nitro.current.amount = THREE.MathUtils.clamp(
        nitro.current.amount + (canBoost ? -NITRO_DRAIN_PER_SECOND : canRecharge ? NITRO_CHARGE_PER_SECOND : 0) * delta,
        0,
        NITRO_MAX,
      );
      if (nitro.current.amount <= 0.05) {
        nitro.current.amount = 0;
        nitro.current.held = false;
        nitro.current.locked = true;
        nitro.current.intensity = 0;
      }
      nitro.current.active = canBoost && nitro.current.intensity > 0.025;
      flightDistance.current += flightSpeed(nitro.current.active ? nitro.current.intensity : 0, flightDistance.current) * delta;
    } else {
      nitro.current.active = false;
      nitro.current.intensity += (0 - nitro.current.intensity) * (1 - Math.exp(-delta * 8));
    }

    if (Math.abs(lastReportedNitro.current - nitro.current.amount) >= 0.35) {
      lastReportedNitro.current = nitro.current.amount;
      onNitroChange(nitro.current.amount);
    }

    if (lastReportedBoost.current !== nitro.current.active) {
      lastReportedBoost.current = nitro.current.active;
      onBoostChange(nitro.current.active);
    }

    const cameraZ = CAMERA_START_Z - flightDistance.current;
    const flightBob = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 2.4) * 0.016;
    camera.position.set(0, 0.46 + flightBob, cameraZ);
    camera.lookAt(0, -1.48, cameraZ - 68);
  });

  return null;
}

function RendererSettings() {
  const { gl } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.14;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  return null;
}

function CinematicFinish({ reducedMotion }: Pick<FlightSceneProps, 'reducedMotion'>) {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.65} intensity={reducedMotion ? 0 : 0.38} height={420} />
      <Vignette offset={0.36} darkness={0.34} />
    </EffectComposer>
  );
}

export default function KiteCircuitScene({ flightDistance, nitro, onBoostChange, onCrash, onNitroChange, player, reducedMotion, runId, runState, target }: FlightSceneProps) {
  const gates = useMemo(() => GATE_STARTS.map((z, sequence) => ({ z, sequence })), []);
  const obstacles = useMemo<ObstacleState[]>(
    () =>
      OBSTACLE_STARTS.map((z, index) => ({
        id: index,
        kind: OBSTACLE_KINDS[index % OBSTACLE_KINDS.length],
        z,
        phase: index * 0.7,
        lane: ((index % 3) - 1) * 1.6,
      })),
    [],
  );

  useEffect(() => {
    gates.forEach((gate, index) => { gate.z = GATE_STARTS[index]; });
    obstacles.forEach((obstacle, index) => { obstacle.z = OBSTACLE_STARTS[index]; });
    player.current = { x: 0, y: KITE_HOME_Y };
    target.current = { x: 0, y: KITE_HOME_Y };
  }, [gates, obstacles, player, runId, target]);

  return (
    <>
      <CinematicCamera flightDistance={flightDistance} nitro={nitro} onBoostChange={onBoostChange} onNitroChange={onNitroChange} reducedMotion={reducedMotion} runState={runState} />
      <RendererSettings />
      <color attach="background" args={['#000000']} />
      <Sky />
      <hemisphereLight args={['#cdd4dc', '#000000', 0.38]} />
      <directionalLight position={[-8, 13, 8]} intensity={2.2} color="#ffffff" />
      <pointLight position={[12, 1, -30]} intensity={4.2} distance={74} color="#ffffff" />
      <DarkWater flightDistance={flightDistance} nitro={nitro} reducedMotion={reducedMotion} runState={runState} />
      <Roadway flightDistance={flightDistance} />
      <Suspense fallback={null}>
        <CloudBanks flightDistance={flightDistance} nitro={nitro} reducedMotion={reducedMotion} runState={runState} />
      </Suspense>
      {gates.map((gate, index) => <Gates key={index} gate={gate} flightDistance={flightDistance} runState={runState} />)}
      <Obstacles flightDistance={flightDistance} obstacles={obstacles} runState={runState} />
      <CollisionSystem flightDistance={flightDistance} nitro={nitro} obstacles={obstacles} player={player} runState={runState} onCrash={onCrash} />
      <BoostTrail flightDistance={flightDistance} nitro={nitro} player={player} reducedMotion={reducedMotion} runState={runState} />
      <PaperPlane flightDistance={flightDistance} nitro={nitro} player={player} reducedMotion={reducedMotion} target={target} />
      <CinematicFinish reducedMotion={reducedMotion} />
    </>
  );
}
