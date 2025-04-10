import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

function AboutCard({ isActive, onNavClick }, ref) {
	return (
		<div id='about' className={`card ${isActive ? 'card--active' : ''}`} ref={ref}>
			<div className='card-content'>
				<div className='card-title'>
					<button
						className='card-nav card-nav--prev'
						onClick={() => onNavClick('prev')}>
						<FontAwesomeIcon icon={faChevronLeft} />
					</button>
					<h2>About Me</h2>
					<div className='card-line'></div>
					<button
						className='card-nav card-nav--next'
						onClick={() => onNavClick('next')}>
						<FontAwesomeIcon icon={faChevronRight} />
					</button>
				</div>
				<p>
					I’ve always worked in creative spaces — from theatre stages to film sets —
					where design and detail matter. My background shapes how I approach
					everything.
				</p>
				<p>
					I started programming in 2006, hosting private servers for the
					browser-based Java game RuneScape 2 — modifying code, creating new
					features, and contributing to open-source plugins used by the online
					community.
				</p>
				<p>
					In 2021, I completed full-time training in full-stack web development,
					focusing on building secure, responsive applications using React,
					TypeScript, and Node.js. I worked with Git for version control, secured
					applications with JWT and cookie authentication, and managed MongoDB and
					SQL databases in collaborative projects.
				</p>
			</div>
		</div>
	);
}

export default React.forwardRef(AboutCard);
