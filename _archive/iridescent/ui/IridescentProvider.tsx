'use client';

import { useEffect, ReactNode } from 'react';

export function IridescentProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Clamp values between 0 and 1
      const clampedX = Math.max(0, Math.min(1, x));
      const clampedY = Math.max(0, Math.min(1, y));

      // Update CSS variables
      document.documentElement.style.setProperty('--mouse-x', clampedX.toString());
      document.documentElement.style.setProperty('--mouse-y', clampedY.toString());

      // Calculate hue based on mouse position (200-260 range: cyan to violet)
      const hue = 200 + clampedX * 60;
      document.documentElement.style.setProperty('--hue', hue.toString());
    };

    // Set initial values
    document.documentElement.style.setProperty('--mouse-x', '0.5');
    document.documentElement.style.setProperty('--mouse-y', '0.5');
    document.documentElement.style.setProperty('--hue', '230');

    window.addEventListener('mousemove', handleMouseMove);

    // Handle touch for mobile (fixed mid-point)
    const handleTouchStart = () => {
      document.documentElement.style.setProperty('--mouse-x', '0.5');
      document.documentElement.style.setProperty('--mouse-y', '0.5');
      document.documentElement.style.setProperty('--hue', '230');
    };

    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return <>{children}</>;
}
