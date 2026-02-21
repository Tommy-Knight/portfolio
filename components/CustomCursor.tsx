'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);
  const [isPush, setIsPush] = useState(false);

  const x = useSpring(rawX, { stiffness: 700, damping: 38, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 700, damping: 38, mass: 0.4 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const onEnterPush = () => setIsPush(true);
    const onLeavePush = () => setIsPush(false);

    window.addEventListener('mousemove', onMove);

    // Track all [data-cursor="push"] elements, including dynamically loaded ones
    const tracked = new Set<Element>();

    const bind = (el: Element) => {
      if (tracked.has(el)) return;
      tracked.add(el);
      el.addEventListener('mouseenter', onEnterPush);
      el.addEventListener('mouseleave', onLeavePush);
    };

    const scan = () => {
      document.querySelectorAll('[data-cursor="push"]').forEach(bind);
    };

    scan();

    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      observer.disconnect();
      tracked.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterPush);
        el.removeEventListener('mouseleave', onLeavePush);
      });
    };
  }, [rawX, rawY]);

  return (
    <motion.div
      className={`custom-cursor ${isPush ? 'is-push' : ''}`}
      style={{ x, y }}
      aria-hidden="true"
    >
      {isPush && 'PUSH'}
    </motion.div>
  );
}
