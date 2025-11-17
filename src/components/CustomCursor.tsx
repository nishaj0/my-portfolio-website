'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 500, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);
  return (
    <>
      {/* main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-10px',
          translateY: '-10px',
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
        }}
        transition={{
          scale: {
            type: 'spring',
            stiffness: 500,
            damping: 28,
          },
        }}
      >
        <div className="relative">
          <div className="w-5 h-5 bg-black rounded-full" />
          <div className="absolute inset-0 w-5 h-5 bg-black rounded-full blur-md opacity-50" />
        </div>
      </motion.div>

      {/* Outer ring with animation */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          x: useSpring(cursorX, { damping: 15, stiffness: 150, mass: 0.1 }),
          y: useSpring(cursorY, { damping: 15, stiffness: 150, mass: 0.1 }),
          translateX: '-20px',
          translateY: '-20px',
        }}
        animate={{
          scale: isClicking ? 0.7 : isHovering ? 2 : 1,
          rotate: isHovering ? 90 : 0,
        }}
        transition={{
          scale: {
            type: 'spring',
            stiffness: 150,
            damping: 15,
          },
          rotate: {
            type: 'spring',
            stiffness: 150,
            damping: 15,
          },
        }}
      >
        <div className="w-10 h-10 border-2 border-black rounded-full" />
      </motion.div>

      {/* Additional shadow decorative ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          x: useSpring(cursorX, { damping: 20, stiffness: 100 }),
          y: useSpring(cursorY, { damping: 20, stiffness: 100 }),
          translateX: '-25px',
          translateY: '-25px',
        }}
        animate={{
          scale: isHovering ? 1.5 : 0.8,
          opacity: isHovering ? 1 : 0.3,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
      >
        <div className="w-12 h-12 border border-black rounded-full opacity-50" />
      </motion.div>
    </>
  );
};

export default CustomCursor