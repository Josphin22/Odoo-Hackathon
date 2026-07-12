import gsap from 'gsap';

export const animateChart = (selector) => {
  gsap.fromTo(selector, 
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.6, ease: 'power1.out' }
  );
};
