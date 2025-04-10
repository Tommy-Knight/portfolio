import React, { useEffect, useRef } from 'react';

function Splash({ onEnterClick }) {
  const headerTitleRef = useRef(null);
  const headerSubtitleRef = useRef(null);

  useEffect(() => {
    const animateTitle = () => {
      if (headerTitleRef.current) {
        headerTitleRef.current.innerHTML = headerTitleRef.current.textContent
          .split('')
          .map(
            (char, index) =>
              `<span style="transition-delay: ${index * 0.1}s">${char}</span>`
          )
          .join('');
      }
    };

    const displaySplashElements = () => {
      document.body.classList.add('loaded');
      setTimeout(() => {
        if (headerSubtitleRef.current) {
          headerSubtitleRef.current.style.transform = 'translateY(0)';
          headerSubtitleRef.current.style.opacity = 1;
        }
        const titleSpans = document.querySelectorAll('.splash-header h1 span');
        titleSpans.forEach((span) => {
          span.style.transform = 'translateY(0)';
          span.style.opacity = 1;
        });
      }, 300);
    };

    animateTitle();
    displaySplashElements();
  }, []);

  return (
    <div className="splash-container">
      <header className="splash-header">
        <div className="splash-content">
          <h1 ref={headerTitleRef}>Tommy Knight</h1>
          <p ref={headerSubtitleRef}>Creative Web Designer</p>
          <button id="view-portfolio" className="button" onClick={onEnterClick}>
            Enter
          </button>
        </div>
      </header>
    </div>
  );
}

export default Splash;