'use client';

import { useEffect, type ReactNode } from 'react';

declare global {
  interface Window {
    lenis?: import('lenis').default;
  }
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lenis: InstanceType<Awaited<typeof import('lenis')>['default']> | null = null;
    let rafId: number;

    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      } as ConstructorParameters<typeof Lenis>[0]);

      window.lenis = lenis;

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      delete window.lenis;
    };
  }, []);

  return <>{children}</>;
}
