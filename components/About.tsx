'use client';

import { useEffect, useRef, useState } from 'react';

import { useHoverOnScroll } from '@/hooks/useHoverOnScroll';

const ALL_SERIF_FONTS = [
	'pt-serif',
	'noto-serif',
	'young-serif',
	'source-serif',
	'ibm-serif',
	'roboto-serif',
];

const ALL_SERIF_LABELS = [
	'PT SERIF',
	'NOTO SERIF',
	'YOUNG SERIF',
	'SOURCE SERIF',
	'IBM PLEX SERIF',
	'ROBOTO SERIF',
];

const ALL_MONO_FONTS = [
	'ibm',
	'roboto-mono',
	'space-mono',
	'jetbrains',
	'dm-mono',
	'noto-sans-mono',
];

const ALL_MONO_LABELS = [
	'IBM PLEX MONO',
	'ROBOTO MONO',
	'SPACE MONO',
	'JETBRAINS MONO',
	'DM MONO',
	'NOTO SANS MONO',
];

// Randomly select N fonts from each category
const selectRandomFonts = (
	allFonts: string[],
	allLabels: string[],
	count: number,
) => {
	const indices = new Set<number>();
	while (indices.size < count) {
		indices.add(Math.floor(Math.random() * allFonts.length));
	}
	const selectedIndices = Array.from(indices).sort((a, b) => a - b);
	return {
		fonts: selectedIndices.map((i) => allFonts[i]),
		labels: selectedIndices.map((i) => allLabels[i]),
	};
};

const CYCLE_INTERVAL = 300; // ms per font when hovering

