import gsap from 'gsap';

export const animatePageIn = (element) => {
  if (!element) return;
  gsap.fromTo(element, 
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
  );
};
