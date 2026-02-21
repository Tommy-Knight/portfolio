import React from 'react';

function Footer({ darkMode, toggleDarkMode }) {
	return (
		<footer className='main-footer show'>
			<p>© 2026 Tommy Knight</p>
			<button
				id='dark-mode-toggle'
				className='dark-mode-toggle'
				onClick={toggleDarkMode}>
				<i className={darkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
			</button>
		</footer>
	);
}

export default Footer;
