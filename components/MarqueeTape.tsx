'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useVelocity } from 'framer-motion';
import { useHoverOnScroll } from '@/hooks/useHoverOnScroll';
import gsap from 'gsap';

const ITEMS = [
  'NEXT.JS', 'REACT', 'TYPESCRIPT', 'REACT NATIVE',
  'NODE.JS', 'EXPRESS', 'PYTHON', 'POWERSHELL',
  'SQL SERVER', 'POSTGRESQL', 'MONGODB',
  'REST API', 'OAUTH', 'COOKIES', 'WEBSOCKETS', 'JWT',
  'AZURE', 'CLOUDFLARE', 'SUPABASE', 'TABLEAU',
  'WORDPRESS', 'BOOTSTRAP', 'TAILWIND',
  'GIT', 'AGENTIC WORKFLOWS',
  'BAFTA PRESENTER', 'PADI CERTIFIED', 'MHFA QUALIFIED',
  'PERFECT LIGHTHOUSE SCORE', 'WCAG AAA COMPLIANT',
];

// Tween duration — controls base speed (higher = slower)
const DURATION = 40;

export default function MarqueeTape() {
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const tweenRef    = useRef<gsap.core.Tween | null>(null);
  const hoveredRef  = useRef(false);
  const scrollVelRef = useRef(0);
  const speedRef    = useRef(0.8);
  const setWidthRef = useRef(0);

  // Drag state
  const draggingRef    = useRef(false);
  const dragStartXRef  = useRef(0);
  const dragXRef       = useRef(0);
  const dragSamplesRef = useRef<{ x: number; t: number }[]>([]);
  const [hovered, setHovered] = useState(false);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  useEffect(() => {
    const unsub = scrollVelocity.on('change', (v) => {
      scrollVelRef.current = Math.abs(v);
    });
    return unsub;
  }, [scrollVelocity]);

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !firstSet) return;

    setWidthRef.current = firstSet.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => {
      setWidthRef.current = firstSet.getBoundingClientRect().width;
    });
    ro.observe(firstSet);

    // Main tween — infinite loop
    const tween = gsap.to(track, {
      x: () => -setWidthRef.current,
      duration: DURATION,
      ease: 'none',
      repeat: -1,
    });
    tween.timeScale(0.8);
    tweenRef.current = tween;

    // Ticker — smoothly lerp timeScale toward target
    const onTick = () => {
      if (draggingRef.current) return;

      const base  = hoveredRef.current ? 0.2 : 0.8;
      const boost = hoveredRef.current ? 0 : Math.min(scrollVelRef.current / 350, 5);
      const target = base + boost;

      scrollVelRef.current *= 0.92;

      // Gentle lerp — coasts smoothly from any speed (including flick) back to base
      speedRef.current += (target - speedRef.current) * 0.04;
      tween.timeScale(speedRef.current);
    };

    gsap.ticker.add(onTick);

    return () => {
      gsap.ticker.remove(onTick);
      tween.kill();
      ro.disconnect();
    };
  }, []);

  // On mobile, clear hover when user touches anywhere else on the page
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onTouchOutside = (e: TouchEvent) => {
      if (!section.contains(e.target as Node) && hoveredRef.current) {
        hoveredRef.current = false;
        setHovered(false);
      }
    };

    document.addEventListener('touchstart', onTouchOutside, { passive: true });
    return () => document.removeEventListener('touchstart', onTouchOutside);
  }, []);

  useHoverOnScroll(
    sectionRef,
    () => { hoveredRef.current = true;  setHovered(true);  },
    () => { hoveredRef.current = false; setHovered(false); },
  );

  const enter = () => { hoveredRef.current = true;  setHovered(true);  };
  const leave = () => {
    hoveredRef.current = false;
    setHovered(false);
    if (draggingRef.current) onDragEnd();
  };

  // ── Drag handlers ──

  const onDragStart = (clientX: number) => {
    const tween = tweenRef.current;
    const track = trackRef.current;
    if (!tween || !track) return;

    draggingRef.current = true;
    dragStartXRef.current = clientX;
    dragXRef.current = gsap.getProperty(track, 'x') as number;
    dragSamplesRef.current = [{ x: clientX, t: performance.now() }];
    tween.pause();
  };

  const onDragMove = (clientX: number) => {
    const track = trackRef.current;
    if (!draggingRef.current || !track) return;

    const delta = clientX - dragStartXRef.current;
    const w = setWidthRef.current;
    let newX = dragXRef.current + delta;
    if (w > 0) newX = ((newX % w) + w) % w - w;

    gsap.set(track, { x: newX });

    const samples = dragSamplesRef.current;
    samples.push({ x: clientX, t: performance.now() });
    if (samples.length > 4) samples.shift();
  };

  const onDragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const tween = tweenRef.current;
    const track = trackRef.current;
    if (!tween || !track) return;

    // Sync tween progress to current drag position
    const w = setWidthRef.current;
    if (w > 0) {
      const curX = gsap.getProperty(track, 'x') as number;
      tween.progress((Math.abs(curX) / w) % 1);
    }

    // Convert flick velocity → timeScale so it coasts back to baseline via lerp
    const samples = dragSamplesRef.current;
    if (samples.length >= 2) {
      const first = samples[0];
      const last  = samples[samples.length - 1];
      const dt = (last.t - first.t) / 1000;
      if (dt > 0 && w > 0) {
        const flickVel = (last.x - first.x) / dt; // px/s
        const basePxPerSec = w / DURATION;         // px/s at timeScale 1
        // Negative flick (left) → higher timeScale, positive (right) → lower/negative
        speedRef.current = -flickVel / basePxPerSec;
      }
    }

    tween.timeScale(speedRef.current);
    tween.play();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onDragStart(e.clientX);
  };

  return (
    <section
      ref={sectionRef}
      className="marquee-section"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => onDragMove(e.clientX)}
      onMouseUp={onDragEnd}
      onTouchStart={(e) => {
        hoveredRef.current = true;
        setHovered(true);
        onDragStart(e.touches[0].clientX);
      }}
      onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
      onTouchEnd={onDragEnd}
    >
      <div className={`marquee-wrapper${hovered ? ' hovered' : ''}`}>
        <div ref={trackRef} className="marquee-track">
          <div ref={firstSetRef} className="marquee-set">
            {ITEMS.map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
                <span className="marquee-dot" />
              </span>
            ))}
          </div>
          <div aria-hidden="true" className="marquee-set">
            {ITEMS.map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
                <span className="marquee-dot" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
