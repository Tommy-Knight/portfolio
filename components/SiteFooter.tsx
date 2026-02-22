'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function MatrixCanvas({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const SIZE = 14;
    const cols = Math.floor(w / SIZE);
    const rows = Math.floor(h / SIZE);
    const drops = Array.from({ length: cols }, () =>
      Math.floor(Math.random() * rows)
    );

    let fading = false;
    let fadeOpacity = 1;
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      if (window.scrollY < lastScrollY && !fading) fading = true;
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const draw = () => {
      if (fading) {
        fadeOpacity *= 0.88;
        canvas.style.opacity = String(fadeOpacity);
        ctx.fillStyle = `rgba(5,5,5,${0.3 + (1 - fadeOpacity) * 0.5})`;
        ctx.fillRect(0, 0, w, h);
        if (fadeOpacity < 0.05) { onDone(); return; }
      } else {
        ctx.fillStyle = 'rgba(0,5,0,0.05)';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.font = `${SIZE}px "IBM Plex Mono", monospace`;
      drops.forEach((y, i) => {
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        if (fading) {
          if (Math.random() > 0.3) {
            ctx.fillStyle = `rgba(0,255,65,${fadeOpacity * (0.3 + Math.random() * 0.7)})`;
            ctx.fillText(char, i * SIZE, y * SIZE);
            drops[i] += Math.random() > 0.5 ? 1 : 0;
          }
        } else {
          ctx.fillStyle = '#00FF41';
          ctx.fillText(char, i * SIZE, y * SIZE);
          if (y * SIZE > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      });
    };

    const interval = setInterval(draw, 33);
    return () => { clearInterval(interval); window.removeEventListener('scroll', onScroll); };
  }, [onDone]);

  return createPortal(
    <canvas ref={ref} className="matrix-canvas" />,
    document.body
  );
}

export default function SiteFooter() {
  const [matrix, setMatrix] = useState(false);

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const handleDeploy = () => {
    setMatrix(true);
    setTimeout(() => {
      window.location.href =
        'mailto:tknighted@hotmail.com?subject=Hey Tommy, I loved your site.';
    }, 1200);
  };

  return (
    <footer className="footer-section">
      {matrix && <MatrixCanvas onDone={() => setMatrix(false)} />}

      <div className="section-label">
        CONTACT // INITIATE_HANDSHAKE
      </div>

      <button
        className="footer-deploy-btn"
        data-cursor="push"
        onClick={handleDeploy}
      >
        DEPLOY?
      </button>

      <div className="footer-meta">
        <span>TOMMY_KNIGHT <span style={{ color: 'var(--green)' }}>//</span> v2.2</span>
      </div>
      <div className="footer-meta">
        <span><span style={{ color: 'var(--green)' }}>©</span> {dateStr}</span>
      </div>
    </footer>
  );
}
