'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useHoverOnScroll } from '@/hooks/useHoverOnScroll';

interface Project {
  number: string;
  name: string;
  year: string;
  stack: string;
  impact: string;
  status: { label: string; type: 'success' | 'error' | 'warning' }[];
}

const PROJECTS: Project[] = [
  {
    number: '01',
    name: 'THE_PORTFOLIO_ENGINE',
    year: '2026',
    stack: 'Next.js / React / Tailwind / Node.js',
    impact: 'Future Awwwards.com Nominee. Modern techno brutalist design. Perfect lighthouse score.',
    status: [
      { label: 'Deployed',           type: 'success' },
      { label: 'Refined',  type: 'success' },
    ],
  },
  {
    number: '02',
    name: 'A_COSY_TRACKER',
    year: '2026',
    stack: 'React Native / REST API / OAuth / Cloudflare / Supabase ',
    impact: 'Full-stack, mobile-first, book tracking app with user libraries, reviews and trending data. Implemented responsive design and real-time user interactions.',
    status: [
      { label: 'Duo Project',    type: 'success' },
      { label: 'Adding Features',    type: 'warning' },
    ],
  },
  {
    number: '03',
    name: 'THE_CORPORATE_MIGRATION',
    year: '2025',
    stack: 'Legacy Code / Next.js / Typescript / Bootstrap / Wordpress / Azure ',
    impact: 'Solo Migration / 0 Downtime / AAA Compliance. Modernised corporate web presence while removing legacy code and improving accessibility. Cookie Compliant.',
    status: [
      { label: 'Modern Best Practice',  type: 'success' },
      { label: 'Legacy Architecture',   type: 'error'   },
    ],
  },
  {
    number: '04',
    name: 'AUTOMATION_TOOLS_&_DATA_DASHBOARDS',
    year: '2024–',
    stack: 'React / SQL Server / Tableau API / PowerShell / Python',
    impact: 'Side Projects. Monitoring dashboards, automation workflows. Enabling real-time reporting and reducing manual tasks.',
    status: [
      { label: 'Active',       type: 'success' },
      { label: 'Continuous Development',  type: 'warning' },
    ],
  },
  {
    number: '05',
    name: 'EPICODE_PROJECTS',
    year: '2021-',
    stack: 'React / Node.js / Express / MongoDB / PostgreSQL / WebSockets / JWT / git',
    impact: 'Full-stack MERN & PostgreSQL applications built in teams using Git. Social media clones, entertainment apps, real-time chat with WebSockets, RESTful APIs, and JWT authentication.',
    status: [
      { label: 'Team Projects',  type: 'success' },
      { label: 'Bootcamp',      type: 'success' },
    ],
  },
  {
    number: '06',
    name: 'OSRS_PRIVATE_SERVERS_&_COMMUNITY_PLUGINS',
    year: '2006–',
    stack: 'Java / Python / Lua / Custom Game Engines',
    impact: 'Game server hosting, modding, community tools. Developed deep understanding of backend logic, networking, and plugin architecture through experimentation and user-driven development.',
    status: [
      { label: 'Legacy',       type: 'success' },
      { label: 'Foundational', type: 'success' },
    ],
  },
];

function ScrollingName({ name, active }: { name: string; active: boolean }) {
  const outerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const rafRef = useRef<number>(0);

  const measure = useCallback(() => {
    if (!outerRef.current || !innerRef.current) return;
    const diff = innerRef.current.scrollWidth - outerRef.current.clientWidth;
    setOverflow(diff > 2 ? diff : 0);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  useEffect(() => {
    if (!active || overflow <= 0 || !innerRef.current) {
      if (innerRef.current) innerRef.current.style.transform = 'translateX(0)';
      return;
    }
    const el = innerRef.current;
    let pos = 0;
    let direction = -1;
    const speed = 0.8;
    const pauseFrames = 90;
    let pause = 0;

    const tick = () => {
      if (pause > 0) {
        pause--;
      } else {
        pos += direction * speed;
        const scrollEnd = overflow + 20;
        if (pos <= -scrollEnd) { pos = -scrollEnd; direction = 1; pause = pauseFrames; }
        if (pos >= 0) { pos = 0; direction = -1; pause = pauseFrames; }
      }
      el.style.transform = `translateX(${pos}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, overflow]);

  const hasOverflow = overflow > 0;

  return (
    <span ref={outerRef} className={`work-name${hasOverflow ? ' work-name-overflow' : ''}${hasOverflow && active ? ' scrolling' : ''}`}>
      <span ref={innerRef} className="work-name-inner">{name}</span>
    </span>
  );
}

function WorkItem({ project, open, onOpen, onClose, onPanelMeasure }: { project: Project; open: boolean; onOpen: () => void; onClose: () => void; onPanelMeasure: (id: string, h: number) => void }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useHoverOnScroll(itemRef, onOpen, onClose);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setContentHeight(h);
      onPanelMeasure(project.number, h);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [onPanelMeasure, project.number]);

  return (
    <div
      ref={itemRef}
      className={`work-item${open ? ' active' : ''}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onClick={() => open ? onClose() : onOpen()}
    >
      <div className="work-item-header">
        <span className="work-number">{project.number}</span>
        <ScrollingName name={project.name} active={open} />
        <span className="work-year">{project.year}</span>
      </div>

      <motion.div
        className="work-diagnostics"
        initial={false}
        animate={{
          height: open ? contentHeight : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div ref={contentRef}>
          <div className="work-diagnostics-inner">
            <div>
              <div className="work-diag-label">STACK</div>
              <div className="work-diag-value">{project.stack}</div>
            </div>
            <div>
              <div className="work-diag-label">IMPACT</div>
              <div className="work-diag-value">{project.impact}</div>
            </div>
          </div>
          <div className="work-status-row">
            {project.status.map((s, i) => (
              <span key={i} className={`work-status-item ${s.type}`}>
                <span className="status-dot" />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Work() {
  const [activeIdx, setActiveIdx] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);
  const panelHeights = useRef<Map<string, number>>(new Map());
  const measured = useRef(false);

  const onPanelMeasure = useCallback((id: string, h: number) => {
    panelHeights.current.set(id, h);

    if (!measured.current && panelHeights.current.size === PROJECTS.length && sectionRef.current) {
      measured.current = true;
      const baseHeight = sectionRef.current.scrollHeight;
      const maxPanel = Math.max(...panelHeights.current.values());
      // Bottom padding (8rem ≈ 128px) already provides some room —
      // only add the panel height minus that existing cushion
      const bottomPadding = parseFloat(getComputedStyle(sectionRef.current).paddingBottom);
      const extra = Math.max(0, maxPanel - bottomPadding);
      setFixedHeight(baseHeight + extra);
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="work-section"
      style={fixedHeight ? { height: fixedHeight } : undefined}
    >
      <div className="section-label">
        SELECTED_WORK // {String(PROJECTS.length).padStart(2, '0')} PROJECTS
      </div>

      <div className="work-header">
        <span>IDX</span>
        <span>PROJECT</span>
        <span style={{ textAlign: 'right' }}>YEAR</span>
      </div>

      <div className="work-list">
        {PROJECTS.map((p) => (
          <WorkItem
            key={p.number}
            project={p}
            open={activeIdx === p.number}
            onOpen={() => setActiveIdx(p.number)}
            onClose={() => setActiveIdx(prev => prev === p.number ? null : prev)}
            onPanelMeasure={onPanelMeasure}
          />
        ))}
      </div>
    </section>
  );
}
