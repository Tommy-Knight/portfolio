'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SectionLabel } from '@/components/ui/SectionLabel';

const CONTACT_LINKS = [
  { label: 'Email', href: 'mailto:tommy@tommyk.uk', icon: '✉' },
  { label: 'GitHub', href: 'https://github.com/tommyk', icon: '↗' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/tommyk', icon: '↗' },
  { label: 'X / Twitter', href: 'https://x.com/tommyk', icon: '↗' },
];

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
    transition: { duration: 0.6 },
  },
};

export function Contact() {
  return (
    <section id="contact" className="py-24 px-6 md:ml-48 md:px-12 min-h-screen flex flex-col items-center justify-center">
      <motion.div
        className="text-center max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div variants={itemVariants} className="mb-12">
          <SectionLabel text="Get In Touch" />
        </motion.div>

        <motion.h2
          className="font-mono text-4xl md:text-5xl font-bold text-accent mb-6"
          variants={itemVariants}
        >
          Let's Work Together
        </motion.h2>

        <motion.p
          className="text-text-secondary text-lg leading-relaxed mb-12"
          variants={itemVariants}
        >
          I'm open to new opportunities, collaborations, and interesting conversations. Reach out via email or connect on social platforms.
        </motion.p>

        {/* Contact Links */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16"
          variants={containerVariants}
        >
          {CONTACT_LINKS.map((link) => (
            <motion.div key={link.label} variants={itemVariants}>
              <Link
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-2 px-6 py-3 border border-accent/30 text-text-primary hover:border-accent hover:bg-accent/10 transition-all duration-300 font-mono text-sm uppercase tracking-wider"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CV Download */}
        <motion.div variants={itemVariants} className="mb-16">
          <Link
            href="/cv/TommyKnightCV2026.pdf"
            download
            className="inline-flex items-center gap-2 text-accent hover:opacity-70 transition-opacity font-mono text-sm uppercase tracking-wider"
          >
            Download CV → PDF (2026)
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="pt-12 border-t border-text-muted/20 space-y-2"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted">
            © 2026 Tommy Knight
          </p>
          <p className="text-text-muted text-xs">
            Designed & Built with React, Next.js, and Tailwind CSS
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
