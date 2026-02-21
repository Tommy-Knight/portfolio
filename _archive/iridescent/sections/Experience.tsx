'use client';

import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/ui/SectionLabel';

const EXPERIENCE = [
  {
    id: 'ventrica',
    title: 'Ventrica Group',
    role: 'Software Engineer',
    period: '2024 — Present',
    description: 'Building cloud-native solutions and modernising legacy infrastructure.',
  },
  {
    id: 'cs-agent',
    title: 'Hood Group',
    role: 'Customer Success Agent',
    period: '2023 — 2024',
    description: 'Triaged technical issues, escalated bugs, managed customer relationships during platform transition.',
  },
  {
    id: 'team-lead',
    title: 'Hood Group',
    role: 'Team Leader',
    period: '2022 — 2023',
    description: 'Led technical team, mentored junior developers, championed Next.js migration, defined modern development standards.',
  },
  {
    id: 'data-analyst',
    title: 'Hood Group',
    role: 'Data Analyst',
    period: '2020 — 2022',
    description: 'Analysed SQL datasets, built dashboards, optimised legacy database queries, reported to C-level stakeholders.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6 },
  },
};

export function Experience() {
  return (
    <section id="experience" className="py-24 px-6 md:ml-48 md:px-12">
      <SectionLabel text="Experience" />

      <motion.div
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {EXPERIENCE.map((role, index) => (
          <motion.div
            key={role.id}
            className="relative flex gap-8"
            variants={itemVariants}
          >
            {/* Timeline Marker */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-accent border-2 border-bg-dark" />
              {index < EXPERIENCE.length - 1 && (
                <div className="w-px h-24 bg-text-muted/20 mt-3" />
              )}
            </div>

            {/* Content */}
            <div className="pb-12 flex-1">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                <h4 className="font-mono text-sm font-bold text-accent uppercase tracking-wider">
                  {role.title}
                </h4>
                <span className="text-text-muted text-xs font-mono mt-1 md:mt-0">
                  {role.period}
                </span>
              </div>

              <p className="text-text-primary font-medium mb-2">
                {role.role}
              </p>

              <p className="text-text-secondary text-sm leading-relaxed">
                {role.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
