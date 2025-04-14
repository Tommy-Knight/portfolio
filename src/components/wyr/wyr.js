import './wyr.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function WouldYouRather() {
	const [question, setQuestion] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showResults, setShowResults] = useState(false);
	const [voted, setVoted] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoadingNext, setIsLoadingNext] = useState(false);

	const [displayPercentA, setDisplayPercentA] = useState(0);
	const [displayPercentB, setDisplayPercentB] = useState(0);
	const animationFrameRef = useRef();
	const nextQuestionTimerRef = useRef();

	const [newOptionA, setNewOptionA] = useState('');
	const [newOptionB, setNewOptionB] = useState('');
	const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFlagging, setIsFlagging] = useState(false);

	const API_URL = process.env.REACT_APP_API_URL || '';
	const NEXT_QUESTION_DELAY = 2500;
	const PERCENTAGE_ANIMATION_DURATION = 1000;

	const lowerCaseFirst = (str) =>
		str ? str.charAt(0).toLowerCase() + str.slice(1) : '';

	// --- API ---
	const fetchQuestion = useCallback(
		async (isInitialLoad = false) => {
			console.log('Fetching! 🐶');
			if (isInitialLoad || error) {
				setIsLoading(true);
			}
			setError(null);
			setIsLoadingNext(false);
			setShowResults(false);
			setVoted(false);
			setDisplayPercentA(0);
			setDisplayPercentB(0);

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (nextQuestionTimerRef.current) {
				clearTimeout(nextQuestionTimerRef.current);
			}

			if (!API_URL) {
				console.error('API URL not configured');
				setError('API URL is not configured.');
				setIsLoading(false);
				setQuestion(null);
				return;
			}

			try {
				const response = await fetch(`${API_URL}/api/wyr/question`);
				if (!response.ok) {
					let errorMsg = `Error: ${response.status}`;
					try {
						const errData = await response.json();
						errorMsg = errData.error || errorMsg;
						console.log('Received error message from API:', errorMsg);
					} catch (e) {
						console.error('Error parsing error response:', e);
					}
					throw new Error(errorMsg);
				}
				const data = await response.json();
				console.log('Fetched! 🦴', data);
				if (data && data.id) {
					setQuestion(data);
				} else {
					throw new Error('Received invalid question data from API.');
				}
			} catch (err) {
				console.error('Fetch question error:', err);
				setError(err.message || 'Failed to fetch question.');
				setQuestion(null);
			} finally {
				setIsLoading(false);
			}
		},
		[error, API_URL]
	);

	// --- Initial Fetch ---
	useEffect(() => {
		fetchQuestion(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		return () => {
			if (nextQuestionTimerRef.current) {
				clearTimeout(nextQuestionTimerRef.current);
			}
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	// --- Vote ---
	const handleVote = async (option) => {
		if (voted || !question || !API_URL || isLoadingNext) return;

		setVoted(true);
		setShowResults(true);

		setTimeout(() => {
			setIsLoadingNext(true);

			nextQuestionTimerRef.current = setTimeout(() => {
				fetchQuestion();
			}, NEXT_QUESTION_DELAY);
		}, 100);
		try {
			const response = await fetch(
				`${API_URL}/api/wyr/vote/${question.id}/${option}`,
				{ method: 'POST' }
			);

			if (response.ok) {
				const resultData = await response.json();
				setQuestion((prev) =>
					prev
						? {
								...prev,
								optionA_votes: resultData.optionAVotes,
								optionB_votes: resultData.optionBVotes,
								optionA_percentage: resultData.percentages.optionA,
								optionB_percentage: resultData.percentages.optionB,
						  }
						: null
				);
				console.log('✅ Voted');
			} else {
				let errorMsg = `Vote Error: ${response.status}`;
				try {
					const errData = await response.json();
					errorMsg = errData.error || errorMsg;
				} catch (e) {}
				console.error(errorMsg);
			}
		} catch (err) {
			console.error('Vote submission error:', err);
		}
	};

	// --- Percentage Animation ---
	useEffect(() => {
		if (!showResults || !question) {
			setDisplayPercentA(0);
			setDisplayPercentB(0);
			if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
			return;
		}
		const targetA = question.optionA_percentage || 0;
		const targetB = question.optionB_percentage || 0;
		let startTimestamp = null;
		const duration = PERCENTAGE_ANIMATION_DURATION;

		const step = (timestamp) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const elapsed = timestamp - startTimestamp;
			const progress = Math.min(elapsed / duration, 1);
			setDisplayPercentA(Math.floor(progress * targetA));
			setDisplayPercentB(Math.floor(progress * targetB));
			if (progress < 1) {
				animationFrameRef.current = requestAnimationFrame(step);
			} else {
				setDisplayPercentA(targetA);
				setDisplayPercentB(targetB);
			}
		};
		animationFrameRef.current = requestAnimationFrame(step);
		return () => {
			if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
		};
	}, [showResults, question]);

	// --- Flag Question ---
	const handleFlag = async () => {
		if (!question || isFlagging || !API_URL || isLoadingNext) return;
		setIsFlagging(true);
		setSubmitStatus({ message: 'Flagging...', type: 'loading' });
		try {
			const response = await fetch(`${API_URL}/api/wyr/flag/${question.id}`, {
				method: 'POST',
			});
			if (!response.ok) {
				let errorMsg = `Flag Error: ${response.status}`;
				try {
					const errData = await response.json();
					errorMsg = errData.error || errorMsg;
				} catch (e) {}
				throw new Error(errorMsg);
			}
			setSubmitStatus({
				message: 'Question Flagged! Loading next...',
				type: 'success',
			});
			closeMenu();
			fetchQuestion();
		} catch (err) {
			console.error('Flag submission error:', err);
			setSubmitStatus({ message: err.message || 'Flagging failed.', type: 'error' });
		} finally {
			setTimeout(() => {
				setIsFlagging(false);
			}, 1500);
		}
	};

	// --- Submit New Question ---
	const handleSubmitNewQuestion = async (event) => {
		event.preventDefault();
		if (!newOptionA || !newOptionB || isSubmitting || !API_URL) return;
		setIsSubmitting(true);
		setSubmitStatus({ message: 'Submitting...', type: 'loading' });
		try {
			const response = await fetch(`${API_URL}/api/wyr/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ optionA: newOptionA, optionB: newOptionB }),
			});
			if (!response.ok) {
				let errorMsg = `Submit Error: ${response.status}`;
				try {
					const errData = await response.json();
					errorMsg = errData.error || errorMsg;
				} catch (e) {}
				throw new Error(errorMsg);
			}
			setSubmitStatus({ message: 'Question Submitted!', type: 'success' });
			setNewOptionA('');
			setNewOptionB('');
			setTimeout(() => {
				closeMenu();
				setSubmitStatus({ message: '', type: '' });
			}, 1500);
		} catch (err) {
			console.error('Submit new question error:', err);
			setSubmitStatus({
				message: err.message || 'Submission failed.',
				type: 'error',
			});
		} finally {
			setTimeout(() => setIsSubmitting(false), 1500);
		}
	};

	// --- Menu  ---
	const toggleMenu = () => setIsMenuOpen((prev) => !prev);
	const closeMenu = () => setIsMenuOpen(false);

	const renderContent = () => {
		if (error)
			return (
				<div className='wyr-error'>
					Error: {error}{' '}
					<button onClick={() => fetchQuestion(true)}>Try Again</button>
				</div>
			);
		if (isLoading && !question)
			return <div className='wyr-loading'>Loading question...</div>;
		if (!isLoading && !question)
			return (
				<div className='wyr-loading'>
					No questions available.{' '}
					<button onClick={() => fetchQuestion(true)}>Try Again</button>
				</div>
			);

		if (question) {
			return (
				<div className='wyr-options-container'>
					<div
						className={`wyr-option wyr-option-a ${voted ? 'voted' : ''} ${
							isLoadingNext ? 'loading-next' : ''
						}`}
						onClick={() => handleVote('A')}>
						<div className='wyr-option-content'>
							<h2 className={!showResults ? 'visible' : ''}>
								{question.optionA_text}
							</h2>
							<div className={`wyr-result-sentence ${showResults ? 'visible' : ''}`}>
								<span className='wyr-result-percentage'>{displayPercentA}%</span>
								{showResults &&
									` of people would rather ${lowerCaseFirst(question.optionA_text)}`}
							</div>
						</div>
					</div>
					<div
						className={`wyr-option wyr-option-b ${voted ? 'voted' : ''} ${
							isLoadingNext ? 'loading-next' : ''
						}`}
						onClick={() => handleVote('B')}>
						<div className='wyr-option-content'>
							<h2 className={!showResults ? 'visible' : ''}>
								{question.optionB_text}
							</h2>
							<div className={`wyr-result-sentence ${showResults ? 'visible' : ''}`}>
								<span className='wyr-result-percentage'>{displayPercentB}%</span>
								{showResults &&
									` of people would rather ${lowerCaseFirst(question.optionB_text)}`}
							</div>
						</div>
					</div>
				</div>
			);
		}
		return <div className='wyr-loading'>Loading...</div>;
	};

	return (
		<div className={`wyr-container ${isMenuOpen ? 'menu-open' : ''}`}>
			<div className={`wyr-loading-bar-container ${isLoadingNext ? 'visible' : ''}`}>
				<div className='wyr-loading-bar'></div>
			</div>

			<div className='wyr-header'>
				<div className='wyr-github-link'>
					<a
						href='https://github.com/Tommy-Knight/wyr-server'
						target='_blank'
						rel='noopener noreferrer'
						aria-label='GitHub Repository'>
						<FontAwesomeIcon icon={faGithub} />
					</a>
				</div>
				<button
					className='wyr-burger-menu'
					onClick={toggleMenu}
					aria-label='Open Menu'>
					<span></span>
					<span></span>
				</button>
			</div>

			{renderContent()}

			<div className={`wyr-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
				<button
					className='wyr-menu-close'
					onClick={closeMenu}
					aria-label='Close Menu'>
					×
				</button>
				<div className='wyr-menu-content'>
					<h3>Would You Rather</h3>
					<form className='wyr-menu-form' onSubmit={handleSubmitNewQuestion}>
						<div>
							<label htmlFor='optionA'>Option A:</label>
							<input
								type='text'
								id='optionA'
								value={newOptionA}
								onChange={(e) => setNewOptionA(e.target.value)}
								maxLength='500'
								required
								disabled={isSubmitting}
							/>
						</div>
						<div>
							<label htmlFor='optionB'>Option B:</label>
							<input
								type='text'
								id='optionB'
								value={newOptionB}
								onChange={(e) => setNewOptionB(e.target.value)}
								maxLength='500'
								required
								disabled={isSubmitting}
							/>
						</div>
						<button
							type='submit'
							className='wyr-menu-button'
							disabled={isSubmitting || !newOptionA || !newOptionB}>
							{isSubmitting ? 'Submitting...' : 'Submit Question'}
						</button>
					</form>

					{(question || !error) && (
						<hr style={{ borderColor: '#555', margin: '2rem 0 1rem' }} />
					)}

					{question && !isLoadingNext && !error && (
						<>
							<button
								className='wyr-flag-button'
								onClick={handleFlag}
								disabled={isFlagging}>
								{isFlagging ? 'Flagging...' : 'Flag This Question'}
							</button>
						</>
					)}

					<a href='https://tommyk.uk' className='wyr-exit-link' target='_self'>
						Exit App
					</a>

					<div className={`wyr-submit-status ${submitStatus.type}`}>
						{submitStatus.message}
					</div>
				</div>
			</div>
		</div>
	);
}

export default WouldYouRather;
