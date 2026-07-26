import * as THREE from 'three';
import type { GatePose } from './types';

export const CAMERA_START_Z = 9.2;

// The gates live in a fixed world while the camera travels into it. This keeps
// the composition cinematic: the flight advances through the course instead of
// looking like a conveyor of objects moving toward the player.
export const GATE_STARTS = [-58, -136, -226];
export const GATE_LOOP_LENGTH = 246;
export const ROAD_Y = -3.1;
// The deck floats above the water so its dark underside reads against the sea.
export const WATER_Y = ROAD_Y - 1.65;
export const ROAD_WIDTH = 25;
export const ROAD_LENGTH = 980;
export const FRAME_WIDTH = 14.8;
export const FRAME_HEIGHT = 10.9;
export const FRAME_BEAM = 0.42;
export const KITE_HOME_Y = -1.62;
export const KITE_LIMIT_X = 1.72;
export const KITE_LIMIT_Y = 0.86;
export const NITRO_MAX = 100;
export const NITRO_CHARGE_PER_SECOND = 6.5;
export const NITRO_GATE_BONUS = 12;
export const NITRO_DRAIN_PER_SECOND = 22;
export const NITRO_SPEED_MULTIPLIER = 1.7;

export function flightSpeed(score: number, boostIntensity = 0) {
  const cruiseSpeed = 6.1 + Math.min(score * 0.0105, 16);
  return cruiseSpeed * THREE.MathUtils.lerp(1, NITRO_SPEED_MULTIPLIER, boostIntensity);
}

export function gatePose(relativeZ: number, sequence = 0, cycle = 0): GatePose {
  const depth = -relativeZ;
  // These are deliberately a staged composition, not three equal obstacles:
  // a monumental foreground portal, a calmer secondary frame, then a distant
  // vanishing-point marker.
  const near = { distance: 46, x: -0.5, y: 1.1, tilt: 0.245, scale: 1.68, aimX: 0, aimY: KITE_HOME_Y + 0.08 };
  const middle = { distance: 106, x: 0.1, y: 0.78, tilt: -0.12, scale: 1.04, aimX: 0.04, aimY: KITE_HOME_Y - 0.03 };
  const far = { distance: 176, x: 0, y: 0.52, tilt: 0.03, scale: 0.58, aimX: 0, aimY: KITE_HOME_Y };

  const interpolate = (from: typeof near, to: typeof middle, t: number) => ({
    x: THREE.MathUtils.lerp(from.x, to.x, t),
    y: THREE.MathUtils.lerp(from.y, to.y, t),
    tilt: THREE.MathUtils.lerp(from.tilt, to.tilt, t),
    scale: THREE.MathUtils.lerp(from.scale, to.scale, t),
  });

  const stagedPose = depth <= middle.distance
    ? interpolate(near, middle, THREE.MathUtils.clamp((depth - near.distance) / (middle.distance - near.distance), 0, 1))
    : interpolate(middle, far, THREE.MathUtils.clamp((depth - middle.distance) / (far.distance - middle.distance), 0, 1));

  const pattern = [
    { x: -0.42, y: 0.16, turn: -0.14 },
    { x: 0.62, y: -0.22, turn: 0.2 },
    { x: -0.7, y: 0.34, turn: -0.24 },
    { x: 0.35, y: 0.46, turn: 0.16 },
  ];
  const phase = (sequence + cycle * 3) % pattern.length;
  const route = pattern[phase];
  const difficulty = Math.min(1, cycle * 0.16 + sequence * 0.08);
  const routeScale = 0.9 + difficulty * 0.28;
  const aimX = THREE.MathUtils.clamp(stagedPose.x + route.x * routeScale, -1.45, 1.45);
  const aimY = KITE_HOME_Y + route.y * routeScale;
  const approachTurn = Math.sin(depth * 0.055 + phase * 1.7) * (0.045 + difficulty * 0.07);

  return {
    x: aimX,
    y: stagedPose.y,
    tilt: stagedPose.tilt + route.turn + approachTurn,
    scale: stagedPose.scale,
    aimX,
    aimY,
    passRadius: Math.max(0.7, 0.98 - difficulty * 0.22),
  };
}
