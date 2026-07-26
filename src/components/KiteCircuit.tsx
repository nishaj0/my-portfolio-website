'use client';

import { Canvas } from '@react-three/fiber';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KITE_HOME_Y, KITE_LIMIT_X, KITE_MAX_Y, KITE_MIN_Y } from './kite-circuit/course';
import KiteCircuitScene from './kite-circuit/Scene';
import type { NitroState, RunState } from './kite-circuit/types';
import useGameAudio from './kite-circuit/useGameAudio';

export default function KiteCircuit() {
  const [runState, setRunState] = useState<RunState>('intro');
  const [boostActive, setBoostActive] = useState(false);
  const [nitroAmount, setNitroAmount] = useState(0);
  const [runId, setRunId] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const runStateRef = useRef<RunState>('intro');
  const flightDistance = useRef(0);
  const player = useRef({ x: 0, y: KITE_HOME_Y });
  const target = useRef({ x: 0, y: KITE_HOME_Y });
  const pointerDown = useRef(false);
  const pressedKeys = useRef(new Set<string>());
  const nitro = useRef<NitroState>({ amount: 0, held: false, locked: false, active: false, intensity: 0 });
  const startAudio = useGameAudio({ boostActive, enabled: soundEnabled, runState });

  const updateRunState = useCallback((next: RunState) => {
    runStateRef.current = next;
    setRunState(next);
  }, []);

  useEffect(() => {
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

  const onCrash = useCallback(() => updateRunState('crashed'), [updateRunState]);

  const resetRun = useCallback(() => {
    startAudio();
    flightDistance.current = 0;
    player.current = { x: 0, y: KITE_HOME_Y };
    target.current = { x: 0, y: KITE_HOME_Y };
    pressedKeys.current.clear();
    nitro.current = { amount: 0, held: false, locked: false, active: false, intensity: 0 };
    setNitroAmount(0);
    setRunId((value) => value + 1);
    updateRunState('running');
    window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
  }, [startAudio, updateRunState]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (runStateRef.current === 'running') updateRunState('paused');
        else if (runStateRef.current === 'paused') updateRunState('running');
        return;
      }
      if (runStateRef.current !== 'running') return;
      const key = event.key.toLowerCase();
      if (key === 'shift') {
        event.preventDefault();
        if (!nitro.current.locked) nitro.current.held = true;
        window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
        return;
      }
      if (!['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) return;
      event.preventDefault();
      pressedKeys.current.add(key);
      window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'shift') {
        nitro.current.held = false;
        nitro.current.locked = false;
        return;
      }
      pressedKeys.current.delete(key);
    };
    const clearHeldInputs = () => {
      pressedKeys.current.clear();
      nitro.current.held = false;
      nitro.current.locked = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldInputs);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeldInputs);
    };
  }, [updateRunState]);

  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();
    const updateSteering = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (runStateRef.current === 'running' && pressedKeys.current.size > 0) {
        const held = pressedKeys.current;
        const horizontal = Number(held.has('arrowright') || held.has('d')) - Number(held.has('arrowleft') || held.has('a'));
        const vertical = Number(held.has('arrowup') || held.has('w')) - Number(held.has('arrowdown') || held.has('s'));
        const length = Math.hypot(horizontal, vertical) || 1;
        const steerSpeed = 5.35;
        target.current.x = Math.max(-KITE_LIMIT_X, Math.min(KITE_LIMIT_X, target.current.x + (horizontal / length) * steerSpeed * delta));
        target.current.y = Math.max(KITE_MIN_Y, Math.min(KITE_MAX_Y, target.current.y + (vertical / length) * steerSpeed * delta));
      }
      frame = window.requestAnimationFrame(updateSteering);
    };
    frame = window.requestAnimationFrame(updateSteering);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const steer = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
    const verticalOffset = 0.5 - y;
    const verticalRange = verticalOffset >= 0 ? KITE_MAX_Y - KITE_HOME_Y : KITE_HOME_Y - KITE_MIN_Y;
    target.current.x = (x - 0.5) * KITE_LIMIT_X * 2;
    target.current.y = KITE_HOME_Y + verticalOffset * verticalRange * 2;
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
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.46, 9.2], fov: 42 }} gl={{ antialias: true }}>
        <KiteCircuitScene runId={runId} runState={runStateRef} flightDistance={flightDistance} player={player} target={target} nitro={nitro} onBoostChange={setBoostActive} onCrash={onCrash} onNitroChange={setNitroAmount} reducedMotion={reducedMotion} />
      </Canvas>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-8">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-white/60">PAPER PLANE RUN</p>
          <div className="mt-4 w-24">
            <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.14em] text-white/55">
              <span>NITRO</span>
              <span>{Math.round(nitroAmount).toString().padStart(2, '0')}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden bg-white/20" aria-label={`Nitro ${Math.round(nitroAmount)} percent`}>
              <div className="h-full bg-white transition-[width] duration-100" style={{ width: `${nitroAmount}%` }} />
            </div>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            aria-pressed={soundEnabled}
            onClick={() => setSoundEnabled((enabled) => !enabled)}
            className="border border-white/65 px-3 py-2 text-xs font-bold tracking-[0.12em] transition-colors hover:bg-white hover:text-black"
          >
            SOUND {soundEnabled ? 'ON' : 'OFF'}
          </button>
          <Link href="/" className="border border-white px-3 py-2 text-xs font-bold tracking-[0.12em] transition-colors hover:bg-white hover:text-black">
            EXIT
          </Link>
        </div>
      </header>

      {runState === 'running' && (
        <button
          type="button"
          aria-label="Hold to use nitro"
          className="absolute bottom-6 right-6 z-20 border border-white/70 px-4 py-3 text-xs font-bold tracking-[0.14em] text-white sm:hidden"
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={(event) => {
            event.preventDefault();
            if (!nitro.current.locked) nitro.current.held = true;
            window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
          }}
          onPointerUp={() => { nitro.current.held = false; nitro.current.locked = false; }}
          onPointerLeave={() => { nitro.current.held = false; nitro.current.locked = false; }}
          onPointerCancel={() => { nitro.current.held = false; nitro.current.locked = false; }}
        >
          BOOST
        </button>
      )}

      {runState !== 'running' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-[#101112]/45 px-6 text-center backdrop-blur-sm">
          <div className="max-w-xl">
            {runState === 'intro' && (
              <>
                <p className="text-xs font-bold tracking-[0.18em] text-white/60">IN DEVELOPMENT</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Paper Plane Run <span className="block text-white/55">In Development</span></h1>
                <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">Guide the paper plane through the rotating monuments, dodge the obstacles, and explore the course as it evolves.</p>
                <p className="mt-5 text-sm font-semibold text-white/60">WASD / arrow keys or drag to steer</p>
                <p className="mt-2 text-sm font-semibold text-white/50">Hold Shift to use nitro</p>
              </>
            )}
            {runState === 'paused' && <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">Paused</h1>}
            {runState === 'crashed' && (
              <>
                <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">Crashed</h1>
                <p className="mt-4 text-base text-white/70">You hit an obstacle.</p>
              </>
            )}
            <button type="button" onClick={resetRun} className="mt-9 border-2 border-white bg-white px-6 py-3 text-sm font-bold tracking-[0.12em] text-black transition-colors hover:bg-transparent hover:text-white">
              {runState === 'paused' ? 'RESUME' : runState === 'crashed' ? 'RETRY' : 'START FLIGHT'}
            </button>
            {runState === 'paused' && <p className="mt-5 text-xs font-semibold tracking-[0.1em] text-white/50">ESC TO RESUME</p>}
          </div>
        </div>
      )}
    </main>
  );
}
