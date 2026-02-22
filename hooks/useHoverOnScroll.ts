import { useEffect, useRef } from 'react';

// Global mouse position tracker — null until the mouse has actually moved.
// On touch/mobile devices mousemove never fires, so this stays null and the
// scroll-hover logic is skipped entirely, preventing phantom hover triggers.
let globalMouseX: number | null = null;
let globalMouseY: number | null = null;

if (typeof window !== 'undefined') {
  document.addEventListener('mousemove', (e) => {
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
