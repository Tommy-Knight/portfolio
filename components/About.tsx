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

export default function About() {
	const [serifFonts, setSerifFonts] = useState<string[]>([]);
	const [serifLabels, setSerifLabels] = useState<string[]>([]);
	const [monoFonts, setMonoFonts] = useState<string[]>([]);
	const [monoLabels, setMonoLabels] = useState<string[]>([]);

	const [serifIndex, setSerifIndex] = useState(0);
	const [monoIndex, setMonoIndex] = useState(0);

	const serifColRef = useRef<HTMLDivElement>(null);
	const monoColRef = useRef<HTMLDivElement>(null);

	// Initialize random fonts (5 of each)
	useEffect(() => {
		const serifSelection = selectRandomFonts(ALL_SERIF_FONTS, ALL_SERIF_LABELS, 5);
		const monoSelection = selectRandomFonts(ALL_MONO_FONTS, ALL_MONO_LABELS, 5);

		setSerifFonts(serifSelection.fonts);
		setSerifLabels(serifSelection.labels);
		setMonoFonts(monoSelection.fonts);
		setMonoLabels(monoSelection.labels);
	}, []);

	// Advance to next font — one change per trigger
	const nextSerif = () => {
		if (serifFonts.length === 0) return;
		setSerifIndex((i) => (i + 1) % serifFonts.length);
	};

	const nextMono = () => {
		if (monoFonts.length === 0) return;
		setMonoIndex((i) => (i + 1) % monoFonts.length);
	};

	// Scroll-hover: advance once on enter, no-op on leave
	useHoverOnScroll(serifColRef, nextSerif, () => {});
	useHoverOnScroll(monoColRef, nextMono, () => {});


	if (serifFonts.length === 0 || monoFonts.length === 0) {
		return null;
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
					onMouseEnter={nextSerif}
					onClick={nextSerif}>
					<div className='about-act-label'>ACT I</div>
					<h2 className={serifTitleClass}>The Drama Script</h2>
					<div className='about-text-wrapper'>
						<p className={serifBodyClass}>
							Twenty years contributing to 60+ stage and screen productions,
							including work on BAFTA-nominated and RTA-winning projects. Countless
              scripts, rewrites, retakes, and a need to get it right every time.
						</p>
						<p className={serifBodyClass}>
							Film taught me the real power of collaboration. Theatre taught me that
							an audience doesn&apos;t care about process - only the result.
						</p>
					</div>
					<div className='about-font-credit-inline'>{currentSerifLabel}</div>
				</div>

				<div className='about-divider' />

				{/* Right — The Server */}
				<div
					ref={monoColRef}
					className='about-col'
					onMouseEnter={nextMono}
					onClick={nextMono}>
					<div className='about-act-label'>ACT II</div>
					<h2 className={monoTitleClass}>The JavaScript</h2>
					<div className='about-text-wrapper'>
						<p className={monoBodyClass}>
							CUT TO: My VS Code terminal. It's 1 AM and I'm reinstalling <i>node_modules </i>
							for the fifth time tonight.
						</p>
						<p className={monoBodyClass}>
							I've been hacking games and writing community plugins since 2006, and trained as
							a full-stack web dev in 2021. Software is just theatre for machines,
              the truth still behind a curtain.
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
