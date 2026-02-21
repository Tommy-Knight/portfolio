import React, { useEffect, useRef } from 'react';

function Splash({ onEnterClick }) {
	const headerTitleRef = useRef(null);
	const headerSubtitleRef = useRef(null);
	const dividerRef = useRef(null);
	const buttonRef = useRef(null);

	useEffect(() => {
		// Split title into animated spans
		if (headerTitleRef.current) {
			const text = headerTitleRef.current.textContent;
			headerTitleRef.current.innerHTML = text
				.split('')
				.map(
					(char, i) =>
						`<span style="transition-delay: ${i * 0.06}s">${char === ' ' ? '&nbsp;' : char}</span>`
				)
				.join('');
		}

		// Stagger reveal all elements
		const timer = setTimeout(() => {
			const titleSpans = document.querySelectorAll('.splash-header h1 span');
			titleSpans.forEach((span) => {
				span.style.transform = 'translateY(0)';
				span.style.opacity = 1;
			});

			const delay = (titleSpans.length * 60) + 100;

			setTimeout(() => {
				if (dividerRef.current) {
					dividerRef.current.style.opacity = 1;
				}
			}, delay);

			setTimeout(() => {
				if (headerSubtitleRef.current) {
					headerSubtitleRef.current.style.transform = 'translateY(0)';
					headerSubtitleRef.current.style.opacity = 1;
				}
			}, delay + 120);

			setTimeout(() => {
				if (buttonRef.current) {
					buttonRef.current.style.transform = 'translateY(0)';
					buttonRef.current.style.opacity = 1;
				}
			}, delay + 260);
		}, 200);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className='splash-container'>
			<header className='splash-header'>
				<div className='splash-content'>
					<h1 ref={headerTitleRef}>Tommy Knight</h1>
					<div
						className='splash-divider'
						ref={dividerRef}
						style={{ opacity: 0, transition: 'opacity 0.6s ease' }}
					/>
					<p ref={headerSubtitleRef}>
					Architecting<br />
					Systems<br />
					From Chaos.
				</p>
					<button
						ref={buttonRef}
						id='view-portfolio'
						className='button'
						onClick={onEnterClick}
						style={{
							opacity: 0,
							transform: 'translateY(12px)',
							transition: 'opacity 0.6s ease, transform 0.6s ease, color 0.3s ease, border-color 0.3s ease, letter-spacing 0.35s ease',
						}}>
						Enter
					</button>
				</div>
			</header>
		</div>
	);
}

export default Splash;
