'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RunState } from './types';

type GameAudioOptions = {
  boostActive: boolean;
  enabled: boolean;
  runState: RunState;
};

function restart(audio: HTMLAudioElement | null) {
  if (!audio) return;

  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

export default function useGameAudio({ boostActive, enabled, runState }: GameAudioOptions) {
  const music = useRef<HTMLAudioElement | null>(null);
  const startCue = useRef<HTMLAudioElement | null>(null);
  const boostCue = useRef<HTMLAudioElement | null>(null);
  const hasStarted = useRef(false);
  const previousBoostActive = useRef(false);

  useEffect(() => {
    const loop = new Audio('/audio/paper-plane-loop.ogg');
    loop.loop = true;
    loop.preload = 'auto';
    loop.volume = 0.16;

    const start = new Audio('/audio/flight-start.ogg');
    start.preload = 'auto';
    start.volume = 0.3;

    const boost = new Audio('/audio/nitro-engage.ogg');
    boost.preload = 'auto';
    boost.volume = 0.22;

    music.current = loop;
    startCue.current = start;
    boostCue.current = boost;

    return () => {
      loop.pause();
      start.pause();
      boost.pause();
      music.current = null;
      startCue.current = null;
      boostCue.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hasStarted.current || !music.current) return;

    if (enabled && runState === 'running') {
      void music.current.play().catch(() => undefined);
    } else {
      music.current.pause();
    }
  }, [enabled, runState]);

  useEffect(() => {
    if (boostActive && !previousBoostActive.current && enabled && hasStarted.current) {
      restart(boostCue.current);
    }

    previousBoostActive.current = boostActive;
  }, [boostActive, enabled]);

  return useCallback(() => {
    hasStarted.current = true;
    if (!enabled) return;

    restart(startCue.current);
    restart(music.current);
  }, [enabled]);
}
