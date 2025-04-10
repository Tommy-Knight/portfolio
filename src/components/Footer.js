import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

function Footer({ darkMode, toggleDarkMode }) {
  return (
    <footer className={`main-footer show`}>
      <p>© 2025 Tommy Knight</p>
      <button id="dark-mode-toggle" className="dark-mode-toggle" onClick={toggleDarkMode}>
        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
      </button>
    </footer>
  );
}

export default Footer;