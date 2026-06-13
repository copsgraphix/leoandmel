'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPERTY STORY — Three Pinned Scroll Narrative Engines

   All timelines use ease:'none' so animation progress == scroll progress.
   scrub:1.5 adds cinematic lag; nothing fires independently of scroll.

   Section heights → timeline units:
     Transformation  450vh → 100 units  (1 unit = 4.5vh)
     Property Map    400vh → 5 zones    (zone checkpoints, not full-scrub)
     Seasonal Evo    400vh → 100 units  (1 unit = 4vh)
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ════════════════════════════════════════════════════════════════════════
     1. TRANSFORMATION STORY
     ════════════════════════════════════════════════════════════════════════ */
  (function initTransformation() {
    const section = document.getElementById('transformation-story');
    if (!section) return;

    /* ── Initial states ─────────────────────────────────────────────────── */
    gsap.set('.ts-before', { filter: 'brightness(0.42) saturate(0.55)' });
    gsap.set('.ts-after',  { clipPath: 'inset(100% 0 0 0)', filter: 'brightness(0.68)' });
    gsap.set('.ts-sweep',  { top: '101%', opacity: 1 });
    gsap.set('.ts-grid',   { opacity: 0 });
    gsap.set('.ts-zones',  { opacity: 0 });

    /* All four stages start invisible */
    gsap.set(['.ts-s1','.ts-s2','.ts-s3','.ts-s4'], { opacity: 0 });
    gsap.set('.ts-results',                           { opacity: 0 });
    gsap.set('.ts-result-value', { opacity: 0, y: 28 });

    /* ── Master timeline (100 units scrubbed to 450vh) ───────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* ── STAGE 1: Before — Establish the property ─────────────────────── */
    tl
      .to('.ts-before',  { filter: 'brightness(0.55) saturate(0.7)', duration: 6 }, 0)
      .to('.ts-s1',      { opacity: 1, duration: 5 },                               3)

    /* ── STAGE 2: Assessment — Grid overlay appears ───────────────────── */
      .to('.ts-s1',      { opacity: 0, duration: 4 },                              16)
      .to('.ts-grid',    { opacity: 1, duration: 6 },                              18)
      .to('.ts-zones',   { opacity: 1, duration: 5 },                              21)
      .to('.ts-s2',      { opacity: 1, duration: 5 },                              21)

    /* ── STAGE 3: Transformation — Sweep reveals the after image ─────── */
    /* Grid + stage 2 exit */
      .to(['.ts-grid','.ts-zones','.ts-s2'], { opacity: 0, duration: 5 },         28)
      .to('.ts-s3',      { opacity: 1, duration: 5 },                              31)
    /* The sweep: 30 units drives clip-path from fully hidden to fully revealed */
      .to('.ts-sweep',   { top: '-1%', duration: 32 },                             27)
      .to('.ts-after',   { clipPath: 'inset(0% 0 0 0)', duration: 32 },            27)
    /* After image brightens as it reveals */
      .to('.ts-after',   { filter: 'brightness(0.72)', duration: 15 },             44)

    /* ── STAGE 4: After — Result and company proof ────────────────────── */
      .to('.ts-s3',      { opacity: 0, duration: 4 },                              60)
      .to('.ts-sweep',   { opacity: 0, duration: 5 },                              59)
      .to('.ts-s4',      { opacity: 1, duration: 5 },                              63)
      .to('.ts-results', { opacity: 1, duration: 4 },                              67)
      .to('.ts-result-value', { opacity: 1, y: 0, stagger: 4, duration: 5 },       69)

    /* ── Progress fill ───────────────────────────────────────────────── */
      .to('.ts-progress-fill', { width: '100%', duration: 100 },                    0);

    ScrollTrigger.create({
      trigger: '#transformation-story',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      animation: tl,
    });
  })();


  /* ════════════════════════════════════════════════════════════════════════
     2. PROPERTY MAP — Zone-by-zone scroll activation
        Rather than a single scrub timeline, each zone activates via its
        own ScrollTrigger checkpoint so transitions play at natural speed.
     ════════════════════════════════════════════════════════════════════════ */
  (function initPropertyMap() {
    const section = document.getElementById('property-map');
    if (!section) return;

    /* Initial state — map fades in, all zones dim, all descriptions hidden */
    gsap.set('.pm-svg-wrap', { opacity: 0, y: 30 });
    gsap.set('.pm-desc',     { opacity: 0, x: 40 });

    /* Fade map in as section enters */
    ScrollTrigger.create({
      trigger: section,
      start:   'top 60%',
      onEnter: () => gsap.to('.pm-svg-wrap', { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }),
    });

    /* Zone data — the order they activate and their description panel IDs */
    const zones = [
      { name: 'turf',      descId: '.pm-desc-turf',      startPct: 0.08, endPct: 0.30 },
      { name: 'trees',     descId: '.pm-desc-trees',     startPct: 0.28, endPct: 0.50 },
      { name: 'hardscape', descId: '.pm-desc-hardscape', startPct: 0.48, endPct: 0.68 },
      { name: 'beds',      descId: '.pm-desc-beds',      startPct: 0.66, endPct: 0.84 },
      { name: 'drainage',  descId: '.pm-desc-drainage',  startPct: 0.82, endPct: 0.96 },
    ];

    /* Helpers */
    function activateZone(name) {
      /* Deactivate all zones */
      document.querySelectorAll('.pm-zone').forEach(el => {
        el.classList.remove('z-active', 'z-system');
      });
      /* Activate target zone elements */
      document.querySelectorAll(`.pm-zone[data-zone="${name}"]`).forEach(el => {
        el.classList.add('z-active');
      });
    }

    function showDesc(descId) {
      /* Hide all descriptions */
      gsap.to('.pm-desc', { opacity: 0, x: 40, duration: 0.35, ease: 'power2.in' });
      /* Show target after brief delay */
      setTimeout(() => {
        const el = document.querySelector(descId);
        if (el) gsap.to(el, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' });
      }, 200);
    }

    function clearZones() {
      document.querySelectorAll('.pm-zone').forEach(el => el.classList.remove('z-active', 'z-system'));
      gsap.to('.pm-desc', { opacity: 0, x: 40, duration: 0.35, ease: 'power2.in' });
    }

    function systemState() {
      document.querySelectorAll('.pm-zone').forEach(el => el.classList.add('z-system'));
    }

    /* Build one ScrollTrigger per zone checkpoint */
    zones.forEach(zone => {
      const sectionHeight = section.offsetHeight;
      const startOffset   = zone.startPct * sectionHeight;
      const endOffset     = zone.endPct   * sectionHeight;

      ScrollTrigger.create({
        trigger: section,
        start:   `top+=${startOffset} top`,
        end:     `top+=${endOffset} top`,
        onEnter:     () => { activateZone(zone.name); showDesc(zone.descId); },
        onLeave:     () => clearZones(),
        onEnterBack: () => { activateZone(zone.name); showDesc(zone.descId); },
        onLeaveBack: () => clearZones(),
      });
    });

    /* Final "full system" state */
    ScrollTrigger.create({
      trigger: section,
      start:   'top+=94% top',
      end:     'bottom bottom',
      onEnter:     () => { clearZones(); systemState(); showDesc('.pm-desc-system'); },
      onLeave:     () => clearZones(),
      onEnterBack: () => { clearZones(); systemState(); showDesc('.pm-desc-system'); },
      onLeaveBack: () => clearZones(),
    });

    /* Progress fill */
    gsap.to('.pm-progress-fill', {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   0.5,
      }
    });
  })();


  /* ════════════════════════════════════════════════════════════════════════
     3. SEASONAL EVOLUTION
     ════════════════════════════════════════════════════════════════════════ */
  (function initSeasons() {
    const section = document.getElementById('seasonal-evolution');
    if (!section) return;

    const SEASONS = ['spring', 'summer', 'fall', 'winter'];

    /* ── Initial states ─────────────────────────────────────────────────── */
    /* Spring starts visible, others hidden */
    gsap.set('.se-summer, .se-fall, .se-winter', { opacity: 0 });
    gsap.set('.se-spring',  { opacity: 1, filter: 'brightness(0.6) saturate(1.05)' });

    gsap.set('.se-name-summer, .se-name-fall, .se-name-winter', { opacity: 0, y: 20 });
    gsap.set('.se-name-spring',   { opacity: 1, y: 0 });

    gsap.set('.se-summer-block, .se-fall-block, .se-winter-block', { opacity: 0, y: 30 });
    gsap.set('.se-spring-block',  { opacity: 1, y: 0 });

    gsap.set('.se-summer-svc, .se-fall-svc, .se-winter-svc', { opacity: 0 });
    gsap.set('.se-spring-svc',    { opacity: 1 });

    /* ── Indicator pips ───────────────────────────────────────────────── */
    const pips = document.querySelectorAll('.se-ind-pip');
    function setPip(idx) {
      pips.forEach((p, i) => p.classList.toggle('active', i === idx));
    }
    setPip(0); /* spring default */

    /* ── Single scrubbed timeline (100 units → 400vh) ─────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* ─ SPRING (0-25) active, held ───────────────────────────────────── */

    /* ─ SPRING → SUMMER CROSSFADE (22-32) ────────────────────────────── */
    tl
      .to('.se-spring-block',  { opacity: 0, y: -20, duration: 8 }, 22)
      .to('.se-spring-svc',    { opacity: 0, duration: 6 },          23)
      .to('.se-name-spring',   { opacity: 0, y: -15, duration: 8 }, 22)
      .to('.se-spring',        { opacity: 0, duration: 10 },         21)

      .to('.se-summer',        { opacity: 1, filter: 'brightness(0.65) saturate(1.1)', duration: 10 }, 22)
      .to('.se-name-summer',   { opacity: 1, y: 0, duration: 8 },    25)
      .to('.se-summer-block',  { opacity: 1, y: 0, duration: 7 },    27)
      .to('.se-summer-svc',    { opacity: 1, duration: 6 },          29)

    /* ─ SUMMER → FALL CROSSFADE (48-58) ──────────────────────────────── */
      .to('.se-summer-block',  { opacity: 0, y: -20, duration: 7 }, 48)
      .to('.se-summer-svc',    { opacity: 0, duration: 6 },          49)
      .to('.se-name-summer',   { opacity: 0, y: -15, duration: 8 }, 48)
      .to('.se-summer',        { opacity: 0, duration: 10 },         47)

      .to('.se-fall',          { opacity: 1, filter: 'brightness(0.6) saturate(0.95)', duration: 10 }, 48)
      .to('.se-name-fall',     { opacity: 1, y: 0, duration: 8 },    51)
      .to('.se-fall-block',    { opacity: 1, y: 0, duration: 7 },    53)
      .to('.se-fall-svc',      { opacity: 1, duration: 6 },          55)

    /* ─ FALL → WINTER CROSSFADE (73-83) ──────────────────────────────── */
      .to('.se-fall-block',    { opacity: 0, y: -20, duration: 7 }, 73)
      .to('.se-fall-svc',      { opacity: 0, duration: 6 },          74)
      .to('.se-name-fall',     { opacity: 0, y: -15, duration: 8 }, 73)
      .to('.se-fall',          { opacity: 0, duration: 10 },         72)

      .to('.se-winter',        { opacity: 1, filter: 'brightness(0.52) saturate(0.65)', duration: 10 }, 73)
      .to('.se-name-winter',   { opacity: 1, y: 0, duration: 8 },    76)
      .to('.se-winter-block',  { opacity: 1, y: 0, duration: 7 },    78)
      .to('.se-winter-svc',    { opacity: 1, duration: 6 },          80)

    /* ─ Progress ──────────────────────────────────────────────────────── */
      .to('.se-progress-fill', { width: '100%', duration: 100 },      0);

    ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      animation: tl,

      onUpdate(self) {
        const p = self.progress;
        const idx = p >= 0.73 ? 3 : p >= 0.48 ? 2 : p >= 0.22 ? 1 : 0;
        setPip(idx);
      }
    });
  })();

})();
