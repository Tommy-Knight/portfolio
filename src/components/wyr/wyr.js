import './wyr.css'; // Import the CSS

import React, { useCallback, useEffect, useState } from 'react';

import { faGithub } from '@fortawesome/free-brands-svg-icons'; // Import GitHub icon

const API_URL = process.env.REACT_APP_API_URL || ''; // Get API URL from env

function WouldYouRather() {
	const [question, setQuestion] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showResults, setShowResults] = useState(false);
	const [voted, setVoted] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// State for the submission form
	const [newOptionA, setNewOptionA] = useState('');
	const [newOptionB, setNewOptionB] = useState('');
	const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' }); // type: '', 'loading', 'success', 'error'
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFlagging, setIsFlagging] = useState(false);

	// --- API Functions ---

	const fetchQuestion = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		setQuestion(null); // Clear old question
		setShowResults(false);
		setVoted(false);
		setSubmitStatus({ message: '', type: '' }); // Clear menu status

		if (!API_URL) {
			setError('API URL is not configured. Please set REACT_APP_API_URL.');
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(`${API_URL}/api/wyr/question`);
			if (!response.ok) {
				let errorMsg = `Error: ${response.status}`;
				try {
					const errData = await response.json();
					errorMsg = errData.error || errorMsg;
				} catch (e) {
					/* Ignore if response body is not JSON */
				}
				throw new Error(errorMsg);
			}
			const data = await response.json();
			setQuestion(data);
		} catch (err) {
			console.error('Fetch question error:', err);
			setError(err.message || 'Failed to fetch question. Is the backend running?');
		} finally {
			setIsLoading(false);
		}
	}, []); // No dependencies, fetch on mount/refresh

	const handleVote = async (option) => {
		// option is 'A' or 'B'
		if (voted || !question || !API_URL) return;

		setVoted(true); // Immediately disable voting

		try {
			const response = await fetch(
				`${API_URL}/api/wyr/vote/${question.id}/${option}`,
				{
					method: 'POST',
				}
			);

			if (!response.ok) {
				let errorMsg = `Vote Error: ${response.status}`;
				try {
					const errData = await response.json();
					errorMsg = errData.error || errorMsg;
				} catch (e) {
					/* Ignore */
				}
				// Allow showing results even if vote fails? Or revert? For now, show results.
				console.error(errorMsg);
				// Optionally set an error state specific to voting
			} else {
				const resultData = await response.json();
				// Update percentages based on the response from the backend
				// This ensures accuracy if multiple people vote concurrently
				setQuestion((prev) => ({
					...prev,
					optionA_votes: resultData.optionAVotes,
					optionB_votes: resultData.optionBVotes,
					optionA_percentage: resultData.percentages.optionA,
					optionB_percentage: resultData.percentages.optionB,
				}));
			}
		} catch (err) {
			console.error('Vote submission error:', err);
			// Handle network errors etc. Maybe show a small error message near the vote button
		} finally {
			setShowResults(true); // Show results regardless of minor errors for now
			// Consider adding a "Next Question" button here or automatically fetching after a delay
			setTimeout(fetchQuestion, 3000); // Fetch next question after 3 seconds
		}
	};

	const handleFlag = async () => {
		if (!question || isFlagging || !API_URL) return;

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
				} catch (e) {
					/* Ignore */
				}
				throw new Error(errorMsg);
			}

			setSubmitStatus({ message: 'Question Flagged!', type: 'success' });
			// Fetch a new question immediately after flagging
			setTimeout(() => {
				fetchQuestion();
				closeMenu(); // Close menu after action
			}, 1500); // Short delay to show success message
		} catch (err) {
			console.error('Flagging error:', err);
			setSubmitStatus({
				message: err.message || 'Failed to flag question.',
				type: 'error',
			});
		} finally {
			setTimeout(() => setIsFlagging(false), 1500); // Re-enable button after timeout
		}
	};

	const handleSubmitNewQuestion = async (event) => {
		event.preventDefault(); // Prevent page reload
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
				} catch (e) {
					/* Ignore */
				}
				throw new Error(errorMsg);
			}

			// const resultData = await response.json(); // Contains the new question if needed
			setSubmitStatus({ message: 'Question Submitted!', type: 'success' });
			setNewOptionA(''); // Clear form
			setNewOptionB('');
			setTimeout(() => {
				closeMenu(); // Close menu after successful submission
				setSubmitStatus({ message: '', type: '' }); // Reset status after closing
			}, 1500); // Delay to show success message
		} catch (err) {
			console.error('Submission error:', err);
			setSubmitStatus({
				message: err.message || 'Failed to submit question.',
				type: 'error',
			});
		} finally {
			setTimeout(() => setIsSubmitting(false), 1500); // Re-enable button after timeout
		}
	};

	// --- Effects ---

	// Fetch initial question on mount
	useEffect(() => {
		fetchQuestion();
	}, [fetchQuestion]); // fetchQuestion is memoized with useCallback

	// --- Menu Logic ---
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
		if (!isMenuOpen) {
			// Reset menu status when opening
			setSubmitStatus({ message: '', type: '' });
		}
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	// --- Render Logic ---

	const renderContent = () => {
		if (isLoading) {
			return <div className='wyr-loading'>Loading question...</div>;
		}
		if (error) {
			return (
				<div className='wyr-error'>
					Error: {error} <button onClick={fetchQuestion}>Try Again</button>
				</div>
			);
		}
		if (!question) {
			return <div className='wyr-loading'>No questions available.</div>; // Or a different message
		}

		// If we have a question
		return (
			<div className='wyr-options-container'>
				{/* Option A (Black Card) */}
				<div
					className={`wyr-option wyr-option-a ${voted ? 'voted' : ''}`}
					onClick={() => handleVote('A')}>
					{/* Header elements specific to this card */}
					<div className='wyr-header'>
						<div className='wyr-github-link'>
							<a
								href='https://github.com/your-github/your-repo'
								target='_blank'
								rel='noopener noreferrer'
								aria-label='GitHub Repository'>
								<faGithub />
							</a>
						</div>
						{/* Burger is shown in the other card */}
					</div>
					{/* Content */}
					<div className='wyr-option-content'>
						<h2 className={showResults ? 'hidden' : ''}>{question.optionA_text}</h2>
						<div className={`wyr-percentage ${!showResults ? 'hidden' : ''}`}>
							{question.optionA_percentage}%
						</div>
					</div>
				</div>

				{/* Option B (White Card) */}
				<div
					className={`wyr-option wyr-option-b ${voted ? 'voted' : ''}`}
					onClick={() => handleVote('B')}>
					{/* Header elements specific to this card */}
					<div className='wyr-header'>
						{/* GitHub Link is shown in the other card */}
						<button
							className='wyr-burger-menu'
							onClick={(e) => {
								e.stopPropagation();
								toggleMenu();
							}}
							aria-label='Open Menu'>
							<span></span>
							<span></span>
							<span></span>
						</button>
					</div>
					{/* Content */}
					<div className='wyr-option-content'>
						<h2 className={showResults ? 'hidden' : ''}>{question.optionB_text}</h2>
						<div className={`wyr-percentage ${!showResults ? 'hidden' : ''}`}>
							{question.optionB_percentage}%
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className={`wyr-container ${isMenuOpen ? 'menu-open' : ''}`}>
			{renderContent()}

			{/* --- Menu Overlay --- */}
			<div className={`wyr-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
				<button
					className='wyr-menu-close'
					onClick={closeMenu}
					aria-label='Close Menu'>
					×
				</button>
				<div className='wyr-menu-content'>
					<h3>Submit Your Own</h3>
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

					<hr style={{ borderColor: '#555', margin: '2rem 0' }} />

					<h3>Report Current Question</h3>
					{question &&
						!voted && ( // Only show flag button if a question is loaded and not voted on yet
							<button
								className='wyr-flag-button'
								onClick={handleFlag}
								disabled={isFlagging}>
								{isFlagging ? 'Flagging...' : 'Flag This Question'}
							</button>
						)}
					{!question && <p>Load a question to flag it.</p>}
					{voted && <p>You can flag the next question.</p>}

					<div className={`wyr-submit-status ${submitStatus.type}`}>
						{submitStatus.message}
					</div>
				</div>
			</div>
		</div>
	);
}

export default WouldYouRather;
