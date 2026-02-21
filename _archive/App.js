import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import Footer from './components/Footer';
import MainContent from './components/MainContent';
import Splash from './components/Splash';
import Wyr from './components/wyr/wyr.js';

function App() {
	const [showSplash, setShowSplash] = useState(true);
	const [darkMode, setDarkMode] = useState(() => {
		const storedDarkMode = localStorage.getItem('darkMode');
		return storedDarkMode === 'enabled' || false;
	});

	useEffect(() => {
		document.body.className = darkMode ? 'dark-mode' : '';
		localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
	}, [darkMode]);

	useEffect(() => {
		if (!showSplash) {
			document.body.style.backgroundColor = darkMode ? '#121212' : '#f0f0f0';
		} else {
			document.body.style.backgroundColor = '';
		}
	}, [showSplash, darkMode]);

	const handleEnterClick = () => {
		setShowSplash(false);
		console.log('welcome ✌️');
	};

	const toggleDarkMode = () => {
		setDarkMode((prevMode) => !prevMode);
	};

	return (
		<div className='app'>
			<BrowserRouter>
				<div className='app'>
					<Routes>
						<Route
							path='/'
							element={
								showSplash ? (
									<Splash onEnterClick={handleEnterClick} />
								) : (
									<>
										<MainContent />
										<Footer darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
									</>
								)
							}
						/>
						<Route path='/wyr' element={<Wyr />} />
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

export default App;
