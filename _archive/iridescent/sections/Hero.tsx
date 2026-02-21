'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export function Hero() {
  return (
    <section id="hero" className="min-h-screen flex flex-col items-center justify-center md:justify-start md:pt-32 px-6 md:px-0 md:ml-48 relative">
      <motion.div
        className="flex flex-col items-center md:items-start text-center md:text-left"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Name */}
        <motion.h1
          className="font-mono font-black text-7xl md:text-8xl tracking-tighter leading-none mb-4"
          variants={itemVariants}
        >
          TOMMY
        </motion.h1>

        <motion.h1
          className="font-mono font-black text-7xl md:text-8xl tracking-tighter leading-none mb-8"
          variants={itemVariants}
          style={{
            background: 'linear-gradient(90deg, hsl(var(--hue), 80%, 65%), hsl(var(--hue, 0.5) 60%, 80%, 70%))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          KNIGHT
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-sans text-lg md:text-xl text-text-secondary mb-4"
          variants={itemVariants}
        >
          Full-Stack Engineer & Data Architect
        </motion.p>

        {/* Location */}
        <motion.p
          className="font-mono text-xs uppercase tracking-widest text-text-muted mb-12"
          variants={itemVariants}
        >
          — Southend-on-Sea, UK
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 md:left-auto md:ml-48 md:pl-8 transform -translate-x-1/2 md:translate-x-0"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-6 bg-text-muted/50" />
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
