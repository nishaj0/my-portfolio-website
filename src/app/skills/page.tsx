'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const skillCategories = [
  {
    id: 'core-stack',
    label: 'Core Stack',
    tagline: 'Daily drivers for building products end-to-end.',
    skills: [
      {
        name: 'TypeScript',
        icon: '/icons/typescript.svg',
        level: 'Primary language',
        description: 'Shared types across web clients and API layers with strict linting pipelines.',
        meta: ['Generics-first patterns', 'tsup / swc toolchains'],
      },
      {
        name: 'Next.js',
        icon: '/icons/nextjs.svg',
        level: 'App Router',
        description: 'Hybrid rendering, streaming, and edge deployments tuned for performance.',
        meta: ['Server components', 'Route handlers'],
      },
      {
        name: 'React',
        icon: '/icons/react.svg',
        level: 'Advanced',
        description: 'Composable UI systems with motion, state machines, and hooks orchestration.',
        meta: ['Framer Motion', 'Storybook-ready components'],
      },
      {
        name: 'Node.js',
        icon: '/icons/nodejs.svg',
        level: 'Runtime',
        description: 'API gateways, workers, and background jobs with observability baked in.',
        meta: ['REST & tRPC', 'Worker queues'],
      },
      {
        name: 'Tailwind CSS',
        icon: '/icons/tailwind.svg',
        level: 'Design system',
        description: 'Utility-first design tokens, dark mode, and theming for rapid iteration.',
        meta: ['Responsive primitives', 'Custom plugin tooling'],
      },
      {
        name: 'PostgreSQL',
        icon: '/icons/postgresql.svg',
        level: 'Data backbone',
        description: 'Schema design, migrations, and query optimisation for critical workloads.',
        meta: ['Prisma & SQL', 'Performance tuning'],
      },
    ],
  },
  {
    id: 'interface',
    label: 'Frontend & Experience',
    tagline: 'Crafting interfaces that feel responsive, inclusive, and intentional.',
    skills: [
      {
        name: 'JavaScript',
        icon: '/icons/javascript.svg',
        level: 'Language fundamentals',
        description: 'Modern ES patterns, bundler tooling, and performance profiling.',
        meta: ['ESNext features', 'Testing utilities'],
      },
      {
        name: 'HTML5',
        icon: '/icons/html5.svg',
        level: 'Semantics',
        description: 'Accessible structure, ARIA roles, and SEO-ready content architecture.',
        meta: ['Inclusive components', 'Meta optimisation'],
      },
      {
        name: 'Material UI',
        icon: '/icons/material.svg',
        level: 'Component library',
        description: 'Extending design systems with custom theming and interaction patterns.',
        meta: ['Design tokens', 'Theme overrides'],
      },
      {
        name: 'Netlify',
        icon: '/icons/netlify.svg',
        level: 'Frontend ops',
        description: 'Preview pipelines, form handling, and edge routing for marketing sites.',
        meta: ['Deploy previews', 'Serverless functions'],
      },
    ],
  },
  {
    id: 'data-ops',
    label: 'Data & Ops',
    tagline: 'Keeping services observable, reliable, and ready to scale.',
    skills: [
      {
        name: 'MongoDB',
        icon: '/icons/mongodb.svg',
        level: 'Document store',
        description: 'Flexible schemas with aggregation pipelines and Atlas automation.',
        meta: ['Schema design', 'Change streams'],
      },
      {
        name: 'MySQL',
        icon: '/icons/mysql.svg',
        level: 'Relational data',
        description: 'Transactional workloads, read replicas, and migration safety.',
        meta: ['Query optimisation', 'Backup strategies'],
      },
      {
        name: 'Postman',
        icon: '/icons/postman.svg',
        level: 'API tooling',
        description: 'Contract testing, workspace collaboration, and regression suites.',
        meta: ['Collection testing', 'Mock servers'],
      },
      {
        name: 'Ubuntu',
        icon: '/icons/ubuntu.svg',
        level: 'Server OS',
        description: 'Provisioning, hardening, and process supervision for production hosts.',
        meta: ['Systemd automation', 'Shell tooling'],
      },
      {
        name: 'Linux',
        icon: '/icons/linux.svg',
        level: 'Operating system',
        description: 'Container runtimes, networking, and observability on Linux distributions.',
        meta: ['Docker & Podman', 'Tracing & logs'],
      },
    ],
  },
];

