'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useVelocity } from 'framer-motion';
import { useHoverOnScroll } from '@/hooks/useHoverOnScroll';

const ITEMS = [
  // Frontend
  'NEXT.JS', 'REACT', 'TYPESCRIPT', 'REACT NATIVE',
  // Backend
  'NODE.JS', 'EXPRESS', 'PYTHON', 'POWERSHELL',
  // Databases
  'SQL SERVER', 'POSTGRESQL', 'MONGODB',
  // APIs & Services
  'REST API', 'OAUTH', 'COOKIES', 'WEBSOCKETS', 'JWT',
  // Infrastructure
  'AZURE', 'CLOUDFLARE', 'SUPABASE', 'TABLEAU',
  // CMS & Frameworks
  'WORDPRESS', 'BOOTSTRAP', 'TAILWIND',
  // Tools
  'GIT', 'AGENTIC WORKFLOWS',
  // Achievements
  'BAFTA PRESENTER', 'PADI CERTIFIED', 'MHFA QUALIFIED',
  'PERFECT LIGHTHOUSE SCORE', 'WCAG AAA COMPLIANT',
];

export default function MarqueeTape() {
  const sectionRef   = useRef<HTMLElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const firstSetRef  = useRef<HTMLDivElement>(null);
  const posRef       = useRef(0);
  const rafRef       = useRef<number>(0);
  const hoveredRef   = useRef(false);
  const halfWidthRef = useRef(0);
  const draggingRef  = useRef(false);
  const dragStartXRef = useRef(0);
  const dragPosRef   = useRef(0);
  const speedRef     = useRef(1.8);
  const prevTimeRef  = useRef(0);
  const velRef       = useRef(0);
  const [hovered, setHovered] = useState(false);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Sample velocity outside the rAF loop — once per Framer Motion update
  useEffect(() => {
    const unsub = scrollVelocity.on('change', (v) => {
      velRef.current = Math.abs(v);
    });
    return unsub;
  }, [scrollVelocity]);

  useHoverOnScroll(
    sectionRef,
    () => { hoveredRef.current = true; setHovered(true); },
    () => { hoveredRef.current = false; setHovered(false); }
  );

  // Measure half-width (one full set of items)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      if (firstSetRef.current) {
        halfWidthRef.current = firstSetRef.current.getBoundingClientRect().width;
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  // Animation loop — delta-time based for frame-rate independence
  useEffect(() => {
    const tick = (now: number) => {
      if (trackRef.current) {
        // Delta time in seconds, capped at 50ms to avoid jumps after tab-switch
        const dt = prevTimeRef.current ? Math.min((now - prevTimeRef.current) / 1000, 0.05) : 1 / 60;
        prevTimeRef.current = now;

        if (!draggingRef.current) {
          const base   = hoveredRef.current ? 25 : 110;
          const boost  = hoveredRef.current ? 0 : velRef.current * 0.7;
          const target = Math.min(base + boost, 300);

          // Lerp speed — fast enough to feel responsive, slow enough to never jitter
          speedRef.current += (target - speedRef.current) * Math.min(dt * 4, 1);

          posRef.current -= speedRef.current * dt;
        }

        const half = halfWidthRef.current;
        if (half > 0) {
          posRef.current = ((posRef.current % half) + half) % half - half;
        }

        trackRef.current.style.transform = `translate3d(${posRef.current}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const enter = () => { hoveredRef.current = true;  setHovered(true);  };
  const leave = () => { hoveredRef.current = false; setHovered(false); draggingRef.current = false; };

  const onMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragPosRef.current = posRef.current;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    posRef.current = dragPosRef.current + delta;
  };
  const onMouseUp = () => { draggingRef.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    draggingRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragPosRef.current = posRef.current;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current) return;
    const delta = e.touches[0].clientX - dragStartXRef.current;
    posRef.current = dragPosRef.current + delta;
  };
  const onTouchEnd = () => { draggingRef.current = false; };

  return (
    <section
      ref={sectionRef}
      className="marquee-section"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
