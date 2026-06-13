'use strict';

/* ─────────────────────────────────────────────────────────────────────────────
   CASE STUDIES — Scroll Story Engine

   Architecture:
     • #case-studies is 500vh tall (5× viewport)
     • .cs-inner is position:sticky — stays pinned while page scrolls through 500vh
     • GSAP timeline (100 units) is bound to that 500vh via ScrollTrigger scrub
     • Every animation is tied to scroll position — scrub:1.5 adds cinematic lag
     • NO animations fire independently; everything is scroll-driven

   Timeline map (100 units = 500vh):
     0–33  : Case 1 full sequence (image established → number → title → info → story)
     28–43 : Transition Case 1 → Case 2
     40–68 : Case 2 full sequence
     63–78 : Transition Case 2 → Case 3
     75–100: Case 3 full sequence
   ───────────────────────────────────────────────────────────────────────────── */

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.getElementById('case-studies');
  if (!section) return;

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const q = (sel, ctx) => (ctx || section).querySelector(sel);
  const qa = (sel, ctx) => Array.from((ctx || section).querySelectorAll(sel));

  /* ── Establish initial states (all hidden; GSAP reveals via scroll) ─── */
  // Images
  gsap.set('.cs-img-1', { clipPath: 'inset(0 0% 0 0)', opacity: 0.6, filter: 'brightness(0.55) saturate(0.7)' });
  gsap.set('.cs-img-2', { clipPath: 'inset(0 100% 0 0)', opacity: 1, filter: 'brightness(0.55) saturate(0.7)' });
  gsap.set('.cs-img-3', { clipPath: 'inset(100% 0 0 0)', opacity: 1, filter: 'brightness(0.55) saturate(0.7)' });

  // Panels (all invisible)
  gsap.set(qa('.cs-panel'), { opacity: 0 });

  // Per-panel children
  ['1', '2', '3'].forEach(n => {
    const p = `.cs-panel-${n}`;
    gsap.set(`${p} .cs-num`,         { opacity: 0, x: -25 });
    gsap.set(`${p} .cs-title-line`,  { opacity: 0, y: 35, skewY: 2 });
    gsap.set(`${p} .cs-client-block`,{ opacity: 0, y: 20 });
    gsap.set(`${p} .cs-stat`,        { opacity: 0, y: 18 });
    gsap.set(`${p} .cs-line`,        { opacity: 0, y: 22 });
  });

  gsap.set('.cs-progress-fill', { width: '0%' });
  gsap.set('.cs-scroll-nudge',  { opacity: 1 });

  /* ── Master timeline ──────────────────────────────────────────────────── */
  const tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* ─ CASE 1 ──────────────────────────────────────────────────────────── */
  tl
    /* Image brightens and sharpens as story begins */
    .to('.cs-img-1',                 { opacity: 1, filter: 'brightness(0.7) saturate(0.9)', duration: 8 },                   0)
    /* Scroll nudge fades out early */
    .to('.cs-scroll-nudge',          { opacity: 0, duration: 5 },                                                             3)
    /* Panel base */
    .to('.cs-panel-1',               { opacity: 1, duration: 3 },                                                             2)
    /* Ghost number */
    .to('.cs-panel-1 .cs-num',       { opacity: 1, x: 0, duration: 4 },                                                      4)
    /* Title — each line scrolls in independently */
    .to('.cs-panel-1 .cs-title-line', { opacity: 1, y: 0, skewY: 0, stagger: 2.5, duration: 5 },                             7)
    /* Client block */
    .to('.cs-panel-1 .cs-client-block', { opacity: 1, y: 0, duration: 4 },                                                   13)
    /* Stats — staggered */
    .to('.cs-panel-1 .cs-stat',      { opacity: 1, y: 0, stagger: 1.8, duration: 3 },                                       16)
    /* Story lines — the narrative unfolds */
    .to('.cs-panel-1 .cs-line',      { opacity: 1, y: 0, stagger: 3.5, duration: 5 },                                       21)

  /* ─ TRANSITION 1 → 2 ───────────────────────────────────────────────── */
    /* Panel 1 exits up */
    .to('.cs-panel-1',               { opacity: 0, y: -45, duration: 7 },                                                    28)
    /* Image 1 dims and desaturates */
    .to('.cs-img-1',                 { opacity: 0, filter: 'brightness(0.2) saturate(0)', duration: 6 },                     29)
    /* Image 2 wipes in — right to left */
    .to('.cs-img-2',                 { clipPath: 'inset(0 0% 0 0)', duration: 10 },                                           32)
    .to('.cs-img-2',                 { filter: 'brightness(0.7) saturate(0.9)', duration: 6 },                                36)

  /* ─ CASE 2 ──────────────────────────────────────────────────────────── */
    .to('.cs-panel-2',               { opacity: 1, duration: 3 },                                                            40)
    .to('.cs-panel-2 .cs-num',       { opacity: 1, x: 0, duration: 4 },                                                     41)
    .to('.cs-panel-2 .cs-title-line', { opacity: 1, y: 0, skewY: 0, stagger: 2.5, duration: 5 },                            44)
    .to('.cs-panel-2 .cs-client-block', { opacity: 1, y: 0, duration: 4 },                                                  49)
    .to('.cs-panel-2 .cs-stat',      { opacity: 1, y: 0, stagger: 1.8, duration: 3 },                                       52)
    .to('.cs-panel-2 .cs-line',      { opacity: 1, y: 0, stagger: 3.5, duration: 5 },                                       56)

  /* ─ TRANSITION 2 → 3 ───────────────────────────────────────────────── */
    .to('.cs-panel-2',               { opacity: 0, y: -45, duration: 7 },                                                    63)
    .to('.cs-img-2',                 { opacity: 0, filter: 'brightness(0.2) saturate(0)', duration: 6 },                     64)
    /* Image 3 wipes in — vertical (top to bottom) for tonal variety */
    .to('.cs-img-3',                 { clipPath: 'inset(0% 0 0 0)', duration: 10 },                                           66)
    .to('.cs-img-3',                 { filter: 'brightness(0.7) saturate(0.9)', duration: 6 },                                70)

  /* ─ CASE 3 ──────────────────────────────────────────────────────────── */
    .to('.cs-panel-3',               { opacity: 1, duration: 3 },                                                            75)
    .to('.cs-panel-3 .cs-num',       { opacity: 1, x: 0, duration: 4 },                                                     76)
    .to('.cs-panel-3 .cs-title-line', { opacity: 1, y: 0, skewY: 0, stagger: 2.5, duration: 5 },                            79)
    .to('.cs-panel-3 .cs-client-block', { opacity: 1, y: 0, duration: 4 },                                                  84)
    .to('.cs-panel-3 .cs-stat',      { opacity: 1, y: 0, stagger: 1.8, duration: 3 },                                       87)
    .to('.cs-panel-3 .cs-line',      { opacity: 1, y: 0, stagger: 3.5, duration: 5 },                                       91)

  /* Progress bar fills linearly over the entire scroll */
    .to('.cs-progress-fill',         { width: '100%', duration: 100 },                                                        0);

  /* ── ScrollTrigger — binds timeline to scroll ─────────────────────── */
  ScrollTrigger.create({
    trigger:   '#case-studies',
    start:     'top top',
    end:       'bottom bottom',
    scrub:     1.5,        /* lag in seconds — cinematic feel, not robotic */
    animation: tl,

    onUpdate (self) {
      /* Dot nav + counter update */
      const p = self.progress;
      const idx = p >= 0.63 ? 2 : p >= 0.28 ? 1 : 0;
      const dots    = section.querySelectorAll('.cs-dot');
      const counter = section.querySelector('.cs-current');

      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
    }
  });

  /* ── Upgrade all .reveal elements to GSAP scrub ────────────────────── */
  /* Replaces IntersectionObserver. Each element's entrance is tied to   */
  /* its own scroll position — animation freezes when scrolling stops.   */
  gsap.utils.toArray('.reveal').forEach(el => {
    el.style.transition = 'none'; /* disable CSS transitions */
    el.style.opacity    = ''; /* clear initial CSS state — GSAP owns it */
    el.style.transform  = '';

    const delayMap = { 'reveal-delay-1': 40, 'reveal-delay-2': 80, 'reveal-delay-3': 120, 'reveal-delay-4': 160 };
    const delayPx  = Object.entries(delayMap).find(([cls]) => el.classList.contains(cls))?.[1] ?? 0;

    gsap.fromTo(el,
      { opacity: 0, y: 38 },
      {
        opacity: 1, y: 0, ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: `top+=${delayPx} 92%`,
          end:   `top+=${delayPx + 180} 50%`,
          scrub: 0.9,
        }
      }
    );
  });

})();
