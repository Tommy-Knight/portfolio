document.addEventListener('DOMContentLoaded', () => {
	// --- DOM Elements ---
	const bodyElement = document.body;
	const headerTitle = document.querySelector('.splash-header h1');
	const headerSubtitle = document.querySelector('.splash-header p');
	const contentContainer = document.querySelector('.content-container');
	const splashContainer = document.querySelector('.splash-container');
	const navHome = document.querySelector('.nav-home'); // the 't' logo
	const navLinks = document.querySelectorAll('.nav-list .nav-item');
	const cards = document.querySelectorAll('.card');
	const footerElement = document.querySelector('.main-footer');
	const darkModeToggle = document.getElementById('dark-mode-toggle');
	const darkModeIcon = darkModeToggle.querySelector('i');

	// --- SPLASH MODULE ---
	//Animates the main title text
	function animateTitle() {
		if (headerTitle) {
			headerTitle.innerHTML = headerTitle.textContent
				.split('')
				.map(
					(char, index) =>
						`<span style="transition-delay: ${index * 0.1}s">${char}</span>`
				)
				.join('');
		}
	}
	// displays all elements on the splash page
	function displaySplashElements() {
		bodyElement.classList.add('loaded');
		if (headerSubtitle) {
			setTimeout(() => {
				headerSubtitle.style.transform = 'translateY(0)';
				headerSubtitle.style.opacity = 1;
				const titleSpans = document.querySelectorAll('.splash-header h1 span');
				titleSpans.forEach((span) => {
					span.style.transform = 'translateY(0)';
					span.style.opacity = 1;
				});
			}, 300);
		}
	}
	// hides the splash page and reveals the main content
	const hideSplash = () => {
		contentContainer.classList.remove('hidden');
		contentContainer.classList.add('show');
		footerElement.classList.remove('hidden');
		footerElement.classList.add('show');
		splashContainer.style.opacity = 0;
		console.log('welcome ✌️');
		setTimeout(() => {
			bodyElement.style.backgroundColor = '#f0f0f0';
			splashContainer.style.display = 'none';
		}, 500);
	};
	// Event listener to hide the splash page
	document.querySelector('#view-portfolio').addEventListener('click', hideSplash);

	// Run animation on page load
	animateTitle();
	window.onload = () => {
		displaySplashElements();
	};

	// --- HOME MODULE ---
	// Reload the page on logo click
	navHome.addEventListener('click', () => {
		window.location.reload();
	});
	// --- NAVIGATION MODULE ---
	// Initializes the navigation
	const initNav = () => {
		if (window.matchMedia('(min-width: 577px)').matches) {
			navLinks.forEach((navLink) => {
				navLink.addEventListener('mouseenter', () =>
					updateActiveCard(navLink.dataset.target)
				);
			});
		}

		navLinks.forEach((link) => {
			link.addEventListener('click', handleNavLinkClick);
		});
		const cardNavLinks = document.querySelectorAll('.card-nav');
		cardNavLinks.forEach((navLink) => {
			navLink.addEventListener('click', handleCardNavClick);
		});
		//set the first card to active:
		updateActiveCard('about');
	};
	// handles the navigation link clicks
	const handleNavLinkClick = (e) => {
		const target = e.currentTarget.dataset.target;
		updateActiveCard(target);
	};
	// Updates the active card and nav element
	const updateActiveCard = (target) => {
		cards.forEach((card) => {
			card.classList.remove('card--active');
		});

		navLinks.forEach((link) => link.classList.remove('active'));

		const targetNavLink = document.querySelector(
			`.nav-list li[data-target="${target}"]`
		);
		if (targetNavLink) {
			targetNavLink.classList.add('active');
		}

		const targetCard = document.getElementById(target);
		if (targetCard) {
			targetCard.classList.add('card--active');
		}
	};
	const handleCardNavClick = (e) => {
		e.preventDefault();
		const currentCard = e.target.closest('.card');
		const cardsArray = Array.from(cards);
		const currentIndex = cardsArray.indexOf(currentCard);
		let nextIndex;
		if (e.currentTarget.classList.contains('card-nav--next')) {
			nextIndex = (currentIndex + 1) % cardsArray.length;
		} else {
			nextIndex = (currentIndex - 1 + cardsArray.length) % cardsArray.length;
		}
		const nextCard = cardsArray[nextIndex];
		const nextTarget = nextCard.id;
		updateActiveCard(nextTarget);
	};
	// Initialize Modules
	initNav();

	// --- DARK MODE MODULE ---
	// Toggles the dark mode on click
	const darkMode = () => {
		bodyElement.classList.toggle('dark-mode');
		updateDarkModeIcon();

		// store darkmode pref in local storage:
		if (bodyElement.classList.contains('dark-mode')) {
			localStorage.setItem('darkMode', 'enabled');
		} else {
			localStorage.setItem('darkMode', 'disabled');
		}
	};
	//function to update the icon
	function updateDarkModeIcon() {
		if (bodyElement.classList.contains('dark-mode')) {
			darkModeIcon.classList.remove('fas', 'fa-moon');
			darkModeIcon.classList.add('fas', 'fa-sun');
		} else {
			darkModeIcon.classList.remove('fas', 'fa-sun');
			darkModeIcon.classList.add('fas', 'fa-moon');
		}
	}
	// Load dark mode pref on page load
	if (localStorage.getItem('darkMode') == 'enabled') {
		darkMode();
	}
	updateDarkModeIcon();
	// Toggle darkmode on click
	darkModeToggle.addEventListener('click', darkMode);
});
