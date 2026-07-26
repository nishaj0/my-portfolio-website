import * as THREE from 'three';
import type { GatePose, ObstacleKind, ObstaclePose } from './types';

export const CAMERA_START_Z = 9.2;

// The gates live in a fixed world while the camera travels into it. This keeps
// the composition cinematic: the flight advances through the course instead of
// looking like a conveyor of objects moving toward the player.
export const GATE_STARTS = [-58, -136, -226];
export const GATE_LOOP_LENGTH = 246;
export const OBSTACLE_STARTS = [-96, -186, -276];
export const OBSTACLE_LOOP_LENGTH = GATE_LOOP_LENGTH;
export const OBSTACLE_KINDS: ObstacleKind[] = ['spinner', 'slider', 'orbiter', 'barrier'];
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

// Obstacle motion constants
export const SPINNER_LENGTH = 9;
export const SPINNER_THICKNESS = 0.38;
export const SPINNER_OMEGA = 1.1;
export const SLIDER_RANGE = 4.2;
export const SLIDER_PERIOD = 3.4;
export const SLIDER_HALF_W = 3.0;
export const SLIDER_HALF_H = 1.35;
export const ORBITER_RADIUS = 3.4;
export const ORBITER_OMEGA = 0.9;
export const ORBITER_COUNT = 3;
export const ORBITER_CHUNK = 0.85;
export const BARRIER_HALF_W = 3.1;
export const BARRIER_HALF_H = 1.35;
export const BARRIER_DEPTH = 0.55;
export const PLANE_HIT_RADIUS = 0.55;
export const OBSTACLE_DEPTH_GATE = 0.65;

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

export function obstaclePose(
  kind: ObstacleKind,
  relativeZ: number,
  phase: number,
  lane: number,
  clock: number,
): ObstaclePose {
  const depth = -relativeZ;
  const baseX = lane;
  const baseY = KITE_HOME_Y;

  switch (kind) {
    case 'barrier':
      return {
        x: baseX,
        y: baseY,
        z: depth,
        rotZ: 0,
        halfW: BARRIER_HALF_W,
        halfH: BARRIER_HALF_H,
      };
    case 'spinner': {
      const angle = clock * SPINNER_OMEGA + phase;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const halfW = Math.abs(SPINNER_LENGTH * 0.5 * cos) + Math.abs(SPINNER_THICKNESS * 0.5 * sin);
      const halfH = Math.abs(SPINNER_LENGTH * 0.5 * sin) + Math.abs(SPINNER_THICKNESS * 0.5 * cos);
      return {
        x: baseX,
        y: baseY,
        z: depth,
        rotZ: angle,
        halfW,
        halfH,
      };
    }
    case 'slider': {
      const offset = Math.sin((clock / SLIDER_PERIOD) * Math.PI * 2 + phase) * SLIDER_RANGE;
      return {
        x: baseX + offset,
        y: baseY,
        z: depth,
        rotZ: 0,
        halfW: SLIDER_HALF_W,
        halfH: SLIDER_HALF_H,
      };
    }
    case 'orbiter': {
      const angle = clock * ORBITER_OMEGA + phase;
      const ox = Math.cos(angle) * ORBITER_RADIUS;
      const oy = Math.sin(angle) * ORBITER_RADIUS;
      return {
        x: baseX + ox,
        y: baseY + oy,
        z: depth,
        rotZ: angle,
        halfW: ORBITER_CHUNK,
        halfH: ORBITER_CHUNK,
      };
    }
  }
}

export function hitsPlane(
  pose: ObstaclePose,
  planeX: number,
  planeY: number,
  planeZ: number,
  planeRadius: number,
): boolean {
  if (Math.abs(pose.z - planeZ) > OBSTACLE_DEPTH_GATE) return false;
  const dx = Math.abs(planeX - pose.x) - pose.halfW;
  const dy = Math.abs(planeY - pose.y) - pose.halfH;
  if (dx > planeRadius || dy > planeRadius) return false;
  if (dx <= 0 && dy <= 0) return true;
  return dx * dx + dy * dy <= planeRadius * planeRadius;
}
