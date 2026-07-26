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
export const KITE_LIMIT_X = 5.25;
export const KITE_LIMIT_Y = 2.35;
export const KITE_MIN_Y = ROAD_Y + 0.9;
export const KITE_MAX_Y = KITE_HOME_Y + KITE_LIMIT_Y;
export const NITRO_MAX = 100;
export const NITRO_CHARGE_PER_SECOND = 6.5;
export const NITRO_DRAIN_PER_SECOND = 22;
export const NITRO_SPEED_MULTIPLIER = 1.7;

export function flightSpeed(boostIntensity = 0) {
  const cruiseSpeed = 3.7;
  return cruiseSpeed * THREE.MathUtils.lerp(1, NITRO_SPEED_MULTIPLIER, boostIntensity);
}

export function gatePose(relativeZ: number, sequence = 0): GatePose {
  const depth = -relativeZ;
  // These are deliberately a staged composition, not three equal obstacles:
  // a monumental foreground portal, a calmer secondary frame, then a distant
  // vanishing-point marker.
  const near = { distance: 46, x: -0.5, y: 1.1, tilt: 0.245, scale: 1.68 };
  const middle = { distance: 106, x: 0.1, y: 0.78, tilt: -0.12, scale: 1.04 };
  const far = { distance: 176, x: 0, y: 0.52, tilt: 0.03, scale: 0.58 };

  const interpolate = (from: typeof near, to: typeof middle, t: number) => ({
    x: THREE.MathUtils.lerp(from.x, to.x, t),
    y: THREE.MathUtils.lerp(from.y, to.y, t),
    tilt: THREE.MathUtils.lerp(from.tilt, to.tilt, t),
    scale: THREE.MathUtils.lerp(from.scale, to.scale, t),
  });

  const stagedPose = depth <= middle.distance
    ? interpolate(near, middle, THREE.MathUtils.clamp((depth - near.distance) / (middle.distance - near.distance), 0, 1))
    : interpolate(middle, far, THREE.MathUtils.clamp((depth - middle.distance) / (far.distance - middle.distance), 0, 1));

  return {
    x: stagedPose.x,
    y: stagedPose.y,
    tilt: stagedPose.tilt + (sequence - 1) * 0.08,
    scale: stagedPose.scale,
  };
}
