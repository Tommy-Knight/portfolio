'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'hero', label: 'Home', href: '#hero' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'contact', label: 'Contact', href: '#contact' },
  { id: 'wyr', label: 'WYR', href: '/wyr' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation - Fixed Left Sidebar */}
      <nav className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-48 md:border-r md:border-text-muted/20 md:flex md:flex-col md:items-start md:justify-center md:px-8 md:py-12 md:space-y-6 md:z-40">
        <div className="space-y-6">
          <Link href="/" className="block">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent hover:opacity-80 transition-opacity">
              Tommy Knight
            </h3>
          </Link>

          <div className="space-y-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block font-mono uppercase text-xs tracking-wider text-text-secondary hover:text-accent transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="mt-auto text-xs text-text-muted font-mono">
          <p>© 2026 Tommy Knight</p>
          <p className="text-accent mt-2">
            <Link href="https://github.com/tommyk" target="_blank" className="hover:opacity-80">
              github
            </Link>
          </p>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-text-muted/20 bg-bg-dark/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="block">
            <h3 className="font-mono text-xs uppercase tracking-widest text-accent">TK</h3>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-text-primary hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-text-muted/20 px-6 py-4 space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block font-mono uppercase text-xs tracking-wider text-text-secondary hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile Padding */}
      <div className="md:hidden h-16" />
    </>
  );
}
