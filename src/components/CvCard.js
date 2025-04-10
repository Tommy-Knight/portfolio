import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import cv from '../assets/cv.jpg';
import cvPdf from '../assets/TommyKnight-CV2025.pdf';

function CvCard({ isActive, onNavClick }, ref) {
	return (
		<div id='cv' className={`card ${isActive ? 'card--active' : ''}`} ref={ref}>
			<div className='card-content'>
				<div className='card-title'>
					<button
						className='card-nav card-nav--prev'
						onClick={() => onNavClick('prev')}>
						<FontAwesomeIcon icon={faChevronLeft} />
					</button>
					<h2>CV</h2>
					<div className='card-line'></div>
					<button
						className='card-nav card-nav--next'
						onClick={() => onNavClick('next')}>
						<FontAwesomeIcon icon={faChevronRight} />
					</button>
				</div>
				<p>If you'd like to view my 2025 CV, please click the image.</p>
				<div className='cv-container'>
					<a
						href={cvPdf}
						target='_blank'
						rel='noopener noreferrer'
						className='cv-link'>
						<img src={cv} alt='Tommy Knight CV' className='cv-image' />
					</a>
				</div>
			</div>
		</div>
	);
}

export default React.forwardRef(CvCard);
