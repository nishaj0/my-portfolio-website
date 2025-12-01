'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { projects } from '../../../data/projects';

type Project = typeof projects[0];

export default function ProjectContent({ project }: { project: Project }) {
  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const detailsRef = useRef(null);
  const linksRef = useRef(null);
  const moreProjectsRef = useRef(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [showFullColor, setShowFullColor] = useState(false);
  const [revealRadius, setRevealRadius] = useState(0);

  const headerInView = useInView(headerRef, { once: false, margin: "0px" });
  const imageInView = useInView(imageRef, { once: false, margin: "-100px" });
  const detailsInView = useInView(detailsRef, { once: false, margin: "-100px" });
  const linksInView = useInView(linksRef, { once: false, margin: "-100px" });
  const moreProjectsInView = useInView(moreProjectsRef, { once: false, margin: "-100px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
    
    // Show small circle immediately
    if (!isHovering) {
      setIsHovering(true);
      setRevealRadius(8); // Small circle following cursor
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    // Set initial position
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
    
    setIsHovering(true);
    setRevealRadius(8); // Start with small circle
    
    // After 500ms, expand to full color
    hoverTimeoutRef.current = setTimeout(() => {
      setShowFullColor(true);
      setRevealRadius(150);
    }, 500);
  };

  const handleMouseLeave = () => {
    // Clear timeout if leaving before 500ms
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setIsHovering(false);
    setShowFullColor(false);
    setRevealRadius(0);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-white">
      {/* Rotating decorative elements */}
      <motion.div
        className="absolute top-20 right-10 w-32 h-32 border border-black opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-24 h-24 border border-black opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30, rotateX: 10 }}
          animate={headerInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: 10 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          className="mb-20"
        >
          <Link href="/projects">
            <motion.div
              className="inline-flex items-center gap-2 mb-12 text-gray-600 hover:text-black transition-colors text-lg md:text-xl"
              whileHover={{ x: -5 }}
            >
              <span className="text-2xl">←</span>
              <span>Back to Projects</span>
            </motion.div>
          </Link>

          <h1 className="text-6xl md:text-8xl font-bold mb-8">
            {project.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
            {project.description}
          </p>
        </motion.div>

        {/* Project Image */}
        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, y: 100, rotateX: 20 }}
          animate={imageInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 100, rotateX: 20 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          className="mb-24 relative group"
        >
          <div 
            ref={imageContainerRef}
            className="border-2 border-black overflow-hidden aspect-video relative cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grayscale image - bottom layer */}
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              style={{ filter: 'grayscale(100%)' }}
              priority
            />
            
            {/* Colored image - top layer with circular reveal */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `circle(${revealRadius}% at ${mousePosition.x}% ${mousePosition.y}%)`,
                transition: showFullColor 
                  ? 'clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                  : 'clip-path 0.15s ease-out',
              }}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Project Details */}
        <div className="space-y-16 mb-24">
          {/* Description Section */}
          <motion.div
            ref={detailsRef}
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            animate={detailsInView ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 50, rotate: -5 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              About Project
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-12">
              {project.fullDescription}
            </p>

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">Technologies</h3>
              <div className="flex flex-wrap gap-4">
                {project.tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={detailsInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="px-6 py-3 border-2 border-black text-base md:text-lg font-semibold hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Links Section */}
          <motion.div
            ref={linksRef}
            initial={{ opacity: 0, y: 50, rotate: 5 }}
            animate={linksInView ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 50, rotate: 5 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Project Links
            </h2>
            <div className="space-y-6">
              {project.links.demo && (
                <motion.a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={linksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">Live Demo</h3>
                        <p className="text-base md:text-lg opacity-70">View the live project</p>
                      </div>
                      <span className="text-3xl md:text-4xl group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </motion.a>
              )}

              {project.links.github && (
                <motion.a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={linksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">GitHub</h3>
                        <p className="text-base md:text-lg opacity-70">View source code</p>
                      </div>
                      <span className="text-3xl md:text-4xl group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </motion.a>
              )}

              {project.links.video && (
                <motion.a
                  href={project.links.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={linksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">Video Demo</h3>
                        <p className="text-base md:text-lg opacity-70">Watch project walkthrough</p>
                      </div>
                      <span className="text-3xl md:text-4xl group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Navigation to other projects */}
        <motion.div
          ref={moreProjectsRef}
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={moreProjectsInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: 20 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          className="border-t-2 border-black pt-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            More Projects
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects
              .filter((p) => p.slug !== project.slug)
              .slice(0, 3)
              .map((otherProject, index) => (
                <Link key={otherProject.slug} href={`/projects/${otherProject.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={moreProjectsInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 group min-h-[200px] flex flex-col cursor-pointer"
                  >
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{otherProject.title}</h3>
                    <p className="text-base md:text-lg mb-6 opacity-70 flex-grow">{otherProject.description}</p>
                    <span className="text-base md:text-lg font-semibold group-hover:translate-x-2 inline-block transition-transform">
                      View Project →
                    </span>
                  </motion.div>
                </Link>
              ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
