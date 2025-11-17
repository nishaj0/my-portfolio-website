import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 0.5, 1], [-100, 0, 100]);

  const skills = [
    'Go', 'TypeScript', 'JavaScript',
    'Postgres', 'MySQL', 'Node.js', 'MongoDB',
    'Next.js',"React", "n8n"
  ];

  return (
    <section id="about" ref={ref} className="min-h-screen flex items-center py-20 relative overflow-hidden">
      {/* decorative background elements */}
      <motion.div
        className="absolute top-1/4 left-0 w-64 h-64 border border-black opacity-10"
        style={{ x }}
      />
      <motion.div
        className="absolute bottom-1/4 right-0 w-48 h-48 border border-black opacity-10"
        style={{ x: useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]) }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl font-bold mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            About
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 50 }}
            >
              <motion.p 
                className="text-xl md:text-2xl leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                I'm a software developer working as a full-stack dev, exploring new ideas and technologies to create meaningful things.
              </motion.p>
              <motion.p 
                className="text-lg md:text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Always aiming to learn something new and experiment with ideas that spark curiosity. The goal is to keep growing through small projects and meaningful challenges
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 50 }}
            >
              <h3 className="text-2xl font-bold mb-6">Skills & Technologies</h3>
              <div className="grid grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.6 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="border-2 border-black px-4 py-3 text-center hover:bg-black hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


export default About