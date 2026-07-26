'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  CAMERA_START_Z,
  FRAME_BEAM,
  FRAME_HEIGHT,
  FRAME_WIDTH,
  GATE_STARTS,
  KITE_HOME_Y,
  ROAD_LENGTH,
  ROAD_WIDTH,
  ROAD_Y,
  flightSpeed,
  gatePose,
} from './course';
import { SKY_FRAGMENT_SHADER, SKY_VERTEX_SHADER } from './shaders';
import type { GatePose, GateState, RunState } from './types';
import VolumetricFog from './VolumetricFog';

type FlightSceneProps = {
  runId: number;
  runState: React.MutableRefObject<RunState>;
  scoreRef: React.MutableRefObject<number>;
  flightDistance: React.MutableRefObject<number>;
  player: React.MutableRefObject<{ x: number; y: number }>;
  target: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  onResolve: (gate: GateState, pose: GatePose) => void;
};

function CinematicCamera({
  flightDistance,
  reducedMotion,
  runState,
  scoreRef,
}: Pick<FlightSceneProps, 'flightDistance' | 'reducedMotion' | 'runState' | 'scoreRef'>) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.46, CAMERA_START_Z);
    if (camera instanceof THREE.PerspectiveCamera) camera.fov = 42;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(({ clock }, delta) => {
    if (runState.current === 'running') {
      flightDistance.current += flightSpeed(scoreRef.current) * delta;
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
    gl.toneMappingExposure = 1.22;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);

  return null;
}

function CinematicFinish({ reducedMotion }: Pick<FlightSceneProps, 'reducedMotion'>) {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom luminanceThreshold={0.86} luminanceSmoothing={0.68} intensity={reducedMotion ? 0 : 0.34} height={420} />
      <Vignette offset={0.32} darkness={0.22} />
    </EffectComposer>
  );
}

function SkyDome() {
  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-3}>
      <sphereGeometry args={[420, 48, 28]} />
      <shaderMaterial vertexShader={SKY_VERTEX_SHADER} fragmentShader={SKY_FRAGMENT_SHADER} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function makeTriangle(points: [number, number, number][]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function Kite({ flightDistance, target, player, reducedMotion }: Pick<FlightSceneProps, 'flightDistance' | 'target' | 'player' | 'reducedMotion'>) {
  const group = useRef<THREE.Group>(null);
  const panels = useMemo(() => ({
    leftWing: makeTriangle([[0, 1.25, 0.18], [-1.46, -0.48, 0], [0, -0.28, 0.16]]),
    rightWing: makeTriangle([[0, 1.25, 0.18], [0, -0.28, 0.16], [1.46, -0.48, 0]]),
    lowerLeft: makeTriangle([[-1.46, -0.48, 0], [0, -0.28, 0.16], [0, -1.5, 0.06]]),
    lowerRight: makeTriangle([[0, -0.28, 0.16], [1.46, -0.48, 0], [0, -1.5, 0.06]]),
  }), []);

  useEffect(() => () => Object.values(panels).forEach((panel) => panel.dispose()), [panels]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const ease = 1 - Math.exp(-delta * 8);
    group.current.position.x += (target.current.x - group.current.position.x) * ease;
    group.current.position.y += (target.current.y - group.current.position.y) * ease;
    group.current.position.z = -flightDistance.current;
    group.current.rotation.z = -group.current.position.x * 0.13;
    group.current.rotation.x = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 2.1) * 0.018;
    player.current.x = group.current.position.x;
    player.current.y = group.current.position.y;
  });

  return (
    <group ref={group} position={[0, KITE_HOME_Y, 0]}>
      <mesh geometry={panels.leftWing} castShadow><meshStandardMaterial color="#f7f7f6" roughness={0.3} metalness={0.18} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={panels.rightWing} castShadow><meshStandardMaterial color="#e5e6e6" roughness={0.34} metalness={0.16} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={panels.lowerLeft}><meshStandardMaterial color="#d7d8d8" roughness={0.43} metalness={0.1} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={panels.lowerRight}><meshStandardMaterial color="#fafafa" roughness={0.3} metalness={0.17} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function MonumentGate({ gate, flightDistance, runState, onResolve }: Pick<FlightSceneProps, 'flightDistance' | 'runState' | 'onResolve'> & { gate: GateState }) {
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
      depth: 0.46,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.09,
      bevelThickness: 0.1,
    });
    frame.translate(0, 0, -0.23);
    frame.computeVertexNormals();
    return frame;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  const initialPose = gatePose(gate.z - CAMERA_START_Z);

  useFrame(() => {
    if (!group.current) return;
    const relativeZ = gate.z - (CAMERA_START_Z - flightDistance.current);
    const pose = gatePose(relativeZ);
    group.current.position.set(pose.x, pose.y, gate.z);
    group.current.rotation.z = pose.tilt;
    group.current.scale.setScalar(pose.scale);
    if (relativeZ > -1.1 && runState.current === 'running') onResolve(gate, pose);
  });

  return (
    <group ref={group} position={[initialPose.x, initialPose.y, gate.z]} rotation={[0, 0, initialPose.tilt]}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#f7f7f7" roughness={0.18} metalness={0.72} emissive="#101112" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function Roadway() {
  return (
    <>
      <mesh position={[0, ROAD_Y, -180]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#050607" roughness={0.78} metalness={0.08} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (ROAD_WIDTH / 2 - 0.2), ROAD_Y + 0.1, -180]}>
          <mesh>
            <boxGeometry args={[0.42, 0.18, ROAD_LENGTH]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.46} roughness={0.18} metalness={0.18} />
          </mesh>
          <mesh position={[side * 0.22, -0.09, 0]}>
            <boxGeometry args={[0.22, 0.14, ROAD_LENGTH]} />
            <meshStandardMaterial color="#020303" roughness={0.74} />
          </mesh>
        </group>
      ))}
    </>
  );
}

export default function KiteCircuitScene({ runId, runState, scoreRef, flightDistance, player, target, reducedMotion, onResolve }: FlightSceneProps) {
  const gates = useMemo(() => GATE_STARTS.map((z) => ({ z })), []);

  useEffect(() => {
    gates.forEach((gate, index) => { gate.z = GATE_STARTS[index]; });
    player.current = { x: 0, y: KITE_HOME_Y };
    target.current = { x: 0, y: KITE_HOME_Y };
  }, [gates, player, runId, target]);

  return (
    <>
      <CinematicCamera flightDistance={flightDistance} reducedMotion={reducedMotion} runState={runState} scoreRef={scoreRef} />
      <RendererSettings />
      <color attach="background" args={['#020303']} />
      <fogExp2 attach="fog" args={['#101214', 0.0078]} />
      <SkyDome />
      <hemisphereLight args={['#fafafa', '#030303', 1.18]} />
      <directionalLight position={[-8, 13, 8]} intensity={2.35} color="#ffffff" />
      <pointLight position={[12, 1, -30]} intensity={10} distance={78} color="#d7d9da" />
      <Roadway />
      <VolumetricFog flightDistance={flightDistance} reducedMotion={reducedMotion} runState={runState} scoreRef={scoreRef} />
      {gates.map((gate, index) => <MonumentGate key={index} gate={gate} flightDistance={flightDistance} runState={runState} onResolve={onResolve} />)}
      <Kite flightDistance={flightDistance} target={target} player={player} reducedMotion={reducedMotion} />
      <CinematicFinish reducedMotion={reducedMotion} />
    </>
  );
}
