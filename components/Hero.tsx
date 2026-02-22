'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, cubicBezier, type MotionValue } from 'framer-motion';

// ─── Scatter positions ───────────────────────────────────────────────────────
// xFactors arranged L→R as C-H-A-O-S so the scattered state never reads
// as another word. yFactors alternate high/low for maximum visual chaos.
const CHAOS_DATA = [
  { char: 'C', xFactor: -0.36, yFactor: -0.22, rotate: -18 },
  { char: 'H', xFactor: -0.15, yFactor:  0.28, rotate:  10 },
  { char: 'A', xFactor:  0.06, yFactor: -0.30, rotate:  -7 },
  { char: 'O', xFactor:  0.33, yFactor:  0.22, rotate:  14 },
  { char: 'S', xFactor:  0.38, yFactor: -0.12, rotate: -22 },
];

// ─── Scroll windows ──────────────────────────────────────────────────────────
// All letters begin moving at the same scroll moment, but each window ends
// later than the previous — so they land one by one (C first, S last).
// The viewer watches arrivals, not departures. That's the cinematic version.
const SCROLL_WINDOWS: [number, number][] = [
  [0.04, 0.26], // C — lands first
  [0.04, 0.31], // H
  [0.04, 0.36], // A
  [0.04, 0.41], // O
  [0.04, 0.46], // S — lands last
];

// Final X positions are computed dynamically via Range API measurement —
// see finalXArr state and measurement effect inside the Hero component.

// ─── Easing ─────────────────────────────────────────────────────────────────
// ease-out: fast launch, decelerates smoothly into position.
// Industry standard for typographic letter animations on Awwwards sites.
const EASE = cubicBezier(0.25, 0.46, 0.45, 0.94);

// ─── Supporting data ─────────────────────────────────────────────────────────
const TRANSFORMS = [
	['CHAOTIC_DB', 'RESILIENT_SCHEMA'],
	['LEGACY_PATTERNS', 'MODERN_STACK'],
  ['HARDCODED_LIMITS', 'SCALABLE_SYSTEMS'],
	['STATIC_REPORTS', 'REAL_TIME_DASHBOARD'],
	['MANUAL_PROCESSES', 'AUTOMATED_PIPELINE'],
  ['ON_PREM_SERVERS', 'CLOUD_ARCHITECTURE'],
];


// ─── ChaosLetter ─────────────────────────────────────────────────────────────
// No scale transform. Letters are at headline size from the very first frame.
// Only position + rotation change. This is why it feels clean.
interface LetterProps {
  char: string;
  initX: number; initY: number; initRotate: number;
  finalX: number; finalY: number;
  wStart: number; wEnd: number;
  scrollYProgress: MotionValue<number>;
}

