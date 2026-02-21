import React from 'react';

function CvCard({ isActive, onNavClick }, ref) {
	return (
		<div id='cv' className={`card ${isActive ? 'card--active' : ''}`} ref={ref}>
			<div className='card-content'>
				<div className='card-title'>
					<button
						className='card-nav card-nav--prev'
						onClick={() => onNavClick('prev')}>
						<i className='fas fa-chevron-left'></i>
					</button>
					<h2>CV</h2>
					<div className='card-line'></div>
					<button
						className='card-nav card-nav--next'
						onClick={() => onNavClick('next')}>
						<i className='fas fa-chevron-right'></i>
					</button>
				</div>
				<p>If you'd like to view my 2026 CV, please click the image.</p>
				<div className='cv-container'>
					<a
						href='/cv/TommyKnightCV2026.pdf'
						target='_blank'
						rel='noopener noreferrer'
						className='cv-link'>
						<img src='/cv/cv.jpg' alt='Tommy Knight CV' className='cv-image' />
					</a>
				</div>
			</div>
		</div>
	);
}

export default React.forwardRef(CvCard);
