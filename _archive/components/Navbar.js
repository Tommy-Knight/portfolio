import React from 'react';

function Navbar({ activeCard, onNavLinkClick }) {
  const handleHomeClick = () => {
    window.location.reload(); 
  };

  return (
    <nav className="main-nav">
      <a href="/" className="nav-home" onClick={handleHomeClick}>
        t
      </a>
      <ul className="nav-list">
        <li
          data-target="about"
          className={`nav-item ${activeCard === 'about' ? 'active' : ''}`}
          onClick={() => onNavLinkClick('about')}
        >
          About
        </li>
        <li
          data-target="projects"
          className={`nav-item ${activeCard === 'projects' ? 'active' : ''}`}
          onClick={() => onNavLinkClick('projects')}
        >
          Projects
        </li>
        <li
          data-target="cv"
          className={`nav-item ${activeCard === 'cv' ? 'active' : ''}`}
          onClick={() => onNavLinkClick('cv')}
        >
          CV
        </li>
        <li
          data-target="contact"
          className={`nav-item ${activeCard === 'contact' ? 'active' : ''}`}
          onClick={() => onNavLinkClick('contact')}
        >
          Contact
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;