export default function About() {
	const [serifFonts, setSerifFonts] = useState<string[]>([]);
	const [serifLabels, setSerifLabels] = useState<string[]>([]);
	const [monoFonts, setMonoFonts] = useState<string[]>([]);
	const [monoLabels, setMonoLabels] = useState<string[]>([]);

	const [serifIndex, setSerifIndex] = useState(0);
	const [monoIndex, setMonoIndex] = useState(0);

	const serifColRef = useRef<HTMLDivElement>(null);
	const monoColRef = useRef<HTMLDivElement>(null);
	const dividerRef = useRef<HTMLDivElement>(null);

	const serifCycleRef = useRef<NodeJS.Timeout | null>(null);
	const monoCycleRef = useRef<NodeJS.Timeout | null>(null);
	const serifIdleRef = useRef<NodeJS.Timeout | null>(null);
	const monoIdleRef = useRef<NodeJS.Timeout | null>(null);
	const serifStepRef = useRef(0);
	const monoStepRef = useRef(0);

	// Rate limiting: 5 changes then 10s cooldown
	const serifChanges = useRef(0);
	const monoChanges = useRef(0);
	const serifCooldown = useRef(false);
	const monoCooldown = useRef(false);
	const serifCooldownTimer = useRef<NodeJS.Timeout | null>(null);
	const monoCooldownTimer = useRef<NodeJS.Timeout | null>(null);

	// Initialize random fonts (5 of each)
	useEffect(() => {
		const serifSelection = selectRandomFonts(ALL_SERIF_FONTS, ALL_SERIF_LABELS, 5);
		const monoSelection = selectRandomFonts(ALL_MONO_FONTS, ALL_MONO_LABELS, 5);

		setSerifFonts(serifSelection.fonts);
		setSerifLabels(serifSelection.labels);
		setMonoFonts(monoSelection.fonts);
		setMonoLabels(monoSelection.labels);
	}, []);

	// Handle serif font cycling on mousemove
	const handleSerifMouseMove = () => {
		if (serifFonts.length === 0 || serifCooldown.current) return;

		// Clear idle timeout if it exists
		if (serifIdleRef.current) {
			clearTimeout(serifIdleRef.current);
		}

		// If not cycling, start from next font
		if (!serifCycleRef.current) {
			serifStepRef.current = (serifIndex + 1) % serifFonts.length;
			const cycleFonts = () => {
				serifChanges.current++;
				if (serifChanges.current >= 5) {
					serifCooldown.current = true;
					if (serifCycleRef.current) {
						clearTimeout(serifCycleRef.current);
						serifCycleRef.current = null;
					}
					serifCooldownTimer.current = setTimeout(() => {
						serifCooldown.current = false;
						serifChanges.current = 0;
					}, 10000);
					return;
				}
				setSerifIndex(serifStepRef.current);
				serifStepRef.current = (serifStepRef.current + 1) % serifFonts.length;
				serifCycleRef.current = setTimeout(cycleFonts, CYCLE_INTERVAL);
			};

			cycleFonts();
		}

		// Set timeout to stop cycling when mouse stops moving (50ms debounce)
		serifIdleRef.current = setTimeout(() => {
			if (serifCycleRef.current) {
				clearTimeout(serifCycleRef.current);
				serifCycleRef.current = null;
			}
			if (serifIdleRef.current) {
				clearTimeout(serifIdleRef.current);
				serifIdleRef.current = null;
			}
		}, 50);
	};

	const handleSerifMouseLeave = () => {
		if (serifCycleRef.current) {
			clearTimeout(serifCycleRef.current);
			serifCycleRef.current = null;
		}
		if (serifIdleRef.current) {
			clearTimeout(serifIdleRef.current);
			serifIdleRef.current = null;
		}
	};

	const startSerifCycle = () => {
		if (serifFonts.length === 0 || serifCooldown.current) return;
		if (!serifCycleRef.current) {
			serifStepRef.current = (serifIndex + 1) % serifFonts.length;
			const cycleFonts = () => {
				serifChanges.current++;
				if (serifChanges.current >= 5) {
					serifCooldown.current = true;
					if (serifCycleRef.current) {
						clearTimeout(serifCycleRef.current);
						serifCycleRef.current = null;
					}
					serifCooldownTimer.current = setTimeout(() => {
						serifCooldown.current = false;
						serifChanges.current = 0;
					}, 10000);
					return;
				}
				setSerifIndex(serifStepRef.current);
				serifStepRef.current = (serifStepRef.current + 1) % serifFonts.length;
				serifCycleRef.current = setTimeout(cycleFonts, CYCLE_INTERVAL);
			};
			cycleFonts();
		}
	};

	// Handle mono font cycling on mousemove
	const handleMonoMouseMove = () => {
		if (monoFonts.length === 0) return;

		// Clear idle timeout if it exists
		if (monoIdleRef.current) {
			clearTimeout(monoIdleRef.current);
		}

		// If not cycling, start from next font
		if (!monoCycleRef.current) {
			monoStepRef.current = (monoIndex + 1) % monoFonts.length;
			const cycleFonts = () => {
				setMonoIndex(monoStepRef.current);
				monoStepRef.current = (monoStepRef.current + 1) % monoFonts.length;
				monoCycleRef.current = setTimeout(cycleFonts, CYCLE_INTERVAL);
			};

			cycleFonts();
		}

		// Set timeout to stop cycling when mouse stops moving (50ms debounce)
		monoIdleRef.current = setTimeout(() => {
			if (monoCycleRef.current) {
				clearTimeout(monoCycleRef.current);
				monoCycleRef.current = null;
			}
			if (monoIdleRef.current) {
				clearTimeout(monoIdleRef.current);
				monoIdleRef.current = null;
			}
		}, 50);
	};

	const handleMonoMouseLeave = () => {
		if (monoCycleRef.current) {
			clearTimeout(monoCycleRef.current);
			monoCycleRef.current = null;
		}
		if (monoIdleRef.current) {
			clearTimeout(monoIdleRef.current);
			monoIdleRef.current = null;
		}
	};

	const startMonoCycle = () => {
		if (monoFonts.length === 0) return;
		if (!monoCycleRef.current) {
			monoStepRef.current = (monoIndex + 1) % monoFonts.length;
			const cycleFonts = () => {
				setMonoIndex(monoStepRef.current);
				monoStepRef.current = (monoStepRef.current + 1) % monoFonts.length;
				monoCycleRef.current = setTimeout(cycleFonts, CYCLE_INTERVAL);
			};
			cycleFonts();
		}
	};

	useHoverOnScroll(serifColRef, startSerifCycle, handleSerifMouseLeave);
	useHoverOnScroll(monoColRef, startMonoCycle, handleMonoMouseLeave);
	useHoverOnScroll(
		dividerRef,
		() => {
			startSerifCycle();
			startMonoCycle();
		},
		() => {
			handleSerifMouseLeave();
			handleMonoMouseLeave();
		},
	);

	if (serifFonts.length === 0 || monoFonts.length === 0) {
		return null; // Wait for fonts to load
	}

	const currentSerif = serifFonts[serifIndex];
	const currentMono = monoFonts[monoIndex];
	const currentSerifLabel = serifLabels[serifIndex];
	const currentMonoLabel = monoLabels[monoIndex];

	const serifTitleClass = `about-act-title serif ${currentSerif}`;
	const serifBodyClass = `about-act-body serif ${currentSerif}`;
	const monoTitleClass = `about-act-title mono ${currentMono}`;
	const monoBodyClass = `about-act-body mono ${currentMono}`;

	return (
		<section className='about-section'>
			<div className='section-label'>ABOUT // TOMMY_KNIGHT.tsx</div>

			<div className='about-grid'>
				{/* Left — The Stage */}
				<div
					ref={serifColRef}
					className='about-col'
					onMouseMove={handleSerifMouseMove}
					onMouseLeave={handleSerifMouseLeave}>
					<div className='about-act-label'>ACT I</div>
					<h2 className={serifTitleClass}>The Drama Script</h2>
					<div className='about-text-wrapper'>
						<p className={serifBodyClass}>
							Twenty years contributing to 60+ stage and screen productions,
							including work on BAFTA-nominated and RTA-winning projects. Thousands
							of scripts, rewrites, retakes, and a drive to get it right every time.
						</p>
						<p className={serifBodyClass}>
							Film taught me the real power of collaboration. Theatre taught me that
							an audience doesn&apos;t care about process - only the result.
						</p>
					</div>
					<div className='about-font-credit-inline'>{currentSerifLabel}</div>
				</div>

				{/* Divider */}
				<div
					ref={dividerRef}
					className='about-divider'
					onMouseMove={() => {
						handleSerifMouseMove();
						handleMonoMouseMove();
					}}
					onMouseLeave={() => {
						handleSerifMouseLeave();
						handleMonoMouseLeave();
					}}
				/>

				{/* Right — The Server */}
				<div
					ref={monoColRef}
					className='about-col'
					onMouseMove={handleMonoMouseMove}
					onMouseLeave={handleMonoMouseLeave}>
					<div className='about-act-label'>ACT II</div>
					<h2 className={monoTitleClass}>The JavaScript</h2>
					<div className='about-text-wrapper'>
						<p className={monoBodyClass}>
							CUT TO: My VS Code terminal. It's 1 AM and I'm reinstalling <i>node_modules</i>
							for the fifth time tonight. It still feels like a drama, but all I hear
              are the clicks of my keyboard and the hum of the PC fans.
						</p>
						<p className={monoBodyClass}>
							I've been hacking games and writing community plugins since 2006, and trained as
							a full-stack web dev in 2021. I love software, from the open-source
              collaboration to that euphoric feeling when you finally crush a problem.
						</p>
					</div>
					<div className='about-font-credit-inline'>{currentMonoLabel}</div>
				</div>
			</div>

			<div className='about-font-credits'>
				<div className='about-font-credit'>{currentSerifLabel}</div>
				<div className='about-font-credit-spacer' />
				<div className='about-font-credit'>{currentMonoLabel}</div>
			</div>
		</section>
	);
}
