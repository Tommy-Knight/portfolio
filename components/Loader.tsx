'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

/* ── Sequence config ──────────────────────────────────────────
   Each step either types characters one-by-one (type: 'type')
   or prints a full line instantly (type: 'line').
   `pause` = ms to wait BEFORE this step executes.
   ──────────────────────────────────────────────────────────── */

interface TypeStep { type: 'type'; text: string; pause: number; charSpeed: number }
interface LineStep { type: 'line'; text: string; pause: number; className?: string }

type Step = TypeStep | LineStep;

const STEPS: Step[] = [
  // Phase 1 — type the command
  { type: 'type', text: 'npm run dev',                                            pause: 800,  charSpeed: 45  },

  // Phase 2 — npm script echo
  { type: 'line', text: '',                                                        pause: 800 },
  { type: 'line', text: '> portfolio@2.2.0 dev',                                   pause: 80  },
  { type: 'line', text: '> next dev',                                              pause: 80  },
  { type: 'line', text: '',                                                        pause: 260 },

  // Phase 3 — Next.js output
  { type: 'line', text: ' ⚠️ Port 3000 is in use, trying 3001 instead.',           pause: 60,  className: 'loader-warn'  },
  { type: 'line', text: '   ▲ Next.js 15.5.12',                                   pause: 80  },
  { type: 'line', text: '   - Local:        http://localhost:3001',                pause: 40  },
  { type: 'line', text: '   - Network:      http://192.168.1.1:3001',            pause: 40  },
  { type: 'line', text: '   - Environments: .env',                                pause: 40  },
  { type: 'line', text: '',                                                        pause: 320 },
  { type: 'line', text: ' ✓ Starting...',                                          pause: 60,  className: 'loader-ok' },
  { type: 'line', text: ' ✓ Ready in 1.1s',                                        pause: 280, className: 'loader-ok' },
  { type: 'line', text: ' ○ Compiling / ...',                                      pause: 200 },
  { type: 'line', text: ' ✓ Compiled / in 2.2s (1338 modules)',                    pause: 840, className: 'loader-ok' },
];


const TILE_SIZE = 8; // px — chunky retro blocks
const FIZZLE_DURATION = 444; // ms for full dissolve (eased)

function shuffleArray(arr: number[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<{ text: string; className?: string }[]>([{ text: '$ ', className: 'loader-prompt' }]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [fizzling, setFizzling] = useState(false);
  const [gone, setGone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Run the terminal typing sequence
  useEffect(() => {
    let elapsed = 0;

    STEPS.forEach((step) => {
      elapsed += step.pause;

      if (step.type === 'type') {
        const chars = step.text.split('');
        chars.forEach((char, ci) => {
          const charTime = elapsed + ci * step.charSpeed;
          timers.current.push(
            setTimeout(() => {
              setLines(prev => {
                const next = [...prev];
                next[0] = { ...next[0], text: next[0].text + char };
                return next;
              });
            }, charTime)
          );
        });
        elapsed += chars.length * step.charSpeed;
      } else {
        const capturedStep = step;
        timers.current.push(
          setTimeout(() => {
            setLines(prev => [...prev, { text: capturedStep.text, className: capturedStep.className }]);
          }, elapsed)
        );
      }
    });

    // Beat after last line, then start fizzle
    elapsed += 800;
    timers.current.push(setTimeout(() => {
      window.scrollTo(0, 0);
      setFizzling(true);
    }, elapsed));

    return () => timers.current.forEach(clearTimeout);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Fizzle dissolve on canvas
  const startFizzle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill solid with void colour
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    const cols = Math.ceil(w / TILE_SIZE);
    const rows = Math.ceil(h / TILE_SIZE);
    const total = cols * rows;

    // Build shuffled order of tile indices
    const order = shuffleArray(Array.from({ length: total }, (_, i) => i));

    const startTime = performance.now();
    let lastTarget = 0;

    // Ease-in curve: slow start, fast finish
    function easeInCubic(t: number) { return t * t * t; }

    function frame() {
      const elapsed = performance.now() - startTime;
      const linear = Math.min(elapsed / FIZZLE_DURATION, 1);
      const eased = easeInCubic(linear);

      // How many tiles should be cleared by now
      const target = Math.floor(eased * total);
      const from = lastTarget;

      for (let i = from; i < target; i++) {
        const idx = order[i];
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        ctx!.clearRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
      lastTarget = target;

      if (linear < 1) {
        requestAnimationFrame(frame);
      } else {
        // Fizzle complete
        onCompleteRef.current();
        setGone(true);
      }
    }

    requestAnimationFrame(frame);
  }, []);

  // Fill canvas black immediately on mount so page is hidden from frame 1
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);
    }
  }, []);

  // Trigger fizzle when ready
  useEffect(() => {
    if (fizzling) startFizzle();
  }, [fizzling, startFizzle]);

  if (gone) return null;

  return (
    <>
      {/* Terminal output */}
      <div className="loader-terminal" style={{ opacity: fizzling ? 0 : 1 }}>
        {lines.map((line, i) => (
          <div key={i} className={`loader-line visible ${line.className ?? ''}`}>
            <span style={{ whiteSpace: 'pre' }}>{line.text}</span>
            {i === lines.length - 1 && !fizzling && (
              <span
                className="loader-cursor"
                style={{ opacity: cursorVisible ? 1 : 0 }}
              >
                _
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Fizzle canvas — sits over everything, tiles get cleared to reveal page */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
