let _printed = false;

export function printConsoleGreeting(): void {
  if (_printed) return;
  _printed = true;

  const mono = "'IBM Plex Mono', monospace";

  // ─── Title: TOMMY_K. ──────────────────────────────────────────────────────
  console.log(
    '%cTOMMY_K%c.',
    [
      `color: #fff`,
      `font-family: ${mono}`,
      `font-size: 36px`,
      `font-weight: 700`,
      `letter-spacing: 2px`,
      `text-shadow: 3px 3px 0 #000`,
      `padding: 16px 0 4px`,
    ].join(';'),
    [
      `color: #00FF41`,
      `font-family: ${mono}`,
      `font-size: 36px`,
      `font-weight: 700`,
      `text-shadow: 0 0 8px #00FF41, 0 0 20px #00FF4180, 3px 3px 0 #000`,
    ].join(';')
  );

  // ─── CTA dropdown ─────────────────────────────────────────────────────────
  console.groupCollapsed(
    `%c▶ %c? %c// %cClick Me.`,
    `color:#00FF41;font-size:14px;text-shadow:2px 2px 0 #000;`,
    `color:#e8e8e8;font-family:${mono};font-size:13px;text-shadow:1px 1px 2px rgba(0,0,0,0.5);`,
    `color:#00FF41;font-family:${mono};font-size:13px;font-weight:700;text-shadow:2px 2px 0 #000;`,
    `color:#e8e8e8;font-family:${mono};font-size:13px;text-shadow:1px 1px 2px rgba(0,0,0,0.5);`
  );

  console.table([
    { TECH: 'Next.js 15',       ROLE: 'Framework' },
    { TECH: 'React 18',         ROLE: 'UI' },
    { TECH: 'TypeScript 5',     ROLE: 'Language' },
    { TECH: 'TailwindCSS 4',    ROLE: 'Styling' },
    { TECH: 'Framer Motion 11', ROLE: 'Animation' },
    { TECH: 'Lenis',            ROLE: 'Scroll' },
    { TECH: 'Express 5',        ROLE: 'Backend' },
    { TECH: 'MSSQL / Azure',    ROLE: 'Database' },
    { TECH: 'Netlify',          ROLE: 'Hosting' },
  ]);

  // Contact
  console.log(
    `%cEMAIL    %ctknighted@hotmail.com\n%cGITHUB   %cgithub.com/Tommy-Knight\n%cLINKEDIN %clinkedin.com/in/tommy-knight-785175212`,
    `color:#888;font-family:${mono};font-size:11px;`,
    `color:#e8e8e8;font-family:${mono};font-size:11px;font-weight:700;`,
    `color:#888;font-family:${mono};font-size:11px;`,
    `color:#e8e8e8;font-family:${mono};font-size:11px;font-weight:700;`,
    `color:#888;font-family:${mono};font-size:11px;`,
    `color:#e8e8e8;font-family:${mono};font-size:11px;font-weight:700;`
  );

  console.groupEnd();
}
