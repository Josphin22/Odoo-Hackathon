import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import gsap from 'gsap';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const backdropRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // GSAP animate backdrop
      gsap.fromTo(backdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );

      // GSAP animate modal container
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 15 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.3, delay: 0.05, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  const handleClose = () => {
    // GSAP animate exit before closing
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: onClose
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Dialog */}
      <div 
        ref={modalRef}
        className={`w-full ${sizes[size]} glassmorphism dark:glassmorphism-dark rounded-2xl shadow-glass flex flex-col max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/45 dark:border-slate-800/45">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 font-sans">
            {title}
          </h3>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Viewport */}
        <div className="p-6 overflow-y-auto scrollbar-hidden">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('root')
  );
};

export default Modal;
