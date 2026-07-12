import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const PageWrapper = ({ children, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP page entrance slide and fade in
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`flex-1 p-8 flex flex-col gap-6 overflow-y-auto ${className}`}
    >
      {children}
    </div>
  );
};

export default PageWrapper;
