'use strict';

/* ─────────────────────────────────────────────────────────────────────────────
   business.js — page-wide scroll animation controller

   Philosophy: every animation on the page is scroll-driven.
   Nothing fires at time=0 or instantly on viewport entry.
   IntersectionObserver is REPLACED with GSAP ScrollTrigger scrub.
   ───────────────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Page entrance ────────────────────────────────────────────────────── */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    setTimeout(() => { document.body.style.opacity = '1'; }, 60);
  });

  /* ── Sticky nav ───────────────────────────────────────────────────────── */
  const nav = document.getElementById('site-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── Mobile nav ───────────────────────────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open);
      navLinks.style.cssText = open
        ? 'display:flex;flex-direction:column;position:fixed;top:65px;left:0;right:0;background:rgba(9,42,0,0.97);padding:2rem 5vw;gap:1.5rem;z-index:99;'
        : '';
    });
  }

  /* ── Smooth anchor scroll ─────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav ? nav.offsetHeight + 20 : 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      if (navLinks && navLinks.classList.contains('nav-open')) {
        navLinks.classList.remove('nav-open');
        navLinks.removeAttribute('style');
      }
    });
  });

  /* ── Hero parallax ────────────────────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
      }
    }, { passive: true });
  }

  /* ── Wait for GSAP, then wire scroll animations ───────────────────────── */
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Strip CSS-transition-based reveals — GSAP now owns all opacity/y */
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.transition = 'none';
    el.style.opacity    = '';
    el.style.transform  = '';
  });

  /* ── Section-scoped reveal groups ──────────────────────────────────────
     For each section, we collect its .reveal children and build a single
     timeline scrubbed against that section's scroll window.
     Stagger groups (reveal-delay-*) get offset start positions within
     the same trigger so they reveal sequentially with scroll.           */

  document.querySelectorAll('section:not(#case-studies)').forEach(section => {
    const reveals = Array.from(section.querySelectorAll('.reveal'));
    if (!reveals.length) return;

    reveals.forEach(el => {
      const delayMap = { 'reveal-delay-1': 50, 'reveal-delay-2': 100, 'reveal-delay-3': 155, 'reveal-delay-4': 210 };
      const offsetPx = Object.entries(delayMap).find(([cls]) => el.classList.contains(cls))?.[1] ?? 0;

      gsap.fromTo(el,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: `top+=${offsetPx} 93%`,
            end:   `top+=${offsetPx + 160} 52%`,
            scrub: 0.9,
          }
        }
      );
    });
  });

  /* ── Hero content — scrub in as user scrolls down from top ─────────── */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    /* Children of hero-content stagger in as page loads / first scroll */
    gsap.fromTo('.hero-eyebrow',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 1.0, delay: 0.4 }
    );
    gsap.fromTo('#hero-heading',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 1.2, delay: 0.7 }
    );
    gsap.fromTo('.hero-sub',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 1.0, delay: 1.0 }
    );
    gsap.fromTo('.hero-actions',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, ease: 'power2.out', duration: 0.9, delay: 1.3 }
    );
  }

  /* ── Service cards — stagger in together when grid enters viewport ─── */
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length) {
    gsap.fromTo(serviceCards,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        ease: 'none',
        stagger: { each: 0.015, from: 'start' },
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 88%',
          end:   'top 20%',
          scrub: 1,
        }
      }
    );
  }

  /* ── Season panels — slide in from bottom ────────────────────────────── */
  const seasonPanels = document.querySelectorAll('.season-panel');
  if (seasonPanels.length) {
    gsap.fromTo(seasonPanels,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0,
        ease: 'none',
        stagger: { each: 0.03, from: 'start' },
        scrollTrigger: {
          trigger: '.seasons-grid',
          start: 'top 90%',
          end:   'top 30%',
          scrub: 1,
        }
      }
    );
  }

  /* ── Portfolio items — cascade in ───────────────────────────────────── */
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  if (portfolioItems.length) {
    gsap.fromTo(portfolioItems,
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1, scale: 1,
        ease: 'none',
        stagger: { each: 0.025, from: 'start' },
        scrollTrigger: {
          trigger: '.portfolio-grid',
          start: 'top 88%',
          end:   'top 25%',
          scrub: 1,
        }
      }
    );
  }

  /* ── About stats — scrub in ──────────────────────────────────────────── */
  const statNums = document.querySelectorAll('[data-count]');
  if (statNums.length) {
    function animateCounter(el, end, duration = 1800) {
      let start = 0;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * end) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const end = parseInt(entry.target.dataset.count, 10);
          if (!isNaN(end)) animateCounter(entry.target, end);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => counterObs.observe(el));
  }

  /* ── Before/After slider ─────────────────────────────────────────────── */
  const baContainer = document.querySelector('.before-after-container');
  if (baContainer) {
    const baAfter  = baContainer.querySelector('.ba-after');
    const baHandle = baContainer.querySelector('.ba-handle');
    let dragging = false;

    function setSliderPos(clientX) {
      const rect = baContainer.getBoundingClientRect();
      let pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
      baAfter.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      baHandle.style.left    = `${pct}%`;
    }

    baContainer.addEventListener('mousedown',  (e) => { dragging = true; setSliderPos(e.clientX); });
    window.addEventListener('mousemove',        (e) => { if (dragging) setSliderPos(e.clientX); });
    window.addEventListener('mouseup',          ()  => { dragging = false; });
    baContainer.addEventListener('touchstart',  (e) => { dragging = true; setSliderPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove',        (e) => { if (dragging) setSliderPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',         ()  => { dragging = false; });
  }

  /* ── Contact form ────────────────────────────────────────────────────── */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#5a8a38';
      btn.disabled = true;
    });
  }

});
