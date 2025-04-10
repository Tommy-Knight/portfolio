import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

// import './Card.css';
// import project1 from '../assets/project1.jpg'; // Import your images
// import project2 from '../assets/project2.jpg';

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
						<FontAwesomeIcon icon={faChevronLeft} />
					</button>
					<h2>Projects</h2>
					<div className='card-line'></div>
					<button
						className='card-nav card-nav--next'
						onClick={() => onNavClick('next')}>
						<FontAwesomeIcon icon={faChevronRight} />
					</button>
				</div>
				<p>
					These projects showcase my approach to web development: clean, intuitive
					design with subtle animations that enhance navigation. While I love using
					React for its amendable and readable code, I'm also confident building with
					vanilla HTML and JavaScript to ensure the right framework for the job.
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
					<a
						href='/wyr'
						className='project-item'
						rel='noopener noreferrer'>
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