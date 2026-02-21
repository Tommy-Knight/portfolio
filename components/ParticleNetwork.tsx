'use client';

import { useEffect, useRef } from 'react';

/* ── Config ─────────────────────────────────────────── */
const NODE_COUNT = 60;
const CONNECTION_DIST = 160;
const NODE_RADIUS = 1.2;
const BASE_SPEED = 0.15;
const NODE_COLOR = 'rgba(0, 255, 65, 0.22)';     // --green at 22 %
const LINE_COLOR_BASE = [0, 255, 65];              // rgb for --green
const LINE_ALPHA_MAX = 0.12;                       // subtle but visible
const PARALLAX_FACTOR = 0.35;                      // how much scroll offsets the canvas

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let scrollY = 0;

    /* ── Resize handler ────────────────────────────── */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── Create nodes ──────────────────────────────── */
    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * BASE_SPEED * 2,
      vy: (Math.random() - 0.5) * BASE_SPEED * 2,
    }));

    /* ── Scroll listener (parallax offset) ─────────── */
    const onScroll = () => {
      scrollY = window.scrollY || window.pageYOffset;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Animation loop ────────────────────────────── */
    const draw = () => {
      const width = w();
      const height = h();
      const dpr = window.devicePixelRatio || 1;

      // Reset transform & clear
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // ── Fade in synced with Hero "ARCHITECTING SYSTEMS FROM" ──
      // Hero section is the first <section> with class hero-section.
      // Its scroll progress [0.40, 0.58] maps to the systems reveal.
      const heroEl = document.querySelector('.hero-section') as HTMLElement | null;
      let fadeAlpha = 1;
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        const heroH = heroEl.offsetHeight;
        // scrollYProgress = how far the hero top has passed viewport top / heroH
        const heroProgress = heroH > 0 ? Math.min(Math.max(-rect.top / (heroH - height), 0), 1) : 1;
        // Fade from 0→1 across the same [0.40, 0.58] window
        fadeAlpha = Math.min(Math.max((heroProgress - 0.40) / (0.58 - 0.40), 0), 1);
      }
      ctx.globalAlpha = fadeAlpha;

      // Parallax: each node gets a subtle vertical shift based on scroll.
      // Use sine to keep offset bounded so nodes never leave the viewport.
      const maxPageHeight = document.documentElement.scrollHeight - height;
      const scrollProgress = maxPageHeight > 0 ? scrollY / maxPageHeight : 0; // 0 → 1
      const parallaxShift = Math.sin(scrollProgress * Math.PI) * height * PARALLAX_FACTOR;

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Wrap around
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const ay = a.y - parallaxShift;
          const by = b.y - parallaxShift;
          const dx = a.x - b.x;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = LINE_ALPHA_MAX * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x, ay);
            ctx.lineTo(b.x, by);
            ctx.strokeStyle = `rgba(${LINE_COLOR_BASE[0]},${LINE_COLOR_BASE[1]},${LINE_COLOR_BASE[2]},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = NODE_COLOR;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y - parallaxShift, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
