'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { projects } from '../data/projects';

type Project = (typeof projects)[number];

function ProjectCard({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-150px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, rotateX: 30 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: 30 }}
      transition={{ duration: 0.8, delay: index * 0.2, type: 'spring', stiffness: 50 }}
      className="group perspective-1000"
    >
      <motion.button
        type="button"
        onClick={() => onSelect(project)}
        aria-haspopup="dialog"
        aria-label={`Open ${project.title} project preview`}
        className="w-full border-2 border-black p-8 text-left md:p-12 hover:bg-black hover:text-white transition-all duration-500 relative overflow-hidden cursor-pointer focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black"
        whileHover={{ scale: 1.02 }}
        style={{ rotate }}
      >
        <motion.div
          className="absolute inset-0 bg-linear-to-br from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          initial={{ scale: 0, rotate: 45 }}
          whileHover={{ scale: 1.5, rotate: 0 }}
          transition={{ duration: 0.5 }}
        />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <motion.h3
              className="text-3xl md:text-5xl font-bold mb-4 md:mb-0"
              initial={{ x: -50 }}
              animate={isInView ? { x: 0 } : { x: -50 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
            >
              {project.title}
            </motion.h3>
            <motion.span
              aria-hidden="true"
              className="text-6xl md:text-8xl font-bold opacity-20 group-hover:opacity-100 transition-opacity"
              style={{ y }}
            >
              0{index + 1}
            </motion.span>
          </div>

          <motion.p
            className="text-lg md:text-xl mb-6 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
          >
            {project.description}
          </motion.p>

          <div className="flex flex-wrap gap-3" aria-label="Project technologies">
            {project.tags.map((tag, tagIndex) => (
              <motion.span
                key={tag}
                className="px-4 py-2 border border-current text-sm"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.6 + index * 0.2 + tagIndex * 0.1,
                  type: 'spring',
                  stiffness: 200,
                }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

function ProjectPreview({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasProjectImage = project.image && project.image !== '/project-stock.jpg';
  const projectInitials = project.title
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const links = [
    project.links.demo && { label: 'Open live project', href: project.links.demo },
    project.links.github && { label: 'View GitHub', href: project.links.github },
    project.links.video && { label: 'Watch demo', href: project.links.video },
  ].filter(Boolean) as { label: string; href: string }[];

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 py-8 backdrop-blur-sm sm:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-preview-title"
        className="scrollbar-hidden relative w-full max-w-2xl max-h-[82dvh] overflow-y-auto bg-white text-black"
        initial={{ opacity: 0, scale: 0.94, y: 28, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 2 }}
        transition={{ type: 'spring', damping: 24, stiffness: 240 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[16/7] bg-black">
          {hasProjectImage ? (
            <>
              <Image src={project.image} alt={`${project.title} preview`} fill className="object-cover grayscale" />
              <div className="absolute inset-0 bg-black/15" />
            </>
          ) : (
            <div className="absolute inset-0 overflow-hidden bg-black px-5 py-5 text-white sm:px-7 sm:py-6">
              <p className="relative z-10 text-xs font-bold tracking-[0.12em]">PROJECT / PREVIEW</p>
              <span aria-hidden="true" className="absolute -bottom-7 -right-1 text-[9rem] font-bold tracking-tighter text-white/10 sm:text-[13rem]">
                {projectInitials}
              </span>
              <p className="absolute bottom-5 left-5 right-5 z-10 text-2xl font-bold tracking-tight sm:bottom-6 sm:left-7 sm:right-7 sm:text-4xl">
                {project.title}
              </p>
            </div>
          )}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center border-2 border-black bg-white text-2xl font-semibold transition-colors hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={`Close ${project.title} preview`}
          >
            &times;
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <p className="mb-2 text-xs font-bold tracking-[0.08em]">PROJECT PREVIEW</p>
          <h2 id="project-preview-title" className="max-w-[14ch] text-3xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h2>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-gray-700 sm:text-lg">{project.description}</p>

          <div className="mt-5 border-t-2 border-black pt-4">
            <h3 className="text-base font-bold">Stack</h3>
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Project stack">
              {project.tags.map((tag) => (
                <span key={tag} className="border border-black px-2.5 py-1 text-xs font-medium sm:text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {links.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {links.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={index === 0
                    ? 'border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black'
                    : 'border-2 border-black px-4 py-2 text-sm font-bold transition-colors hover:bg-black hover:text-white focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black'}
                >
                  {link.label} &#8599;
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

interface ProjectsProps {
  limit?: number;
  showViewMore?: boolean;
}

function Projects({ limit, showViewMore = true }: ProjectsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-100px' });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const displayedProjects = limit ? projects.slice(0, limit) : projects;
  const hasMore = limit && projects.length > limit;

  return (
    <section id="projects" ref={ref} className="min-h-screen py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <motion.h2
          className="text-5xl md:text-7xl font-bold mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
        >
          <motion.span
            initial={{ display: 'inline-block', x: -100 }}
            animate={isInView ? { x: 0 } : { x: -100 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Selected
          </motion.span>{' '}
          <motion.span
            className="text-outline"
            initial={{ display: 'inline-block', x: 100 }}
            animate={isInView ? { x: 0 } : { x: 100 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Work
          </motion.span>
        </motion.h2>

        <div className="space-y-24">
          {displayedProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} onSelect={setSelectedProject} />
          ))}
        </div>

        {hasMore && showViewMore && (
          <motion.div
            className="flex justify-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/projects">
              <motion.span
                className="inline-block px-12 py-6 border-2 border-black text-xl font-bold hover:bg-black hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Projects
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>

      {selectedProject && <ProjectPreview project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

export default Projects;
