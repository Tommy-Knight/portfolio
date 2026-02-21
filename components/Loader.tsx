'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  { text: '> INITIALIZING KERNEL...', status: null,      delay: 150  },
  { text: '> LOADING LEGACY_DRIVERS...', status: 'FAIL', delay: 425  },
  { text: '> REFACTORING...',            status: 'SUCCESS', delay: 725 },
  { text: '> SYSTEM READY.',             status: null,      delay: 1050 },
];

const DOOR = { duration: 0.95, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] };

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount]       = useState(0);
  const [split, setSplit]       = useState(false);
  const [gone, setGone]         = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LINES.forEach((l, i) => {
      timers.push(setTimeout(() => setCount(i + 1), l.delay));
    });

    timers.push(setTimeout(() => { setSplit(true); onComplete(); }, 1350));
    timers.push(setTimeout(() => setGone(true), 1850));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (gone) return null;

  return (
    <>
      {/* Terminal text stays visible above the doors */}
      <div className="loader-terminal">
        {LINES.slice(0, count).map((l, i) => (
          <div key={i} className="loader-line visible">
            <span>{l.text}</span>
            {l.status && (
              <span className={`loader-status--${l.status === 'FAIL' ? 'fail' : 'success'}`}>
                [{l.status}]
              </span>
            )}
          </div>
        ))}
        {count > 0 && count <= LINES.length && (
          <span className="loader-cursor">_</span>
        )}
      </div>

      {/* Left door */}
      <motion.div
        initial={{ x: 0 }}
        animate={split ? { x: '-101%' } : { x: 0 }}
        transition={DOOR}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '50%', height: '100%',
          background: 'var(--void)', zIndex: 9999,
        }}
      />

      {/* Right door */}
      <motion.div
        initial={{ x: 0 }}
        animate={split ? { x: '101%' } : { x: 0 }}
        transition={DOOR}
        style={{
          position: 'fixed', top: 0, right: 0,
          width: '50%', height: '100%',
          background: 'var(--void)', zIndex: 9999,
        }}
      />
    </>
  );
}
