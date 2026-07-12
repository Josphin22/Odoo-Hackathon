import gsap from 'gsap';

export const animateStaggeredCards = (selector) => {
  gsap.fromTo(selector, 
    { opacity: 0, y: 15, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
  );
};

export const animateCounter = (id, targetVal) => {
  const obj = { value: 0 };
  const element = document.getElementById(id);
  if (!element) return;
  
  gsap.to(obj, {
    value: targetVal,
    duration: 1.2,
    ease: 'power2.out',
    onUpdate: () => {
      element.innerText = Math.round(obj.value);
    }
  });
};
