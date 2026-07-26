import * as THREE from 'three';
import type { GatePose } from './types';

export const CAMERA_START_Z = 9.2;

// The gates live in a fixed world while the camera travels into it. This keeps
// the composition cinematic: the flight advances through the course instead of
// looking like a conveyor of objects moving toward the player.
export const GATE_STARTS = [-68, -142, -224];
export const GATE_LOOP_LENGTH = 228;
export const ROAD_Y = -3.1;
export const ROAD_WIDTH = 29;
export const ROAD_LENGTH = 980;
export const FRAME_WIDTH = 12.2;
export const FRAME_HEIGHT = 9.2;
export const FRAME_BEAM = 0.34;
export const KITE_HOME_Y = -1.62;
export const KITE_LIMIT_X = 1.72;
export const KITE_LIMIT_Y = 0.86;

export function flightSpeed(score: number) {
  return 5.8 + Math.min(score * 0.0068, 10.8);
}

export function gatePose(relativeZ: number): GatePose {
  const depth = -relativeZ;
  // These are deliberately a staged composition, not three equal obstacles:
  // a monumental foreground portal, a calmer secondary frame, then a distant
  // vanishing-point marker.
  const near = { distance: 46, x: -0.5, y: 1.1, tilt: 0.245, scale: 1.68, aimX: 0, aimY: KITE_HOME_Y + 0.08 };
  const middle = { distance: 106, x: 0.1, y: 0.78, tilt: -0.12, scale: 1.04, aimX: 0.04, aimY: KITE_HOME_Y - 0.03 };
  const far = { distance: 176, x: 0, y: 0.52, tilt: 0.03, scale: 0.58, aimX: 0, aimY: KITE_HOME_Y };

  const interpolate = (from: typeof near, to: typeof middle, t: number): GatePose => ({
    x: THREE.MathUtils.lerp(from.x, to.x, t),
    y: THREE.MathUtils.lerp(from.y, to.y, t),
    tilt: THREE.MathUtils.lerp(from.tilt, to.tilt, t),
    scale: THREE.MathUtils.lerp(from.scale, to.scale, t),
    aimX: THREE.MathUtils.lerp(from.aimX, to.aimX, t),
    aimY: THREE.MathUtils.lerp(from.aimY, to.aimY, t),
  });

  if (depth <= middle.distance) {
    return interpolate(near, middle, THREE.MathUtils.clamp((depth - near.distance) / (middle.distance - near.distance), 0, 1));
  }

  return interpolate(middle, far, THREE.MathUtils.clamp((depth - middle.distance) / (far.distance - middle.distance), 0, 1));
}
