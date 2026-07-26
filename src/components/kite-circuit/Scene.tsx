'use client';

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_START_Z, flightSpeed, GATE_STARTS, KITE_HOME_Y, NITRO_CHARGE_PER_SECOND, NITRO_DRAIN_PER_SECOND, NITRO_MAX } from './course';
import BoostTrail from './environment/BoostTrail';
import CloudBanks from './environment/CloudBanks';
import DarkWater from './environment/DarkWater';
import Gates from './environment/Gates';
import PaperPlane from './environment/PaperPlane';
import Roadway from './environment/Roadway';
import Sky from './environment/Sky';
import type { GatePose, GateState, NitroState, RunState } from './types';

type FlightSceneProps = {
  flightDistance: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<NitroState>;
  onNitroChange: (amount: number) => void;
  onResolve: (gate: GateState, pose: GatePose) => void;
  player: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  runId: number;
  runState: React.MutableRefObject<RunState>;
  scoreRef: React.MutableRefObject<number>;
  target: React.MutableRefObject<{ x: number; y: number }>;
};

function CinematicCamera({ flightDistance, nitro, onNitroChange, reducedMotion, runState, scoreRef }: Pick<FlightSceneProps, 'flightDistance' | 'nitro' | 'onNitroChange' | 'reducedMotion' | 'runState' | 'scoreRef'>) {
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
      const canBoost = nitro.current.held && nitro.current.amount > 0.05;
      const intensityEase = 1 - Math.exp(-delta * (canBoost ? 4.8 : 6.8));
      nitro.current.intensity += ((canBoost ? 1 : 0) - nitro.current.intensity) * intensityEase;
      nitro.current.active = nitro.current.intensity > 0.025;
      nitro.current.amount = THREE.MathUtils.clamp(
        nitro.current.amount + (canBoost ? -NITRO_DRAIN_PER_SECOND : NITRO_CHARGE_PER_SECOND) * delta,
        0,
        NITRO_MAX,
      );
      if (nitro.current.amount <= 0) nitro.current.active = false;
      flightDistance.current += flightSpeed(scoreRef.current, nitro.current.intensity) * delta;
    } else {
      nitro.current.active = false;
      nitro.current.intensity += (0 - nitro.current.intensity) * (1 - Math.exp(-delta * 8));
    }

    if (Math.abs(lastReportedNitro.current - nitro.current.amount) >= 0.35 || lastReportedBoost.current !== nitro.current.active) {
      lastReportedNitro.current = nitro.current.amount;
      lastReportedBoost.current = nitro.current.active;
      onNitroChange(nitro.current.amount);
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

export default function KiteCircuitScene({ flightDistance, nitro, onNitroChange, onResolve, player, reducedMotion, runId, runState, scoreRef, target }: FlightSceneProps) {
  const gates = useMemo(() => GATE_STARTS.map((z, sequence) => ({ z, sequence, cycle: 0 })), []);

  useEffect(() => {
    gates.forEach((gate, index) => { gate.z = GATE_STARTS[index]; gate.cycle = 0; });
    player.current = { x: 0, y: KITE_HOME_Y };
    target.current = { x: 0, y: KITE_HOME_Y };
  }, [gates, player, runId, target]);

  return (
    <>
      <CinematicCamera flightDistance={flightDistance} nitro={nitro} onNitroChange={onNitroChange} reducedMotion={reducedMotion} runState={runState} scoreRef={scoreRef} />
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
      {gates.map((gate, index) => <Gates key={index} gate={gate} flightDistance={flightDistance} runState={runState} onResolve={onResolve} />)}
      <BoostTrail flightDistance={flightDistance} nitro={nitro} player={player} reducedMotion={reducedMotion} runState={runState} />
      <PaperPlane flightDistance={flightDistance} nitro={nitro} player={player} reducedMotion={reducedMotion} target={target} />
      <CinematicFinish reducedMotion={reducedMotion} />
    </>
  );
}
