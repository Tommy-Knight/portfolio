import './game.css';

import { Orbitron } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const orbitron = Orbitron({
  weight: ['500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-game',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tommyk.uk'),
  title: 'T',
  description: 'Blocks.',
  manifest: '/t.webmanifest',
  icons: { icon: '/t-icon-192.png', apple: '/t-icon-180.png' },
  appleWebApp: { capable: true, title: 'T', statusBarStyle: 'black-translucent' },
  robots: { index: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

/* Separate root layout: no Lenis, no custom cursor — both fight touch input */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={orbitron.variable}>
      <body>{children}</body>
    </html>
  );
}
