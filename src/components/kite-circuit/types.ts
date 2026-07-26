export type RunState = 'intro' | 'running' | 'paused';

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
