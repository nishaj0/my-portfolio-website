'use client';

import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GATE_LOOP_LENGTH, KITE_HOME_Y, KITE_LIMIT_X, KITE_LIMIT_Y } from './kite-circuit/course';
import KiteCircuitScene from './kite-circuit/Scene';
import type { GatePose, GateState, RunState } from './kite-circuit/types';

export default function KiteCircuit() {
  const [runState, setRunState] = useState<RunState>('intro');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [runId, setRunId] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const runStateRef = useRef<RunState>('intro');
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const flightDistance = useRef(0);
  const player = useRef({ x: 0, y: KITE_HOME_Y });
  const target = useRef({ x: 0, y: KITE_HOME_Y });
  const pointerDown = useRef(false);

  const updateRunState = useCallback((next: RunState) => {
    runStateRef.current = next;
    setRunState(next);
  }, []);

  useEffect(() => {
    const storedBest = Number(window.localStorage.getItem('kite-circuit-best') ?? 0);
    if (Number.isFinite(storedBest)) setBest(storedBest);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      window.dispatchEvent(new Event('kite-circuit-cursor-reset'));
    };
  }, []);

  const resetRun = useCallback(() => {
    scoreRef.current = 0;
    comboRef.current = 0;
    flightDistance.current = 0;
    setScore(0);
    setCombo(0);
    setRunId((value) => value + 1);
    updateRunState('running');
    window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
  }, [updateRunState]);

  const resolveGate = useCallback((gate: GateState, pose: GatePose) => {
    if (runStateRef.current !== 'running') return;
    const distance = Math.hypot(player.current.x - pose.aimX, player.current.y - pose.aimY);
    gate.z -= GATE_LOOP_LENGTH;

    if (distance < 1.16) {
      comboRef.current += 1;
      scoreRef.current += 100 + comboRef.current * 25;
      setCombo(comboRef.current);
      setScore(scoreRef.current);
      return;
    }

    setCombo(0);
    if (scoreRef.current > best) {
      window.localStorage.setItem('kite-circuit-best', String(scoreRef.current));
      setBest(scoreRef.current);
    }
    updateRunState('gameover');
  }, [best, updateRunState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (runStateRef.current === 'running') updateRunState('paused');
        else if (runStateRef.current === 'paused') updateRunState('running');
        return;
      }
      if (runStateRef.current !== 'running') return;
      const step = 0.34;
      const key = event.key.toLowerCase();
      if (!['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) return;
      event.preventDefault();
      window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
      if (key === 'arrowup' || key === 'w') target.current.y = Math.min(KITE_HOME_Y + KITE_LIMIT_Y, target.current.y + step);
      if (key === 'arrowdown' || key === 's') target.current.y = Math.max(KITE_HOME_Y - KITE_LIMIT_Y, target.current.y - step);
      if (key === 'arrowleft' || key === 'a') target.current.x = Math.max(-KITE_LIMIT_X, target.current.x - step);
      if (key === 'arrowright' || key === 'd') target.current.x = Math.min(KITE_LIMIT_X, target.current.x + step);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [updateRunState]);

  const steer = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
    target.current.x = (x - 0.5) * KITE_LIMIT_X * 2;
    target.current.y = KITE_HOME_Y + (0.5 - y) * KITE_LIMIT_Y * 2;
  }, []);

  return (
    <main
      className="fixed inset-0 z-[70] touch-none overflow-hidden bg-[#111214] text-white"
      onPointerDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest('button, a')) return;
        pointerDown.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        steer(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (pointerDown.current) steer(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerUp={() => { pointerDown.current = false; }}
      onPointerCancel={() => { pointerDown.current = false; }}
    >
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.46, 9.2], fov: 42 }} gl={{ antialias: true }}>
        <KiteCircuitScene runId={runId} runState={runStateRef} scoreRef={scoreRef} flightDistance={flightDistance} player={player} target={target} reducedMotion={reducedMotion} onResolve={resolveGate} />
      </Canvas>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-8">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-white/60">KITE CIRCUIT</p>
          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{score.toString().padStart(4, '0')}</p>
        </div>
        <div className="flex items-start gap-5 text-right">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-white/60">BEST</p>
            <p className="mt-2 text-lg font-bold tabular-nums">{best.toString().padStart(4, '0')}</p>
          </div>
          <Link href="/" className="pointer-events-auto border border-white px-3 py-2 text-xs font-bold tracking-[0.12em] transition-colors hover:bg-white hover:text-black">
            EXIT
          </Link>
        </div>
      </header>

      {runState === 'running' && combo > 1 && (
        <div className="pointer-events-none absolute bottom-7 left-1/2 z-20 -translate-x-1/2 text-center">
          <p className="text-xs font-bold tracking-[0.16em] text-white/60">COMBO</p>
          <p className="mt-1 text-3xl font-bold">×{combo}</p>
        </div>
      )}

      {runState !== 'running' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-[#101112]/45 px-6 text-center backdrop-blur-sm">
          <div className="max-w-xl">
            {runState === 'intro' && (
              <>
                <p className="text-xs font-bold tracking-[0.18em] text-white/60">ENDLESS AERIAL RUN</p>
                <h1 className="mt-4 text-6xl font-bold tracking-tight sm:text-8xl">Kite Circuit</h1>
                <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">Thread the kite through the monument frames. Miss the flight line and the run is over.</p>
                <p className="mt-5 text-sm font-semibold text-white/60">WASD / arrow keys or drag to steer</p>
              </>
            )}
            {runState === 'paused' && <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">Paused</h1>}
            {runState === 'gameover' && (
              <>
                <p className="text-xs font-bold tracking-[0.18em] text-white/60">RUN COMPLETE</p>
                <h1 className="mt-4 text-6xl font-bold tracking-tight sm:text-8xl">{score.toString().padStart(4, '0')}</h1>
                <p className="mt-4 text-lg text-white/75">Best score: {best.toString().padStart(4, '0')}</p>
              </>
            )}
            <button type="button" onClick={resetRun} className="mt-9 border-2 border-white bg-white px-6 py-3 text-sm font-bold tracking-[0.12em] text-black transition-colors hover:bg-transparent hover:text-white">
              {runState === 'paused' ? 'RESUME' : runState === 'gameover' ? 'RETRY RUN' : 'START FLIGHT'}
            </button>
            {runState !== 'intro' && <p className="mt-5 text-xs font-semibold tracking-[0.1em] text-white/50">ESC TO {runState === 'paused' ? 'RESUME' : 'PAUSE'}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
