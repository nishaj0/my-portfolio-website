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
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [runId, setRunId] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [touchControls, setTouchControls] = useState(false);
  const [joystick, setJoystick] = useState({ x: 0, y: 0, active: false });
  const runStateRef = useRef<RunState>('intro');
  const flightDistance = useRef(0);
  const player = useRef({ x: 0, y: KITE_HOME_Y });
  const target = useRef({ x: 0, y: KITE_HOME_Y });
  const horizontalLimit = useRef(KITE_LIMIT_X);
  const joystickInput = useRef({ x: 0, y: 0 });
  const pointerDown = useRef(false);
  const pressedKeys = useRef(new Set<string>());
  const nitro = useRef<NitroState>({ amount: 0, held: false, locked: false, active: false, intensity: 0 });
  const startAudio = useGameAudio({ boostActive, enabled: soundEnabled, runState });

  const updateRunState = useCallback((next: RunState) => {
    runStateRef.current = next;
    setRunState(next);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('paper-plane-highscore');
    if (saved) setHighscore(parseInt(saved, 10) || 0);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const updateTouchControls = () => setTouchControls(media.matches);
    updateTouchControls();
    media.addEventListener('change', updateTouchControls);
    return () => media.removeEventListener('change', updateTouchControls);
  }, []);

  useEffect(() => {
    const updateHorizontalLimit = () => {
      const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
      horizontalLimit.current = Math.min(KITE_LIMIT_X, Math.max(1.3, aspect * 3.35));
      target.current.x = Math.max(-horizontalLimit.current, Math.min(horizontalLimit.current, target.current.x));
    };
    updateHorizontalLimit();
    window.addEventListener('resize', updateHorizontalLimit);
    window.addEventListener('orientationchange', updateHorizontalLimit);
    return () => {
      window.removeEventListener('resize', updateHorizontalLimit);
      window.removeEventListener('orientationchange', updateHorizontalLimit);
    };
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

  const onCrash = useCallback(() => {
    const finalScore = Math.floor(flightDistance.current);
    setScore(finalScore);
    setHighscore((prev) => {
      if (finalScore > prev) {
        localStorage.setItem('paper-plane-highscore', String(finalScore));
        return finalScore;
      }
      return prev;
    });
    updateRunState('crashed');
  }, [updateRunState]);

  const resetRun = useCallback(() => {
    startAudio();
    flightDistance.current = 0;
    player.current = { x: 0, y: KITE_HOME_Y };
    target.current = { x: 0, y: KITE_HOME_Y };
    pressedKeys.current.clear();
    joystickInput.current = { x: 0, y: 0 };
    setJoystick({ x: 0, y: 0, active: false });
    nitro.current = { amount: 0, held: false, locked: false, active: false, intensity: 0 };
    setScore(0);
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
      joystickInput.current = { x: 0, y: 0 };
      setJoystick({ x: 0, y: 0, active: false });
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
    let lastScore = 0;
    const updateSteering = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (runStateRef.current === 'running') {
        const currentScore = Math.floor(flightDistance.current);
        if (currentScore !== lastScore) {
          lastScore = currentScore;
          setScore(currentScore);
        }
        if (pressedKeys.current.size > 0 || joystickInput.current.x !== 0 || joystickInput.current.y !== 0) {
          const held = pressedKeys.current;
          const horizontal = Number(held.has('arrowright') || held.has('d')) - Number(held.has('arrowleft') || held.has('a')) + joystickInput.current.x;
          const vertical = Number(held.has('arrowup') || held.has('w')) - Number(held.has('arrowdown') || held.has('s')) + joystickInput.current.y;
          const length = Math.hypot(horizontal, vertical) || 1;
          const steerSpeed = 5.35;
          target.current.x = Math.max(-horizontalLimit.current, Math.min(horizontalLimit.current, target.current.x + (horizontal / length) * steerSpeed * delta));
          target.current.y = Math.max(KITE_MIN_Y, Math.min(KITE_MAX_Y, target.current.y + (vertical / length) * steerSpeed * delta));
        }
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
    target.current.x = (x - 0.5) * horizontalLimit.current * 2;
    target.current.y = KITE_HOME_Y + verticalOffset * verticalRange * 2;
  }, []);

  const updateJoystick = useCallback((clientX: number, clientY: number, element: HTMLElement) => {
    const bounds = element.getBoundingClientRect();
    const radius = Math.min(bounds.width, bounds.height) * 0.29;
    const deltaX = clientX - (bounds.left + bounds.width / 2);
    const deltaY = clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(deltaX, deltaY);
    const scale = distance > radius ? radius / distance : 1;
    const x = (deltaX * scale) / radius;
    const y = (-deltaY * scale) / radius;

    joystickInput.current = { x, y };
    setJoystick({ x, y, active: true });
  }, []);

  const releaseJoystick = useCallback(() => {
    joystickInput.current = { x: 0, y: 0 };
    setJoystick({ x: 0, y: 0, active: false });
  }, []);

  const releaseNitro = useCallback(() => {
    nitro.current.held = false;
    nitro.current.locked = false;
  }, []);

  return (
    <main
      className="fixed inset-0 z-[70] touch-none overflow-hidden bg-[#111214] text-white"
      onPointerDown={(event) => {
        if (touchControls) return;
        if (event.target instanceof HTMLElement && event.target.closest('button, a')) return;
        pointerDown.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        steer(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (!touchControls && pointerDown.current) steer(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerUp={() => { pointerDown.current = false; }}
      onPointerCancel={() => { pointerDown.current = false; }}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.46, 9.2], fov: 42 }} gl={{ antialias: true }}>
        <KiteCircuitScene runId={runId} runState={runStateRef} flightDistance={flightDistance} horizontalLimit={horizontalLimit} player={player} target={target} nitro={nitro} onBoostChange={setBoostActive} onCrash={onCrash} onNitroChange={setNitroAmount} reducedMotion={reducedMotion} />
      </Canvas>

      {touchControls ? (
        <header
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between"
          style={{ padding: 'max(0.75rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right)) 0 max(0.75rem, env(safe-area-inset-left))' }}
        >
          <div className="rounded-xl border border-white/15 bg-[#080a0d]/90 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.28)]" style={{ width: 'min(15.5rem, calc(100vw - 9rem))' }}>
            <p className="text-[10px] font-bold tracking-[0.15em] text-white/65">PAPER PLANE RUN</p>
            <div className="mt-2.5 grid grid-cols-[minmax(4.5rem,1fr)_auto_auto] items-end gap-x-3">
              <div className="min-w-0">
                <div className="flex items-center justify-between text-[9px] font-bold tracking-[0.12em] text-white/55">
                  <span>NITRO</span>
                  <span>{Math.round(nitroAmount).toString().padStart(2, '0')}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden bg-white/20" aria-label={`Nitro ${Math.round(nitroAmount)} percent`}>
                  <div className="h-full bg-white transition-[width] duration-100" style={{ width: `${nitroAmount}%` }} />
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.12em] text-white/55">SCORE</p>
                <p className="mt-0.5 text-base font-bold leading-none tabular-nums">{score.toString().padStart(4, '0')}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.12em] text-white/55">BEST</p>
                <p className="mt-0.5 text-base font-bold leading-none tabular-nums">{highscore.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>
          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              aria-pressed={soundEnabled}
              onClick={() => setSoundEnabled((enabled) => !enabled)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-white/50 bg-[#080a0d]/90 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-colors active:bg-white active:text-black"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                {soundEnabled ? <path d="M4 9v6h4l5 4V5L8 9H4Zm12.3 3c0-1.45-.83-2.7-2.04-3.31v6.62A3.63 3.63 0 0 0 16.3 12Zm-2.04-8.12v2.06a6.13 6.13 0 0 1 0 12.12v2.06a8.13 8.13 0 0 0 0-16.24Z" /> : <path d="m3 7.3 1.4-1.4L20.1 21.6l-1.4 1.4-3.3-3.3-2.4 1.9v-5.1L8 12.5H4v-6h3.2l-4.2-4.2Zm10 1.5v3.4l-3.4-3.4H13Zm5.2 3.2c0 .63-.14 1.22-.39 1.75l-1.52-1.52c.12-.46.12-.95 0-1.4l1.52-1.52c.25.53.39 1.12.39 1.75ZM14.3 5.9V3.84a8.12 8.12 0 0 1 5.8 12.36l-1.45-1.45A6.12 6.12 0 0 0 14.3 5.9Z" />}
              </svg>
            </button>
            <Link href="/" aria-label="Exit game" className="grid h-11 w-11 place-items-center rounded-xl border border-white/50 bg-[#080a0d]/90 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-colors active:bg-white active:text-black">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
              </svg>
            </Link>
          </div>
        </header>
      ) : (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-8">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-white/60">PAPER PLANE RUN</p>
            <div className="mt-4 flex gap-6">
              <div className="w-24">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.14em] text-white/55">
                  <span>NITRO</span>
                  <span>{Math.round(nitroAmount).toString().padStart(2, '0')}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden bg-white/20" aria-label={`Nitro ${Math.round(nitroAmount)} percent`}>
                  <div className="h-full bg-white transition-[width] duration-100" style={{ width: `${nitroAmount}%` }} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-white/55">SCORE</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{score.toString().padStart(4, '0')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-white/55">BEST</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{highscore.toString().padStart(4, '0')}</p>
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
      )}

      {touchControls && runState === 'running' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between" style={{ padding: '0 max(1.25rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left))' }}>
          <div
            aria-label="Flight joystick"
            className="pointer-events-auto relative grid h-28 w-28 touch-none place-items-center rounded-full border border-white/40 bg-black/35 shadow-[0_12px_30px_rgba(0,0,0,0.32)]"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
              updateJoystick(event.clientX, event.clientY, event.currentTarget);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) updateJoystick(event.clientX, event.clientY, event.currentTarget);
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
              releaseJoystick();
            }}
            onPointerCancel={releaseJoystick}
          >
            <span className="absolute h-[46%] w-px bg-white/30" />
            <span className="absolute h-px w-[46%] bg-white/30" />
            <span className="absolute top-3 text-[9px] font-bold tracking-[0.16em] text-white/45">STEER</span>
            <span
              className={`relative h-12 w-12 rounded-full border transition-[transform,border-color,background-color] duration-75 ${joystick.active ? 'border-white bg-white/25' : 'border-white/70 bg-white/10'}`}
              style={{ transform: `translate(${joystick.x * 25}px, ${-joystick.y * 25}px)` }}
            />
          </div>
          <button
            type="button"
            aria-label="Hold to use nitro"
            aria-pressed={boostActive}
            className={`pointer-events-auto grid h-24 w-24 touch-none place-items-center rounded-full border shadow-[0_12px_30px_rgba(0,0,0,0.32)] transition-colors ${boostActive ? 'border-white bg-white text-black' : 'border-white/70 bg-black/35 text-white'}`}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
              if (!nitro.current.locked) nitro.current.held = true;
              window.dispatchEvent(new Event('kite-circuit-cursor-hide'));
            }}
            onPointerUp={releaseNitro}
            onPointerCancel={releaseNitro}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 fill-current">
              <path d="M13.5 1.5 4.8 13h6l-.3 9.5L19.2 11h-6.1l.4-9.5Z" />
            </svg>
            <span className="text-[9px] font-bold tracking-[0.16em]">NITRO</span>
          </button>
        </div>
      )}

      {runState !== 'running' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-[#101112]/45 px-6 text-center backdrop-blur-sm">
          <div className="max-w-xl">
            {runState === 'intro' && (
              <>
                <p className="text-xs font-bold tracking-[0.18em] text-white/60">IN DEVELOPMENT</p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Paper Plane Run <span className="block text-white/55">In Development</span></h1>
                <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">Guide the paper plane through the rotating monuments, dodge the obstacles, and explore the course as it evolves.</p>
                {touchControls ? (
                  <>
                    <p className="mt-5 text-sm font-semibold text-white/60">Use the joystick to steer</p>
                    <p className="mt-2 text-sm font-semibold text-white/50">Hold the nitro button to boost</p>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-sm font-semibold text-white/60">WASD / arrow keys or drag to steer</p>
                    <p className="mt-2 text-sm font-semibold text-white/50">Hold Shift to use nitro</p>
                  </>
                )}
              </>
            )}
            {runState === 'paused' && <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">Paused</h1>}
            {runState === 'crashed' && (
              <>
                <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">Crashed</h1>
                <p className="mt-4 text-base text-white/70">You hit an obstacle.</p>
                <div className="mt-6 flex items-center justify-center gap-8">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] text-white/55">SCORE</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums">{score.toString().padStart(4, '0')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] text-white/55">BEST</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums">{highscore.toString().padStart(4, '0')}</p>
                    {score >= highscore && score > 0 && (
                      <p className="mt-1 text-xs font-bold tracking-[0.1em] text-yellow-400">NEW BEST!</p>
                    )}
                  </div>
                </div>
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
