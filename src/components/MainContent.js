import React, { useCallback, useEffect, useRef, useState } from 'react';

import AboutCard from './AboutCard';
import ContactCard from './ContactCard';
import CvCard from './CvCard';
import Navbar from './Navbar';
import ProjectsCard from './ProjectsCard';

// import './MainContent.css'; // Create this CSS file

function MainContent() {
  const [activeCard, setActiveCard] = useState('about');
  const cardsRef = useRef(null);
  const cardElements = useRef({});

  const handleNavLinkClick = (target) => {
    setActiveCard(target);
  };

  const updateActiveCard = useCallback((target) => {
    setActiveCard(target);
  }, []);   

  const handleCardNavClick = (direction) => {
    const cardOrder = ['about', 'projects', 'cv', 'contact'];
    const currentIndex = cardOrder.indexOf(activeCard);
    let nextIndex;

    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % cardOrder.length;
    } else {
      nextIndex = (currentIndex - 1 + cardOrder.length) % cardOrder.length;
    }
    setActiveCard(cardOrder[nextIndex]); 
  };

  useEffect(() => {
    const navLinks = document.querySelectorAll('.nav-list .nav-item');
    const handleMouseEnter = (e) => {
      if (window.matchMedia('(min-width: 577px)').matches) {
        updateActiveCard(e.target.dataset.target);
      }
    };

    navLinks.forEach((navLink) => {
      navLink.addEventListener('mouseenter', handleMouseEnter);
      return () => navLink.removeEventListener('mouseenter', handleMouseEnter);
    });
  }, [updateActiveCard]);

  return (
    <main className="content-container show">
      <Navbar activeCard={activeCard} onNavLinkClick={handleNavLinkClick} />

      <div className="content-cards" ref={cardsRef}>
        <AboutCard isActive={activeCard === 'about'} onNavClick={handleCardNavClick} ref={(el) => (cardElements.current['about'] = el)} />
        <ProjectsCard isActive={activeCard === 'projects'} onNavClick={handleCardNavClick} ref={(el) => (cardElements.current['projects'] = el)} />
        <CvCard isActive={activeCard === 'cv'} onNavClick={handleCardNavClick} ref={(el) => (cardElements.current['cv'] = el)} />
        <ContactCard isActive={activeCard === 'contact'} onNavClick={handleCardNavClick} ref={(el) => (cardElements.current['contact'] = el)} />
      </div>
    </main>
  );
}

export default MainContent;