import React from 'react';

function ContactCard({ isActive, onNavClick }, ref) {
	return (
		<div id='contact' className={`card ${isActive ? 'card--active' : ''}`} ref={ref}>
			<div className='card-content'>
				<div className='card-title'>
					<button
						className='card-nav card-nav--prev'
						onClick={() => onNavClick('prev')}>
						<i className='fas fa-chevron-left'></i>
					</button>
					<h2>Contact</h2>
					<div className='card-line'></div>
					<button
						className='card-nav card-nav--next'
						onClick={() => onNavClick('next')}>
						<i className='fas fa-chevron-right'></i>
					</button>
				</div>
				<p>
					Think you can 1v1 me in Mario Kart? Prove it! Connect through
					the links below, or send a friendly email. ❤️
				</p>
				<div className='contact-links'>
					<a
						href='https://www.linkedin.com/in/tommy-knight-785175212/'
						target='_blank'
						rel='noopener noreferrer'
						className='contact-link'>
						<i className='fab fa-linkedin'></i>
					</a>
					<a
						href='https://github.com/Tommy-Knight'
						target='_blank'
						rel='noopener noreferrer'
						className='contact-link'>
						<i className='fab fa-github'></i>
					</a>
					<a
						href='https://x.com/_TommyLK'
						target='_blank'
						rel='noopener noreferrer'
						className='contact-link'>
						<i className='fab fa-twitter'></i>
					</a>
					<a href='mailto:tknighted@hotmail.com' className='contact-link'>
						<i className='fas fa-envelope'></i>
					</a>
				</div>
			</div>
		</div>
	);
}

export default React.forwardRef(ContactCard);
