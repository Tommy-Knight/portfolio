import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function AboutCard({ isActive, onNavClick }, ref) {
  return (
    <div id="about" className={`card ${isActive ? 'card--active' : ''}`} ref={ref}>
      <div className="card-content">
        <div className="card-title">
          <button className="card-nav card-nav--prev" onClick={() => onNavClick('prev')}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h2>About Me</h2>
          <div className="card-line"></div>
          <button className="card-nav card-nav--next" onClick={() => onNavClick('next')}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <p>
          For two decades, I lived in the dynamic worlds of television, film and theatre, collaborating with industry-leading creatives.
          This experience gave me a love for creative design.
        </p>
        <p>
          My passion for coding began early, hosting and designing private servers for the browser based Java game, RuneScape, creating
          open-source plugins for the online community.
        </p>
        <p>
          In 2021, I undertook intensive training in open-source full-stack web development, focusing on collaborative projects using
          technologies such as
          React, TypeScript, Node.js, MongoDB, and SQL. I became proficient in version control with Git and gained experience with
          responsive design frameworks
          like Bootstrap and Tailwind.
        </p>
      </div>
    </div>
  );
}

export default React.forwardRef(AboutCard);