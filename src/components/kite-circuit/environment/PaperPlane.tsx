'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { KITE_HOME_Y, KITE_LIMIT_X, KITE_MAX_Y, KITE_MIN_Y } from '../course';
import type { NitroState } from '../types';

type PaperPlaneProps = {
  flightDistance: React.MutableRefObject<number>;
  horizontalLimit: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<NitroState>;
  player: React.MutableRefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  target: React.MutableRefObject<{ x: number; y: number }>;
};

export default function PaperPlane({ flightDistance, horizontalLimit, nitro, player, reducedMotion, target }: PaperPlaneProps) {
  const group = useRef<THREE.Group>(null);
  const previousPosition = useRef(new THREE.Vector2(0, KITE_HOME_Y));
  const { size } = useThree();

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const ease = 1 - Math.exp(-delta * 11.5);
    const boostIntensity = nitro.current.active ? nitro.current.intensity : 0;
    const viewportLimit = Math.min(KITE_LIMIT_X, Math.max(1.3, (size.width / Math.max(size.height, 1)) * 3.35));
    const activeHorizontalLimit = Math.min(horizontalLimit.current, viewportLimit);
    target.current.x = THREE.MathUtils.clamp(target.current.x, -activeHorizontalLimit, activeHorizontalLimit);
    group.current.position.x += (target.current.x - group.current.position.x) * ease;
    group.current.position.y += (target.current.y - group.current.position.y) * ease;
    group.current.position.x = THREE.MathUtils.clamp(group.current.position.x, -activeHorizontalLimit, activeHorizontalLimit);
    group.current.position.y = THREE.MathUtils.clamp(group.current.position.y, KITE_MIN_Y, KITE_MAX_Y);
    group.current.position.z = -flightDistance.current - 0.88 * boostIntensity;
    const horizontalVelocity = (group.current.position.x - previousPosition.current.x) / Math.max(delta, 0.001);
    const verticalVelocity = (group.current.position.y - previousPosition.current.y) / Math.max(delta, 0.001);
    group.current.rotation.z = THREE.MathUtils.clamp(-horizontalVelocity * 0.095, -0.42, 0.42);
    group.current.rotation.x = THREE.MathUtils.clamp(-verticalVelocity * 0.035, -0.24, 0.24) + (reducedMotion ? 0 : Math.sin(clock.elapsedTime * 2.1) * 0.012) - 0.032 * boostIntensity;
    group.current.scale.setScalar(1 - 0.04 * boostIntensity);
    previousPosition.current.set(group.current.position.x, group.current.position.y);
    player.current.x = group.current.position.x;
    player.current.y = group.current.position.y;
  });

  return (
    <group ref={group} position={[0, KITE_HOME_Y, 0]}>
      <Suspense fallback={null}>
        <PaperPlaneAsset />
      </Suspense>
    </group>
  );
}

function PaperPlaneAsset() {
  const { scene } = useGLTF('/models/paper-plane.glb');
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(copy);
    const center = bounds.getCenter(new THREE.Vector3());
    const largestDimension = Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
    const normalizedScale = 3.45 / largestDimension;
    const orientation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

    copy.scale.setScalar(normalizedScale);
    copy.quaternion.copy(orientation);
    copy.position.copy(center).multiplyScalar(normalizedScale).applyQuaternion(orientation).multiplyScalar(-1);
    copy.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = new THREE.MeshStandardMaterial({
        color: '#fbfbf9',
        roughness: 0.3,
        metalness: 0.08,
        flatShading: true,
        side: THREE.DoubleSide,
      });
    });
    return copy;
  }, [scene]);

  return <primitive object={model} />;
}

useGLTF.preload('/models/paper-plane.glb');
