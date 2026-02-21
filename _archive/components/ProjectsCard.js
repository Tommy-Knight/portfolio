import React from 'react';

function ProjectsCard({ isActive, onNavClick }, ref) {
	return (
		<div
			id='projects'
			className={`card ${isActive ? 'card--active' : ''}`}
			ref={ref}>
			<div className='card-content'>
				<div className='card-title'>
					<button
						className='card-nav card-nav--prev'
						onClick={() => onNavClick('prev')}>
						<i className='fas fa-chevron-left'></i>
					</button>
					<h2>Projects</h2>
					<div className='card-line'></div>
					<button
						className='card-nav card-nav--next'
						onClick={() => onNavClick('next')}>
						<i className='fas fa-chevron-right'></i>
					</button>
				</div>
				<p>
					My projects are a minimalist mix of function and feel — clean interfaces, subtle
					animations, and code that's easy to work with (for both humans and
					browsers). It's all about balance.
				</p>
				<div className='project-grid'>
					<a
						href='https://github.com/Tommy-Knight?tab=repositories'
						className='project-item'
						target='_blank'
						rel='noopener noreferrer'>
						<img src={'https://picsum.photos/500/500?grayscale'} alt='Project 1' />
						<div className='project-overlay'>
							<h3 className='project-title'>GitHub</h3>
						</div>
					</a>
					<a href='/wyr' className='project-item' rel='noopener noreferrer'>
						<img src={'https://picsum.photos/500/500?random=1'} alt='Project 2' />
						<div className='project-overlay'>
							<h3 className='project-title'>Would You Rather?</h3>
						</div>
					</a>
				</div>
			</div>
		</div>
	);
}

export default React.forwardRef(ProjectsCard);
