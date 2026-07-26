export type RunState = 'intro' | 'running' | 'paused' | 'gameover';

export type GateState = {
  z: number;
};

export type GatePose = {
  x: number;
  y: number;
  tilt: number;
  scale: number;
  aimX: number;
  aimY: number;
};
