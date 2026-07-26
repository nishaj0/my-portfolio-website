export type RunState = 'intro' | 'running' | 'paused' | 'crashed';

export type ObstacleKind = 'barrier' | 'spinner' | 'slider' | 'orbiter';

export type ObstacleState = {
  id: number;
  kind: ObstacleKind;
  z: number;
  phase: number;
  lane: number;
};

export type ObstaclePose = {
  x: number;
  y: number;
  z: number;
  rotZ: number;
  halfW: number;
  halfH: number;
};

export type GateState = {
  sequence: number;
  z: number;
};

export type NitroState = {
  amount: number;
  held: boolean;
  locked: boolean;
  active: boolean;
  intensity: number;
};

export type GatePose = {
  x: number;
  y: number;
  tilt: number;
  scale: number;
};
