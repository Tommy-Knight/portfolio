'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Loader from '@/components/Loader';
import Hero from '@/components/Hero';
import { printConsoleGreeting } from '@/lib/consoleGreeting';

const ParticleNetwork = dynamic(() => import('@/components/ParticleNetwork'), { ssr: false });
const About = dynamic(() => import('@/components/About'), { ssr: false });
const MarqueeTape = dynamic(() => import('@/components/MarqueeTape'), { ssr: false });
const Work = dynamic(() => import('@/components/Work'), { ssr: false });
const SiteFooter = dynamic(() => import('@/components/SiteFooter'), { ssr: false });

export default function Home() {
  const [ready, setReady] = useState(false);
  const warnSuppressed = useRef(false);

  if (!warnSuppressed.current && typeof window !== 'undefined') {
    const origWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('ensure that the container has a non-static position')) return;
      origWarn.apply(console, args);
    };
    warnSuppressed.current = true;
  }

  useEffect(() => {
    if (ready && window.lenis) {
      window.lenis.scrollTo(0, { duration: 1 });
    }
    if (ready) {
      printConsoleGreeting();
    }
  }, [ready]);

  return (
    <>
      {!ready && <Loader onComplete={() => setReady(true)} />}
      {ready && <ParticleNetwork />}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <MarqueeTape />
        <Work />
        <SiteFooter />
      </main>
    </>
  );
}
