'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const skillSections = [
  {
    title: 'Languages',
    skills: [
      { name: 'Go', icon: '/icons/go.svg' },
      { name: 'TypeScript', icon: '/icons/typescript.svg' },
      { name: 'JavaScript', icon: '/icons/javascript.svg' },
      { name: 'HTML5', icon: '/icons/html5.svg' },
      { name: 'CSS3', icon: '/icons/css3.svg' },
    ],
  },
  {
    title: 'Frameworks & Tools',
    skills: [
      { name: 'Gin', icon: '/icons/gin.svg' },
      { name: 'Express', icon: '/icons/express.svg' },
      { name: 'React', icon: '/icons/react.svg' },
      { name: 'Next.js', icon: '/icons/nextjs.svg' },
      { name: 'Node.js', icon: '/icons/nodejs.svg' },
      { name: 'Discord.JS', icon: '/icons/discordjs.svg' },
      { name: 'Tailwind', icon: '/icons/tailwind.svg' },
      { name: 'Git', icon: '/icons/git.svg' },
      { name: 'Postman', icon: '/icons/postman.svg' },
    ],
  },
  {
    title: 'Databases',
    skills: [
      { name: 'MySQL', icon: '/icons/mysql.svg' },
      { name: 'PostgreSQL', icon: '/icons/postgresql.svg' },
      { name: 'MongoDB', icon: '/icons/mongodb.svg' },
    ],
  },
  {
    title: 'Cloud & Deployment Platforms',
    skills: [
      { name: 'Azure', icon: '/icons/azure.svg' },
      { name: 'DigitalOcean', icon: '/icons/digitalocean.svg' },
      { name: 'Ubuntu', icon: '/icons/ubuntu.svg' },
      { name: 'Linux', icon: '/icons/linux.svg' },
      { name: 'Vercel', icon: '/icons/vercel.svg' },
      { name: 'Netlify', icon: '/icons/netlify.svg' },
      { name: 'Docker', icon: '/icons/docker.svg' },
      { name: 'Github', icon: '/icons/github.svg' },
      { name: 'Gitlab', icon: '/icons/gitlab.svg' },
    ],
  },
  {
    title: 'AI Tools & Platforms',
    skills: [
      { name: 'OpenAI API', icon: '/icons/openai.svg' },
      { name: 'Gemini API', icon: '/icons/gemini.svg' },
      { name: 'n8n', icon: '/icons/n8n.svg' },
      { name: 'Github Copilot', icon: '/icons/githubcopilot.svg' },
      { name: 'Lovable', icon: '/icons/lovable.svg' },
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotate: 5 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.6,
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  }),
};

export default function SkillsPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-32 overflow-hidden bg-white">
      {/* Rotating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 border border-black opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 border border-black opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            My <span className="text-outline">Skills</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">
            Technologies and tools I work with daily to build modern applications.
          </p>
        </motion.div>
      </div>
      
      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">

        {skillSections.map((section, sectionIndex) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
            className="mb-20"
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-8 text-black"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {section.title}
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ staggerChildren: 0.1 }}
            >
              {section.skills.map((skill, index) => (
                <motion.div
                  key={`${skill.name}-${index}`}
                  variants={cardVariants}
                  custom={index}
                  whileHover={{ 
                    rotate: [-1, 1, -1], 
                    y: -5,
                    transition: { duration: 0.3 }
                  }}
                  className="group"
                >
                  <div className="flex items-center justify-between p-3 border border-black bg-white hover:bg-black hover:text-white transition-all duration-300">
                    <div className="flex h-12 w-12 items-center justify-center border border-black bg-gray-50">
                      <Image 
                      src={skill.icon} 
                      alt={`${skill.name} icon`} 
                      width={32} 
                      height={32}
                      className="filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-wide">
                      {skill.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        ))}
      </div>
    </main>
  );
}