function ChaosLetter({ char, initX, initY, initRotate, finalX, finalY, wStart, wEnd, scrollYProgress }: LetterProps) {
  const elRef = useRef<HTMLSpanElement>(null);
  const x      = useTransform(scrollYProgress, [wStart, wEnd], [initX, finalX], { ease: EASE });
  const y      = useTransform(scrollYProgress, [wStart, wEnd], [initY, finalY], { ease: EASE });
  const rotate = useTransform(scrollYProgress, [wStart, wEnd], [initRotate, 0], { ease: EASE });
  const color  = useTransform(scrollYProgress, [wEnd - 0.04, wEnd], ['#e8e8e8', '#00FF41']);

  // Randomised glitch — each letter runs its own independent burst loop
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let active = true;

    const applyRandom = () => {
      const dx1 = Math.round(Math.random() * 6 - 3);
      const dy1 = Math.round(Math.random() * 4 - 2);
      const dx2 = Math.round(Math.random() * 6 - 3);
      const dy2 = Math.round(Math.random() * 4 - 2);
      const bright = Math.random() > 0.5 ? ` brightness(${(1 + Math.random() * 0.5).toFixed(1)})` : '';
      el.style.filter = `drop-shadow(${dx1}px ${dy1}px 0 #ff0040) drop-shadow(${dx2}px ${dy2}px 0 #00ffff)${bright}`;
    };

    const burst = () => {
      if (!active) return;
      const flickers = 1 + Math.floor(Math.random() * 3);
      let i = 0;

      const step = () => {
        if (!active) return;
        if (i >= flickers) {
          el.style.filter = 'none';
          setTimeout(burst, 1000 + Math.random() * 3500);
          return;
        }
        applyRandom();
        i++;
        setTimeout(() => {
          if (!active) return;
          el.style.filter = 'none';
          setTimeout(step, 30 + Math.random() * 40);
        }, 40 + Math.random() * 80);
      };

      step();
    };

    setTimeout(burst, Math.random() * 2500);
    return () => { active = false; };
  }, []);

  return (
    <motion.span ref={elRef} className="hero-chaos-letter" style={{ x, y, rotate, color }}>
      {char}
    </motion.span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const sectionRef      = useRef<HTMLDivElement>(null);
  const chaosNaturalRef = useRef<HTMLSpanElement>(null);   // measures per-character widths of CHAOS
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [transformIdx, setTransformIdx]   = useState(0);
  const [transformFade, setTransformFade] = useState(true);
  const [loadingPercentDisplay, setLoadingPercentDisplay] = useState(0);
  const [finalXArr, setFinalXArr] = useState<number[]>([-2, -1, 0, 1, 2].map(i => i * 77));

  useLayoutEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const chaosFS = dims.w > 0 ? Math.min(Math.max(dims.w * 0.11,  40),  240) : 128;
  const line1FS = dims.w > 0 ? Math.min(Math.max(dims.w * 0.085, 35.2), 160) : 64;

  useEffect(() => {
    const measure = () => {
      if (!chaosNaturalRef.current) return;

      const span = chaosNaturalRef.current;
      const textNode = span.firstChild;
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

      const charRects: DOMRect[] = [];
      for (let i = 0; i < 5; i++) {
        const range = document.createRange();
        range.setStart(textNode, i);
        range.setEnd(textNode, i + 1);
        charRects.push(range.getBoundingClientRect());
      }

      const naturalWidth = charRects[4].right - charRects[0].left;

      const computedStyle = getComputedStyle(span);
      const spreadStr = computedStyle.getPropertyValue('--hero-chaos-spread').trim();
      const spreadEm = parseFloat(spreadStr) || 0;
      const spreadPx = spreadEm * chaosFS; // Convert em to pixels using font size
      const totalExtraSpacing = spreadPx * 4; // 4 gaps between 5 letters

      const vCenterX = window.innerWidth / 2;
      const spreadWidth = naturalWidth + totalExtraSpacing;
      const wordLeft = vCenterX - spreadWidth / 2;

      const positions = charRects.map((rect, i) => {
        const charLeft = wordLeft + (rect.left - charRects[0].left) + i * spreadPx;
        return charLeft + rect.width / 2 - vCenterX;
      });

      setFinalXArr(positions);
    };
    document.fonts.ready.then(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(measure, { timeout: 200 });
      } else {
        setTimeout(measure, 50);
      }
    });
  }, [chaosFS]); // re-runs on resize since chaosFS depends on dims.w

  useEffect(() => {
    const id = setInterval(() => {
      setTransformFade(false);
      setTimeout(() => { setTransformIdx(i => (i + 1) % TRANSFORMS.length); setTransformFade(true); }, 350);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const finalY = line1FS * 1;

  // ── Scroll-driven reveals ────────────────────────────────────────────────
  // Headline slides in as the last CHAOS letter is approaching its position.
  const systemsOpacity = useTransform(scrollYProgress, [0.40, 0.58], [0, 1]);
  const systemsY       = useTransform(scrollYProgress, [0.40, 0.58], [30, 0]);
  const subtextOpacity = useTransform(scrollYProgress, [0.56, 0.70], [0, 1]);
  const transformOp    = useTransform(scrollYProgress, [0.62, 0.74], [0, 1]);
  // Loading bar: width goes 0→100% as scroll progresses, fades out with subtitle
  const loadingWidth   = useTransform(scrollYProgress, [0.0, 0.56], ['0%', '100%']);
  const loadingPercent = useTransform(scrollYProgress, [0.0, 0.56], [0, 100]);
  const loadingOpacity = useTransform(scrollYProgress, [0.50, 0.70], [1, 0]);

  // Track loading percentage for display
  useMotionValueEvent(loadingPercent, 'change', (v) => {
    setLoadingPercentDisplay(Math.round(Math.min(Math.max(v, 0), 100)));
  });

  return (
    <section ref={sectionRef} className="hero-section">
      <div className="hero-sticky">

        {/* ── Anchor line: gives context before scroll begins ── */}
        <div className="hero-anchor">
          <span className="hero-anchor-seg">TOMMY_KNIGHT</span>
          <span className="hero-anchor-seg"><span style={{ color: 'var(--green)' }}>//&nbsp;</span>A_MODERN_BEST_PRACTICE_PORTFOLIO</span>
        </div>

        {/* ── CHAOS letters ──
            Each departs simultaneously but arrives in sequence (C→H→A→O→S).
            No scale change — these ARE the final word, just in the wrong place. */}
        {dims.w > 0 && CHAOS_DATA.map((cfg, i) => (
          <ChaosLetter
            key={cfg.char}
            char={cfg.char}
            initX={dims.w  * cfg.xFactor}
            initY={dims.h  * cfg.yFactor}
            initRotate={cfg.rotate}
            finalX={finalXArr[i] ?? (i - 2) * 77}
            finalY={finalY}
            wStart={SCROLL_WINDOWS[i][0]}
            wEnd={SCROLL_WINDOWS[i][1]}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* ── Hidden measurement reference ──
            "CHAOS" in TikTok Sans at render size, no extra letter-spacing.
            Range API reads each character's exact glyph width from this node. */}
        <span
          ref={chaosNaturalRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            fontFamily: "'TikTok Sans', sans-serif",
            fontOpticalSizing: 'auto',
            fontSize: chaosFS,
            fontWeight: 700,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            letterSpacing: 0,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            userSelect: 'none',
          }}
        >CHAOS</span>

        {/* ── Headline ──
            "ARCHITECTING / SYSTEMS FROM" slides in as last letters land.
            Invisible spacer keeps 3-line geometry so finalY calculation stays exact. */}
        <motion.div
          className="hero-systems"
          style={{ opacity: systemsOpacity, y: systemsY }}
        >
          <div className="hero-systems-upper hero-arch">ARCHITECTING</div>
          <div className="hero-systems-upper hero-systems">SYSTEMS FROM</div>
          <div className="hero-systems-spacer" aria-hidden="true">CHAOS</div>
        </motion.div>

        {/* ── Transformation cycling ── */}
        <motion.div className="hero-transform" style={{ opacity: transformOp }}>
          <span style={{ opacity: transformFade ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            <span style={{ color: 'var(--grey-mid)' }}>{TRANSFORMS[transformIdx][0]}</span>
            <span style={{ color: 'var(--green)' }}>&nbsp;→&nbsp;</span>
            <span style={{ color: 'var(--text)' }}>{TRANSFORMS[transformIdx][1]}</span>
          </span>
        </motion.div>

        {/* ── Subtext ── */}
        <motion.div className="hero-subtext" style={{ opacity: subtextOpacity }}>
          <span className="hero-subtext-seg">TOMMY_KNIGHT</span>
          <span className="hero-subtext-seg"><span style={{ color: 'var(--green)' }}>//</span> v2.2</span>
          <span className="hero-subtext-seg"><span style={{ color: 'var(--green)' }}>//</span> FULL_STACK_ENGINEER<span className="hero-cursor-blink"> _</span></span>
        </motion.div>

        {/* ── Terminal loading bar ── */}
        <motion.div className="hero-loading-bar" style={{ opacity: loadingOpacity }}>
          <div className="hero-loading-label">
            <span className="hero-loading-arrow">&gt;</span>
            SCROLLING
          </div>
          <div className="hero-loading-bar-container">
            <motion.div
              className="hero-loading-bar-fill"
              style={{ width: loadingWidth }}
            />
          </div>
          <div className="hero-loading-percent">{loadingPercentDisplay}%</div>
        </motion.div>

      </div>
    </section>
  );
}
