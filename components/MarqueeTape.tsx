'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useVelocity } from 'framer-motion';
import { useHoverOnScroll } from '@/hooks/useHoverOnScroll';

const ITEMS = [
  // Frontend
  'NEXT.JS', 'REACT', 'TYPESCRIPT', 'REACT NATIVE',
  // Backend
  'NODE.JS', 'EXPRESS', 'PYTHON', 'JAVA', 'LUA', 'POWERSHELL',
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
  const posRef       = useRef(0);
  const rafRef       = useRef<number>(0);
  const hoveredRef   = useRef(false);
  const halfWidthRef = useRef(0);
  const draggingRef  = useRef(false);
  const dragStartXRef = useRef(0);
  const dragPosRef   = useRef(0);
  const [hovered, setHovered] = useState(false);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  useHoverOnScroll(
    sectionRef,
    () => { hoveredRef.current = true; setHovered(true); },
    () => { hoveredRef.current = false; setHovered(false); }
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => { halfWidthRef.current = track.scrollWidth / 2; };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const tick = () => {
      if (trackRef.current) {
        if (!draggingRef.current) {
          const vel   = Math.abs(scrollVelocity.get());
          const base  = hoveredRef.current ? 0.4 : 1.8;
          const boost = hoveredRef.current ? 0 : vel * 0.012;
          const speed = base + boost;

          posRef.current -= speed;
        }

        const half = halfWidthRef.current;
        if (half > 0) {
          while (posRef.current <= -half) posRef.current += half;
          while (posRef.current > 0) posRef.current -= half;
        }

        trackRef.current.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrollVelocity]);

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

  const doubled = [...ITEMS, ...ITEMS];

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
          {doubled.map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
              <span className="marquee-dot" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
