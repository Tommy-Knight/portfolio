import { useEffect, useRef } from 'react';

// Global mouse position tracker — null until a real mouse has moved.
// After a touch event, we suppress mouse tracking for a short window to
// ignore synthetic mousemove events browsers fire after taps, while still
// allowing hybrid devices (e.g. Surface) to resume mouse hover later.
let globalMouseX: number | null = null;
let globalMouseY: number | null = null;
let touchCooldownUntil = 0;

if (typeof window !== 'undefined') {
  document.addEventListener('touchstart', () => {
    touchCooldownUntil = Date.now() + 1000;
    globalMouseX = null;
    globalMouseY = null;
  });

  document.addEventListener('mousemove', (e) => {
    if (Date.now() < touchCooldownUntil) return;
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });
}

/**
 * Hook to trigger hover effects when scrolling over elements without mouse movement.
 * Tracks global mouse position and checks on scroll if the element is under the cursor.
 */
export function useHoverOnScroll(
  ref: React.RefObject<HTMLElement>,
  onEnter: () => void,
  onLeave: () => void
) {
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      if (globalMouseX === null || globalMouseY === null) return;
      const rect = element.getBoundingClientRect();
      const isUnderMouse =
        globalMouseX >= rect.left &&
        globalMouseX <= rect.right &&
        globalMouseY >= rect.top &&
        globalMouseY <= rect.bottom;

      if (isUnderMouse && !isHoveredRef.current) {
        isHoveredRef.current = true;
        onEnter();
      } else if (!isUnderMouse && isHoveredRef.current) {
        isHoveredRef.current = false;
        onLeave();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, onEnter, onLeave]);
}
