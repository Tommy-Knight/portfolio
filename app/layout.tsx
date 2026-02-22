import './globals.css';

import {
  IBM_Plex_Mono,
  JetBrains_Mono,
  PT_Serif,
  Noto_Serif,
  Young_Serif,
  Source_Serif_4,
  IBM_Plex_Serif,
  Roboto_Serif,
  Roboto_Mono,
  Space_Mono,
  DM_Mono,
  Noto_Sans_Mono,
} from 'next/font/google';

import CustomCursor from '@/components/CustomCursor';
import LenisProvider from '@/components/LenisProvider';
import type { Metadata } from 'next';

/* ── Serif Fonts (Act I - The Actor) ─────────────────── */
const ptSerif = PT_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-serif',
  preload: false,
});

const notoSerif = Noto_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif',
  preload: false,
});

const youngSerif = Young_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-young-serif',
  preload: false,
});

const sourceSerif = Source_Serif_4({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-source-serif',
  preload: false,
});

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-serif',
  preload: false,
});

const robotoSerif = Roboto_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto-serif',
  preload: false,
});

/* ── Monospace Fonts (Act II - The Engineer) ─────────── */
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-mono',
});

const robotoMono = Roboto_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  preload: false,
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  preload: false,
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  preload: false,
});

const dmMono = DM_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-mono',
  preload: false,
});

const notoSansMono = Noto_Sans_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-mono',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tommyk.uk'),
  title: '🍒',
  description: '</description>',
  icons: { icon: '/icon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ptSerif.variable} ${notoSerif.variable} ${youngSerif.variable} ${sourceSerif.variable} ${ibmPlexSerif.variable} ${robotoSerif.variable} ${ibmPlexMono.variable} ${robotoMono.variable} ${spaceMono.variable} ${jetBrainsMono.variable} ${dmMono.variable} ${notoSansMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Async Google Fonts — non-render-blocking */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap"
          media="all"
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap" />
        </noscript>
      </head>
      <body>
        <LenisProvider>
          <CustomCursor />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
