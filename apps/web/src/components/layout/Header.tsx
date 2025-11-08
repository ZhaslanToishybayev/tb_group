'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Header() {
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Navigation links
  const navLinks = [
    { href: '#hero', label: 'Home', id: 'hero' },
    { href: '#services', label: 'Services', id: 'services' },
    { href: '#case-studies', label: 'Case Studies', id: 'case-studies' },
    { href: '#testimonials', label: 'Testimonials', id: 'testimonials' },
    { href: '#contact', label: 'Contact', id: 'contact' },
  ];

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Smooth scroll to section
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Intersection observer hooks for each section
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });
  const { ref: servicesRef, inView: servicesInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });
  const { ref: caseStudiesRef, inView: caseStudiesInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });
  const { ref: contactRef, inView: contactInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Update active section based on scroll position
  useEffect(() => {
    if (heroInView) setActiveSection('hero');
    else if (servicesInView) setActiveSection('services');
    else if (caseStudiesInView) setActiveSection('case-studies');
    else if (testimonialsInView) setActiveSection('testimonials');
    else if (contactInView) setActiveSection('contact');
  }, [heroInView, servicesInView, caseStudiesInView, testimonialsInView, contactInView]);

  return (
    <motion.header
      className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-neon-cyan bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            TB Group
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`transition-colors duration-300 relative group ${
                  activeSection === link.id
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -2 }}
              >
                {link.label}
                {/* Active indicator or animated underline on hover */}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-neon-cyan transition-all duration-300 ${
                    activeSection === link.id
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />
              </motion.a>
            ))}
          </div>

          {/* CTA Button - Desktop */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <a
              href="#contact"
              className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-neon-cyan text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
            >
              Get Started
            </a>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white p-2"
            onClick={toggleMobileMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Slide-Out Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 h-full w-80 max-w-[85%] bg-slate-950/98 backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-neon-cyan bg-clip-text text-transparent">
                  Menu
                </span>
                <motion.button
                  onClick={toggleMobileMenu}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white p-2"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="p-6">
                <div className="space-y-6">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                        handleLinkClick();
                      }}
                      className={`block text-xl transition-colors duration-300 ${
                        activeSection === link.id
                          ? 'text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ x: 10 }}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                {/* CTA Button - Mobile */}
                <motion.a
                  href="#contact"
                  onClick={handleLinkClick}
                  className="mt-8 block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-500 to-neon-cyan text-white font-medium rounded-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  Get Started
                </motion.a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