const stats = [
  { value: '6+', label: 'Years shipping web apps' },
  { value: '12', label: 'Production services owned' },
  { value: '∞', label: 'Curiosity for new tooling' },
];

const focusAreas = [
  {
    title: 'Reliability-first systems',
    details: 'Tracing, metrics, and guardrails from day one to keep rollouts calm.',
  },
  {
    title: 'Design systems & motion',
    details: 'Building reusable UI primitives with thoughtful animation and accessibility.',
  },
  {
    title: 'Developer experience',
    details: 'Shared tooling, scripts, and documentation that speed up teams.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      type: 'spring' as const,
      stiffness: 160,
      damping: 20,
    },
  }),
};

export default function SkillsPage() {

  return (
    <main className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-white">
      <motion.div
        className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 border border-black/10"
        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 border border-black/10"
        animate={{ y: [0, 40, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-20"
        >
          <div className="max-w-5xl space-y-6">
            <h1 className="text-5xl md:text-8xl font-bold leading-tight">
              All <span className="text-outline">Skills</span> in one playground.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
              A living inventory of the technologies and workflows I use to design, ship, and sustain products.
            </p>
            <motion.div
              className="grid gap-4 pt-4 md:grid-cols-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-2 border-black bg-white px-6 py-5"
                >
                  <span className="text-3xl md:text-4xl font-bold leading-none">{stat.value}</span>
                  <p className="mt-2 text-sm uppercase tracking-wide text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {skillCategories.map((category, sectionIndex) => (
          <motion.section
            key={category.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.6, delay: sectionIndex * 0.05 }}
            className="mt-16"
          >
            <header className="pb-6">
              <h2 className="text-4xl md:text-5xl font-bold capitalize">{category.label}</h2>
              <p className="mt-3 text-lg md:text-xl text-gray-600 max-w-3xl">{category.tagline}</p>
            </header>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {category.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skill.name}
                  className="group relative overflow-hidden border-2 border-black bg-white px-6 py-5"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  custom={skillIndex}
                  whileHover={{ y: -4 }}
                >
                  <motion.div className="absolute inset-0 translate-y-full bg-black transition-transform duration-500 group-hover:translate-y-0" />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="border border-black/20 bg-gray-50 p-3">
                      <Image src={skill.icon} alt={`${skill.name} icon`} width={48} height={48} />
                    </div>
                    <span className="border border-current px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black group-hover:text-white">
                      {skill.level}
                    </span>
                  </div>
                  <div className="relative z-10 mt-4 space-y-2">
                    <h3 className="text-2xl font-bold group-hover:text-white">{skill.name}</h3>
                    <p className="text-sm leading-relaxed text-gray-600 group-hover:text-gray-200">{skill.description}</p>
                  </div>
                  <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                    {skill.meta.map((item) => (
                      <span
                        key={item}
                        className="border border-black px-3 py-1 text-xs uppercase tracking-wide text-black group-hover:border-white group-hover:text-white"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mt-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="border-2 border-black bg-white p-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Focus areas right now</h2>
            <ul className="space-y-6">
              {focusAreas.map((area, index) => (
                <motion.li
                  key={area.title}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-black/10 bg-gray-50 p-6"
                >
                  <h3 className="text-2xl font-semibold">{area.title}</h3>
                  <p className="text-gray-600 mt-2 leading-relaxed">{area.details}</p>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden border-2 border-black bg-black text-white p-8">
            <motion.div
              className="absolute -left-24 top-16 h-48 w-48 border border-white/20"
              animate={{ rotate: [0, 12, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute right-6 bottom-12 h-24 w-24 border border-white/20"
              animate={{ rotate: [0, -15, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <div className="relative z-10 space-y-6">
              <h3 className="text-3xl font-bold">Currently experimenting with</h3>
              <div className="space-y-3 text-gray-200">
                <p>● Edge runtimes and streaming UX for realtime dashboards.</p>
                <p>● Observability pipelines that stay friendly for small teams.</p>
                <p>● Automating integration flows with n8n and custom workers.</p>
              </div>
              <motion.div
                className="mt-10 inline-flex items-center gap-3 border border-white/40 px-5 py-3 text-sm uppercase tracking-wide"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="h-2 w-2 bg-emerald-400" />
                Always iterating on the stack
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
