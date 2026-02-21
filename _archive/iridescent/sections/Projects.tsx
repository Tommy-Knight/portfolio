'use client';

import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { HairlineRule } from '@/components/ui/HairlineRule';
import { projects } from '@/data/projects';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function Projects() {
  return (
    <section id="projects" className="py-24 px-6 md:ml-48 md:px-12">
      <SectionLabel text="Projects" />

      <motion.div
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="group"
            variants={cardVariants}
          >
            {/* Project Header */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="font-mono text-2xl font-bold text-accent">
                  {project.title}
                </h3>
                <span className="text-text-muted text-sm">—</span>
                <p className="text-text-secondary text-sm">
                  {project.subtitle}
                </p>
              </div>
            </div>

            {/* Project Description */}
            <p className="text-text-primary mb-4 leading-relaxed max-w-2xl">
              {project.description}
            </p>

            {/* Additional Details */}
            <p className="text-text-secondary text-sm mb-6 max-w-2xl">
              {project.details}
            </p>

            {/* Metrics if available */}
            {project.metrics && (
              <div className="flex flex-wrap gap-6 mb-6">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="flex flex-col">
                    <span className="text-accent font-mono text-lg font-bold">
                      {metric.value}
                    </span>
                    <span className="text-text-muted text-xs uppercase tracking-wider">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs bg-accent/10 border border-accent/30 text-text-primary hover:bg-accent/20 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Project Link */}
            {project.link && (
              <Link
                href={project.link}
                className="inline-flex items-center text-accent hover:opacity-70 transition-opacity font-mono text-sm uppercase tracking-wider"
              >
                View Case Study →
              </Link>
            )}

            {/* Divider */}
            {index < projects.length - 1 && (
              <HairlineRule className="mt-12" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
