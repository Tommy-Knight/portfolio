import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';

function ContactCard({ isActive, onNavClick }, ref) {
  return (
    <div id="contact" className={`card ${isActive ? 'card--active' : ''}`} ref={ref}>
      <div className="card-content">
        <div className="card-title">
          <button className="card-nav card-nav--prev" onClick={() => onNavClick('prev')}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2>Contact</h2>
          <div className="card-line"></div>
          <button className="card-nav card-nav--next" onClick={() => onNavClick('next')}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <p>
          Think you can 1v1 me in Mario Kart? Prove it! Feel free to connect through the links below, or send a friendly email. ❤️
        </p>
        <div className="contact-links">
          <a href="https://www.linkedin.com/in/tommy-knight-785175212/" target="_blank" rel="noopener noreferrer" className="contact-link">
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a href="https://github.com/Tommy-Knight" target="_blank" rel="noopener noreferrer" className="contact-link">
            <FontAwesomeIcon icon={faGithub} />
          </a>
          <a href="https://x.com/_TommyLK" target="_blank" rel="noopener noreferrer" className="contact-link">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="mailto:tknighted@hotmail.com" className="contact-link">
            <FontAwesomeIcon icon={faEnvelope} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(ContactCard);