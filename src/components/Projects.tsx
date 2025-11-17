'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

export const projects = [
  {
    title: 'Portal Bot',
    description: 'A Discord bot for anonymous random chat matching.',
    tags: ['TypeScript', 'Node.js', 'Discord.js', 'MongoDB'],
  },
  {
    title: 'Concrino Software',
    description: 'An internal tool for generating architecture and construction quotations.',
    tags: ['TypeScript', 'Node.js', 'React', 'MongoDB'],
  },
  {
    title: 'Lunara App',
    description: 'A personal growth platform focused on habits, challenges, and community.',
    tags: ['Go', 'TypeScript', 'React', 'PostgreSQL'],
  },
  {
    title: 'Sky Island',
    description: 'A simple Three.js scene built using basic materials for learning 3D rendering.',
    tags: ['JavaScript', 'Three.js'],
  },
];


function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-150px" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100, rotateX: 30 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: 30 }}
      transition={{ duration: 0.8, delay: index * 0.2, type: "spring", stiffness: 50 }}
      className="group perspective-1000"
    >
      <motion.div 
        className="border-2 border-black p-8 md:p-12 hover:bg-black hover:text-white transition-all duration-500 relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        style={{ rotate }}
      >
        {/* Animated background on hover */}
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
          
          <div className="flex flex-wrap gap-3">
            {project.tags.map((tag, tagIndex) => (
              <motion.span
                key={tag}
                className="px-4 py-2 border border-current text-sm"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.6 + index * 0.2 + tagIndex * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ProjectsProps {
  limit?: number;
  showViewMore?: boolean;
}

function Projects({ limit, showViewMore = true }: ProjectsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const displayedProjects = limit ? projects.slice(0, limit) : projects;
  const hasMore = limit && projects.length > limit;

  return (
    <section id="projects" ref={ref} className="min-h-screen py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <motion.h2
          className="text-5xl md:text-7xl font-bold mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
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
            <ProjectCard key={project.title} project={project} index={index} />
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
              <motion.button
                className="px-12 py-6 border-2 border-black text-xl font-bold hover:bg-black hover:text-white transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">View All Projects</span>
                <motion.div
                  className="absolute inset-0 bg-black"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};


export default Projects