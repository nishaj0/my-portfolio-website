export type RunState = 'intro' | 'running' | 'paused' | 'gameover';

export type GateState = {
  cycle: number;
  sequence: number;
  z: number;
};

export type NitroState = {
  amount: number;
  held: boolean;
  active: boolean;
  intensity: number;
};

export type GatePose = {
  x: number;
  y: number;
  tilt: number;
  scale: number;
  aimX: number;
  aimY: number;
  passRadius: number;
};
