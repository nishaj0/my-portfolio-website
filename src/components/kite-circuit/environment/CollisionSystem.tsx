'use client';

import { useFrame } from '@react-three/fiber';
import { CAMERA_START_Z, PLANE_HIT_RADIUS, OBSTACLE_DEPTH_GATE, obstaclePose } from '../course';
import type { ObstacleState, RunState } from '../types';

type CollisionSystemProps = {
  flightDistance: React.MutableRefObject<number>;
  nitro: React.MutableRefObject<{ amount: number; held: boolean; locked: boolean; active: boolean; intensity: number }>;
  obstacles: ObstacleState[];
  player: React.MutableRefObject<{ x: number; y: number }>;
  runState: React.MutableRefObject<RunState>;
  onCrash: () => void;
};

export default function CollisionSystem({
  flightDistance,
  nitro,
  obstacles,
  player,
  runState,
  onCrash,
}: CollisionSystemProps) {
  useFrame(({ clock }) => {
    if (runState.current !== 'running') return;
    const planeWorldZ = -flightDistance.current - 0.88 * (nitro.current.active ? nitro.current.intensity : 0);
    for (const obstacle of obstacles) {
      if (Math.abs(obstacle.z - planeWorldZ) > OBSTACLE_DEPTH_GATE) continue;
      const relativeZ = obstacle.z - (CAMERA_START_Z - flightDistance.current);
      const pose = obstaclePose(
        obstacle.kind,
        relativeZ,
        obstacle.phase,
        obstacle.lane,
        clock.elapsedTime,
      );
      const dx = Math.abs(player.current.x - pose.x) - pose.halfW;
      const dy = Math.abs(player.current.y - pose.y) - pose.halfH;
      if (dx > PLANE_HIT_RADIUS || dy > PLANE_HIT_RADIUS) continue;
      if (dx <= 0 && dy <= 0) {
        onCrash();
        runState.current = 'crashed';
        return;
      }
      if (dx * dx + dy * dy <= PLANE_HIT_RADIUS * PLANE_HIT_RADIUS) {
        onCrash();
        runState.current = 'crashed';
        return;
      }
    }
  });

  return null;
}
