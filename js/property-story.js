'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPERTY STORY — Three Cinematic Engines

   1. Transformation Engine  — 350vh, zone-by-zone property restoration
   2. Property Map           — 200vh pinned, hover-interactive aerial zones
   3. Seasonal Evolution     — 400vh, one landscape morphing through seasons

   All scrub timelines use ease:'none' — animation progress === scroll progress.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);


  /* ════════════════════════════════════════════════════════════════════════
     1. TRANSFORMATION ENGINE
     The same neglected property image sits dark and dead.
     As the user scrolls, the maintained photo reveals through zone-shaped
     clip-paths — like restoration visually replacing each neglected area.
     Stage order matches a real restoration sequence.
     ════════════════════════════════════════════════════════════════════════ */
  (function initTransformationEngine() {
    const section = document.getElementById('transformation-story');
    if (!section) return;

    /* Restoration stages — same order a real crew would tackle them */
    const SYSTEMS = [
      { id: 'turf',      label: 'Grass Cut',        start: 8,  peak: 22, exit: 84 },
      { id: 'trees',     label: 'Shrubs Trimmed',   start: 24, peak: 36, exit: 84 },
      { id: 'beds',      label: 'Beds Installed',   start: 38, peak: 50, exit: 84 },
      { id: 'drainage',  label: 'Drainage Active',  start: 52, peak: 63, exit: 84 },
      { id: 'hardscape', label: 'Hardscape Clean',  start: 65, peak: 75, exit: 84 },
    ];

    /* ── Initial states ────────────────────────────────────────────────── */
    /* before: already dark via CSS filter */
    gsap.set('.te-after',          { clipPath: 'inset(100% 0 0 0)' });
    gsap.set('.te-complete-msg',   { opacity: 0 });
    gsap.set('.te-active-display', { opacity: 0 });

    /* All zone reveals + outlines start invisible */
    SYSTEMS.forEach(sys => {
      gsap.set(`#te-reveal-${sys.id}`,  { opacity: 0 });
      gsap.set(`#te-outline-${sys.id}`, { opacity: 0 });
    });

    /* ── Master timeline (100 units → 350vh of scroll) ─────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* Slight colour warm-up during establish phase */
    tl.to('.te-before', { filter: 'brightness(0.48) saturate(0.28) sepia(0.18)', duration: 8 }, 0);

    SYSTEMS.forEach(sys => {
      /* Reveal the maintained photo through the zone's clip-path */
      tl.to(`#te-reveal-${sys.id}`,  { opacity: 1, duration: sys.peak - sys.start },         sys.start);
      tl.to(`#te-outline-${sys.id}`, { opacity: 1, duration: (sys.peak - sys.start) * 0.6 }, sys.start);
      /* Zone fades at grand-reveal phase */
      tl.to(`#te-reveal-${sys.id}`,  { opacity: 0, duration: 5 }, sys.exit);
      tl.to(`#te-outline-${sys.id}`, { opacity: 0, duration: 4 }, sys.exit);
    });

    /* Grand reveal — full maintained photo wipes up */
    tl
      .to('.te-before',        { opacity: 0, filter: 'brightness(0.2) saturate(0)', duration: 7 }, 82)
      .to('.te-active-display',{ opacity: 0, duration: 4 },                                        80)
      .to('.te-after',         { clipPath: 'inset(0% 0 0 0)', duration: 12, ease: 'power1.inOut' }, 85)
      .to('.te-complete-msg',  { opacity: 1, duration: 7 },                                        93)
      .to('.te-progress-fill', { width: '100%', duration: 100 },                                    0);

    /* ── ScrollTrigger ─────────────────────────────────────────────────── */
    const adSystem  = section.querySelector('.te-ad-system');
    const adDisplay = section.querySelector('.te-active-display');

    let lastSysIdx = -2;
    let lastLabel  = '';

    ScrollTrigger.create({
      trigger: '#transformation-story',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      animation: tl,

      onUpdate (self) {
        const p = self.progress * 100;

        /* Which system is currently active? */
        let activeSysIdx = -1;
        SYSTEMS.forEach((sys, i) => {
          if (p >= sys.start && p < sys.exit) activeSysIdx = i;
        });

        if (activeSysIdx === lastSysIdx) return;
        lastSysIdx = activeSysIdx;

        /* Update tracker dots */
        SYSTEMS.forEach((sys, i) => {
          const item = section.querySelector(`.te-tracker-item[data-system="${sys.id}"]`);
          if (!item) return;
          const passed  = p >= sys.peak;
          const current = i === activeSysIdx;
          item.classList.toggle('done',   passed && !current);
          item.classList.toggle('active', current);
        });

        /* Show/hide + update stage name */
        if (p < 8 || p >= 82) {
          gsap.to(adDisplay, { opacity: 0, duration: 0.35 });
        } else if (activeSysIdx >= 0) {
          const label = SYSTEMS[activeSysIdx].label;
          gsap.to(adDisplay, { opacity: 1, duration: 0.4 });
          if (label !== lastLabel && adSystem) {
            lastLabel = label;
            gsap.to(adSystem, {
              opacity: 0, duration: 0.14,
              onComplete () {
                adSystem.textContent = label;
                gsap.to(adSystem, { opacity: 1, duration: 0.22 });
              }
            });
          }
        }
      }
    });
  })();


  /* ════════════════════════════════════════════════════════════════════════
     2. PROPERTY MAP — Hover-interactive aerial zones
     The office park photo fills the screen.
     SVG zones sit invisibly on top.
     Hover → zone highlights brilliantly, everything else dims,
     info panel slides in from bottom.
     ════════════════════════════════════════════════════════════════════════ */
  (function initPropertyMap() {
    const section = document.getElementById('property-map');
    if (!section) return;

    const ZONES = {
      turf: {
        label: 'Turf & Lawn',
        swatch: 'linear-gradient(135deg,#5a8a38,#7ab858)',
        desc: 'Precision mowing, fertilization, aeration and drought management. The foundation of every first impression.',
        services: ['Commercial Mowing', 'Fertilization', 'Aeration', 'Drought Control'],
      },
      trees: {
        label: 'Trees & Canopy',
        swatch: 'linear-gradient(135deg,#2d5a28,#4a8040)',
        desc: 'Structural pruning, storm-risk reduction and canopy health. Mature trees managed as assets, not hazards.',
        services: ['Structural Pruning', 'Canopy Health', 'Storm Assessment', 'Stump Removal'],
      },
      hardscape: {
        label: 'Hardscape & Access',
        swatch: 'linear-gradient(135deg,#b8943c,#d4aa50)',
        desc: 'Pressure-washed entries, edged curbs, salt-cleared walkways. Every surface your clients physically touch.',
        services: ['Pressure Washing', 'Edging & Curbs', 'Salt Removal', 'Surface Inspection'],
      },
      beds: {
        label: 'Landscape Beds',
        swatch: 'linear-gradient(135deg,#9a7430,#c4963e)',
        desc: 'Seasonal color, annual mulch, weed control and perennial management. The signature of an institution that cares.',
        services: ['Seasonal Color', 'Mulch Install', 'Weed Control', 'Bed Edging'],
      },
      drainage: {
        label: 'Drainage & Infrastructure',
        swatch: 'linear-gradient(135deg,#2a6a9a,#4a8aba)',
        desc: 'Storm drain maintenance, grade correction and 24-hour storm response. Managed before flooding becomes damage.',
        services: ['Catch Basins', 'Grade Correction', 'French Drain', '24hr Response'],
      },
    };

    const inner     = section.querySelector('.pm-inner');
    const infoPanel = section.querySelector('.pm-info-panel');
    const ipSwatch  = section.querySelector('.pm-ip-swatch');
    const ipName    = section.querySelector('.pm-ip-name');
    const ipDesc    = section.querySelector('.pm-ip-desc');
    const ipSvcs    = section.querySelector('.pm-ip-services');
    const hint      = section.querySelector('.pm-hint');

    let active = null;

    function activateZone(name) {
      if (active === name) return;
      active = name;
      const data = ZONES[name];
      if (!data) return;

      inner.classList.add('zone-active');
      section.querySelectorAll('.pm-zone').forEach(g => g.classList.remove('pm-active'));
      const target = section.querySelector(`.pm-zone[data-zone="${name}"]`);
      if (target) target.classList.add('pm-active');

      if (ipSwatch)  ipSwatch.style.background = data.swatch;
      if (ipName)    ipName.textContent  = data.label;
      if (ipDesc)    ipDesc.textContent  = data.desc;
      if (ipSvcs)    ipSvcs.innerHTML    = data.services.map(s => `<div class="pm-ip-tag">${s}</div>`).join('');
      if (infoPanel) infoPanel.classList.add('visible');
      if (hint)      hint.classList.add('hidden');
    }

    function clearZones() {
      active = null;
      inner.classList.remove('zone-active');
      section.querySelectorAll('.pm-zone').forEach(g => g.classList.remove('pm-active'));
      if (infoPanel) infoPanel.classList.remove('visible');
      if (hint)      hint.classList.remove('hidden');
    }

    section.querySelectorAll('.pm-zone').forEach(g => {
      const name = g.dataset.zone;
      g.addEventListener('mouseenter', () => activateZone(name));
      g.addEventListener('mouseleave', clearZones);
      g.addEventListener('focus',      () => activateZone(name));
      g.addEventListener('blur',       clearZones);
    });

    /* Fade section in on scroll arrival */
    gsap.fromTo(section, { opacity: 0 }, {
      opacity: 1, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 85%', once: true }
    });
  })();


  /* ════════════════════════════════════════════════════════════════════════
     3. SEASONAL EVOLUTION — One landscape, four seasons
     No panels. No cards. Just the property changing.
     Season name typography is the only foreground text.
     ════════════════════════════════════════════════════════════════════════ */
  (function initSeasons() {
    const section = document.getElementById('seasonal-evolution');
    if (!section) return;

    const pips = section.querySelectorAll('.se-ind-pip');
    function setPip(idx) { pips.forEach((p, i) => p.classList.toggle('active', i === idx)); }
    setPip(0);

    /* ── Initial states ────────────────────────────────────────────────── */
    gsap.set('.se-summer, .se-fall, .se-winter', { opacity: 0 });
    gsap.set('.se-spring', { opacity: 1, filter: 'brightness(0.65) saturate(1.08)' });
    gsap.set('.se-name-summer, .se-name-fall, .se-name-winter', { opacity: 0, y: 35 });
    gsap.set('.se-name-spring', { opacity: 1, y: 0 });

    /* ── Timeline (100 units → 400vh) ──────────────────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* Spring → Summer (t: 18-32) */
    tl
      .to('.se-spring',      { opacity: 0, duration: 14 },                                   18)
      .to('.se-name-spring', { opacity: 0, y: -30, duration: 12 },                           18)
      .to('.se-summer',      { opacity: 1, filter: 'brightness(0.72) saturate(1.12)', duration: 14 }, 19)
      .to('.se-name-summer', { opacity: 1, y: 0,   duration: 11 },                           22)

    /* Summer → Fall (t: 46-60) */
      .to('.se-summer',      { opacity: 0, duration: 14 },                                   46)
      .to('.se-name-summer', { opacity: 0, y: -30, duration: 12 },                           46)
      .to('.se-fall',        { opacity: 1, filter: 'brightness(0.62) saturate(0.92)', duration: 14 }, 47)
      .to('.se-name-fall',   { opacity: 1, y: 0,   duration: 11 },                           50)

    /* Fall → Winter (t: 73-87) */
      .to('.se-fall',        { opacity: 0, duration: 14 },                                   73)
      .to('.se-name-fall',   { opacity: 0, y: -30, duration: 12 },                           73)
      .to('.se-winter',      { opacity: 1, filter: 'brightness(0.48) saturate(0.58)', duration: 14 }, 74)
      .to('.se-name-winter', { opacity: 1, y: 0,   duration: 11 },                           77)

    /* Progress */
      .to('.se-progress-fill', { width: '100%', duration: 100 }, 0);

    ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      animation: tl,
      onUpdate (self) {
        const p = self.progress;
        setPip(p >= 0.73 ? 3 : p >= 0.46 ? 2 : p >= 0.18 ? 1 : 0);
      }
    });
  })();

})();
