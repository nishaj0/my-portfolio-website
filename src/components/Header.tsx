import { motion } from 'framer-motion'
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = isHomePage
    ? [
      { name: 'About', href: '#about', isHash: true },
      { name: 'Work', href: '#projects', isHash: true },
      { name: 'Contact', href: '#contact', isHash: true },
    ]
    : [
      { name: 'Home', href: '/', isHash: false },
      { name: 'About', href: '/#about', isHash: false },
      { name: 'Contact', href: '/#contact', isHash: false },
    ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-sm py-4' : 'bg-transparent py-6'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex justify-between items-center">
          <Link to="/">
            <motion.div
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Portfolio
            </motion.div>
          </Link>

          <nav className="hidden md:flex gap-8">
            {navLinks.map((link, index) => (
              link.isHash ? (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-lg hover:opacity-60 transition-opacity"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                >
                  {link.name}
                </motion.a>
              ) : (
                <Link key={link.name} to={link.href}>
                  <motion.div
                    className="text-lg hover:opacity-60 transition-opacity"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  >
                    {link.name}
                  </motion.div>
                </Link>
              )
            ))}
          </nav>

          <motion.button
            className="md:hidden w-8 h-8 flex flex-col justify-center gap-1.5"
            whileTap={{ scale: 0.9 }}
          >
            <span className="w-full h-0.5 bg-black"></span>
            <span className="w-full h-0.5 bg-black"></span>
            <span className="w-full h-0.5 bg-black"></span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header