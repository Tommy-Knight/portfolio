'use client';

import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { HairlineRule } from '@/components/ui/HairlineRule';

const DISTINCTIONS = [
  { title: 'BAFTA', label: 'Presenter' },
  { title: 'EGL', label: 'Top 16 Europe' },
  { title: 'Professional', label: 'Actor' },
  { title: 'MHFA', label: 'Certified' },
];

const SKILLS = {
  'Frontend': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
  'Backend & Cloud': ['Node.js', 'PostgreSQL', 'Supabase', 'Azure', 'Cloudflare Workers'],
  'Data Engineering': ['SQL', 'Data Modeling', 'Analytics', 'BI Tools', 'ETL Pipelines'],
  'AI & Workflow': ['Claude API', 'Prompt Engineering', 'Automation', 'LLM Integration'],
};

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function About() {
  return (
    <section id="about" className="py-24 px-6 md:ml-48 md:px-12">
      <SectionLabel text="About" />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Bio */}
        <motion.div variants={itemVariants} className="space-y-6">
          <p className="text-lg text-text-primary leading-relaxed">
            Full-stack engineer with 5+ years modernising legacy enterprise systems. Sole internal developer at Hood Group, bridging SQL backend logic with modern frontends.
          </p>

          <p className="text-text-secondary leading-relaxed">
            Background in 60+ professional productions across BBC, ITV, and West End theatre. This diverse experience brings exceptional adaptability, problem-solving across domains, and an eye for design that balances aesthetics with function.
          </p>

          <p className="text-text-secondary leading-relaxed">
            Passionate about type-safe systems, performance optimisation, and building tools that delightfully serve their users. Currently exploring AI-augmented workflows and data architecture patterns at scale.
          </p>
        </motion.div>

        {/* Distinctions & Skills */}
        <motion.div variants={itemVariants} className="space-y-8">
          {/* Distinctions Grid */}
          <div className="grid grid-cols-2 gap-4">
            {DISTINCTIONS.map((distinction) => (
              <div
                key={distinction.title}
                className="p-4 border border-accent/20 hover:border-accent/40 transition-colors"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent mb-2">
                  {distinction.title}
                </p>
                <p className="text-sm text-text-secondary">
                  {distinction.label}
                </p>
              </div>
            ))}
          </div>

          <HairlineRule className="my-8" />

          {/* Skills */}
          <div className="space-y-6">
            {Object.entries(SKILLS).map(([category, skills]) => (
              <div key={category}>
                <h4 className="font-mono text-xs uppercase tracking-widest text-text-muted mb-3">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-sm text-text-primary hover:bg-accent/20 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
