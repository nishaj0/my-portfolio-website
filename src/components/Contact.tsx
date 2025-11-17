import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 1.2]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/nishaj0' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/nishaj0/' },
    { name: 'Twitter', url: 'https://x.com/nishaj0' },
    { name: 'Email', url: 'mailto:njnishaj0@gmail.com' },
  ];

  return (
    <section id="contact" ref={ref} className="min-h-screen flex items-center py-20 relative overflow-hidden">
      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-20 right-20 w-40 h-40 border-2 border-black opacity-10"
        style={{ rotate, scale }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-32 h-32 border-2 border-black opacity-10"
        style={{ rotate: useTransform(scrollYProgress, [0, 1], [360, 0]) }}
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-12"
            initial={{ opacity: 0, y: 100 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 1, type: "spring", stiffness: 50 }}
          >
            <motion.span
              initial={{ display: 'inline-block', rotateY: 90 }}
              animate={isInView ? { rotateY: 0 } : { rotateY: 90 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Let's Work
            </motion.span>
            <br />
            <motion.span 
              className="text-outline"
              initial={{ display: 'inline-block', rotateY: -90 }}
              animate={isInView ? { rotateY: 0 } : { rotateY: -90 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Together
            </motion.span>
          </motion.h2>
          
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 50 }}
          >
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-gray-600"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Have a project in mind? Let's create something amazing together.
            </motion.p>
            
            <motion.a
              href="mailto:njnishaj0@gmail.com"
              className="inline-block text-3xl md:text-5xl font-bold border-b-4 border-black hover:text-gray-600 transition-colors duration-300 mb-16"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -100 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              njnishaj0@gmail.com
            </motion.a>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -180 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className="border-2 border-black px-6 py-4 text-center hover:bg-black hover:text-white transition-colors duration-300"
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};


export default Contact