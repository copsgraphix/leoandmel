'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPERTY STORY — Three Cinematic Engines

   1. Transformation Engine  — 600vh scrub, 5 zone SVG overlays
   2. Property Map           — hover-interactive aerial SVG
   3. Seasonal Evolution     — 400vh image morph, no text panels
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);


  /* ════════════════════════════════════════════════════════════════════════
     1. TRANSFORMATION ENGINE
     ════════════════════════════════════════════════════════════════════════ */
  (function initTransformationEngine() {
    const section = document.getElementById('transformation-story');
    if (!section) return;

    /* System definitions — start/peak/exit are timeline units (0-100) */
    const SYSTEMS = [
      { id: 'turf',      label: 'Turf & Lawn',      start: 8,  peak: 22, exit: 82 },
      { id: 'drainage',  label: 'Drainage',          start: 26, peak: 38, exit: 82 },
      { id: 'beds',      label: 'Landscape Beds',    start: 42, peak: 52, exit: 82 },
      { id: 'trees',     label: 'Trees & Canopy',    start: 56, peak: 65, exit: 82 },
      { id: 'hardscape', label: 'Hardscape',         start: 69, peak: 77, exit: 82 },
    ];

    /* ── Drainage stroke-dash setup ───────────────────────────────────── */
    const drainFlow  = section.querySelector('.te-drain-flow');
    let   drainLen   = 0;
    if (drainFlow) {
      drainLen = drainFlow.getTotalLength ? drainFlow.getTotalLength() : 800;
      gsap.set(drainFlow, { strokeDasharray: drainLen, strokeDashoffset: drainLen });
    }

    /* ── Initial states ────────────────────────────────────────────────── */
    gsap.set('.te-before',          { filter: 'brightness(0.42) saturate(0.48)' });
    gsap.set('.te-after',           { clipPath: 'inset(100% 0 0 0)', opacity: 1 });
    gsap.set('.te-zone-group',      { opacity: 0 });
    gsap.set('.te-active-display',  { opacity: 0 });
    gsap.set('.te-complete-msg',    { opacity: 0 });
    gsap.set('.te-ad-fill',         { width: '0%' });

    /* ── Master timeline ───────────────────────────────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* Establish neglect */
    tl.to('.te-before', { filter: 'brightness(0.52) saturate(0.58)', duration: 8 }, 0);

    /* Each system: fade in its zone, hold, then fade at grand reveal */
    SYSTEMS.forEach(sys => {
      const g = `#te-${sys.id}`;
      tl.to(g, { opacity: 1, duration: sys.peak - sys.start }, sys.start);
      tl.to(g, { opacity: 0, duration: 5 }, sys.exit);
      /* Drainage gets path draw in addition */
      if (sys.id === 'drainage' && drainFlow && drainLen) {
        tl.to(drainFlow, { strokeDashoffset: 0, duration: (sys.peak - sys.start) }, sys.start);
      }
    });

    /* Grand reveal */
    tl
      .to('.te-active-display',  { opacity: 0, duration: 4 },                   80)
      .to('.te-before',          { opacity: 0, duration: 8 },                   82)
      .to('.te-after',           { clipPath: 'inset(0% 0 0 0)', duration: 12 }, 84)
      .to('.te-complete-msg',    { opacity: 1, duration: 7 },                   92)
      .to('.te-progress-fill',   { width: '100%', duration: 100 },               0);

    /* ── ScrollTrigger ─────────────────────────────────────────────────── */
    let lastLabel = '';
    let lastSysIdx = -2;

    ScrollTrigger.create({
      trigger: '#transformation-story',
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      animation: tl,

      onUpdate (self) {
        const p = self.progress * 100;

        /* Find active system */
        let activeSys = null;
        let activeSysIdx = -1;
        for (let i = 0; i < SYSTEMS.length; i++) {
          if (p >= SYSTEMS[i].start && p < SYSTEMS[i].exit) {
            activeSys = SYSTEMS[i];
            activeSysIdx = i;
          }
        }

        /* Update tracker items only when state changes */
        if (activeSysIdx !== lastSysIdx) {
          lastSysIdx = activeSysIdx;

          SYSTEMS.forEach((sys, i) => {
            const item = document.querySelector(`.te-tracker-item[data-system="${sys.id}"]`);
            if (!item) return;
            const isPast   = p >= sys.peak;
            const isCurrent = i === activeSysIdx;
            item.classList.toggle('done',   isPast && !isCurrent);
            item.classList.toggle('active', isCurrent);
          });

          /* Update label text */
          const adDisplay = document.querySelector('.te-active-display');
          const adSystem  = document.querySelector('.te-ad-system');

          if (p < 8 || p >= 82) {
            if (adDisplay) gsap.to(adDisplay, { opacity: 0, duration: 0.4 });
          } else if (activeSys) {
            if (adDisplay) gsap.to(adDisplay, { opacity: 1, duration: 0.4 });
            if (adSystem && activeSys.label !== lastLabel) {
              lastLabel = activeSys.label;
              /* Micro-fade for text swap */
              gsap.to(adSystem, {
                opacity: 0, duration: 0.15,
                onComplete () {
                  adSystem.textContent = activeSys.label;
                  gsap.to(adSystem, { opacity: 1, duration: 0.25 });
                }
              });
            }
          }
        }

        /* System progress bar fill (0→100% within each system's range) */
        const adFill = document.querySelector('.te-ad-fill');
        if (adFill && activeSys) {
          const pct = Math.max(0, Math.min(100,
            ((p - activeSys.start) / (activeSys.exit - activeSys.start)) * 100
          ));
          adFill.style.width = pct + '%';
        }
      }
    });
  })();


  /* ════════════════════════════════════════════════════════════════════════
     2. PROPERTY MAP — Hover-interactive aerial zones
     CSS handles the hover highlight colors.
     JS manages the info panel content and visibility.
     ════════════════════════════════════════════════════════════════════════ */
  (function initPropertyMap() {
    const section = document.getElementById('property-map');
    if (!section) return;

    /* Zone data */
    const ZONES = {
      turf: {
        label: 'Turf & Lawn',
        swatch: '#5a8a38',
        desc: 'Commercial precision mowing, fertilization, aeration & drought management across all open ground.',
        services: ['Mowing & Edging', 'Fertilization', 'Aeration', 'Drought Management'],
      },
      trees: {
        label: 'Trees & Canopy',
        swatch: '#2d5a28',
        desc: 'Structural pruning, storm-risk assessment and canopy health programs — trees managed as assets, not afterthoughts.',
        services: ['Structural Pruning', 'Canopy Health', 'Storm Assessment', 'Young Tree Care'],
      },
      hardscape: {
        label: 'Hardscape & Access',
        swatch: '#c4a245',
        desc: 'Every walkway, entry and paved surface kept clean, edged and well-defined year-round.',
        services: ['Pressure Washing', 'Edging & Detailing', 'Salt Removal', 'Surface Inspection'],
      },
      beds: {
        label: 'Landscape Beds',
        swatch: '#b8943c',
        desc: 'Seasonal color programs, mulch refresh, weed control and perennial management — the signature of a cared-for property.',
        services: ['Seasonal Color', 'Mulch Install', 'Weed Control', 'Bed Edging'],
      },
      drainage: {
        label: 'Drainage & Infrastructure',
        swatch: '#4a88b8',
        desc: 'Stormwater infrastructure managed proactively — before flooding compounds every other landscape problem.',
        services: ['Catch Basin Maintenance', 'Grade Correction', 'French Drain', '24hr Storm Response'],
      },
    };

    const inner      = section.querySelector('.pm-inner');
    const infoPanel  = section.querySelector('.pm-info-panel');
    const ipSwatch   = section.querySelector('.pm-ip-swatch');
    const ipName     = section.querySelector('.pm-ip-name');
    const ipDesc     = section.querySelector('.pm-ip-desc');
    const ipServices = section.querySelector('.pm-ip-services');
    const hint       = section.querySelector('.pm-hint');

    let activeZone = null;

    function activateZone(zoneName) {
      if (activeZone === zoneName) return;
      activeZone = zoneName;

      const data = ZONES[zoneName];
      if (!data) return;

      /* Mark body for CSS brightness effect */
      inner.classList.add('zone-active');

      /* Deactivate all zones, activate target */
      section.querySelectorAll('.pm-zone').forEach(g => {
        g.classList.remove('pm-active');
      });
      const target = section.querySelector(`.pm-zone[data-zone="${zoneName}"]`);
      if (target) target.classList.add('pm-active');

      /* Populate panel */
      if (ipSwatch)   ipSwatch.style.background = data.swatch;
      if (ipName)     ipName.textContent = data.label;
      if (ipDesc)     ipDesc.textContent = data.desc;
      if (ipServices) {
        ipServices.innerHTML = data.services
          .map(s => `<div class="pm-ip-tag">${s}</div>`)
          .join('');
      }

      /* Show panel */
      if (infoPanel) infoPanel.classList.add('visible');
      if (hint)      hint.classList.add('hidden');
    }

    function deactivateZone() {
      activeZone = null;
      inner.classList.remove('zone-active');
      section.querySelectorAll('.pm-zone').forEach(g => g.classList.remove('pm-active'));
      if (infoPanel) infoPanel.classList.remove('visible');
      if (hint)      hint.classList.remove('hidden');
    }

    /* Attach hover events to each zone group */
    section.querySelectorAll('.pm-zone').forEach(g => {
      const zoneName = g.dataset.zone;

      g.addEventListener('mouseenter', () => activateZone(zoneName));
      g.addEventListener('focus',      () => activateZone(zoneName));
      g.addEventListener('mouseleave', deactivateZone);
      g.addEventListener('blur',       deactivateZone);
    });

    /* Intro animation when section scrolls into view */
    gsap.fromTo(section, { opacity: 0 }, {
      opacity: 1, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 80%', once: true }
    });
  })();


  /* ════════════════════════════════════════════════════════════════════════
     3. SEASONAL EVOLUTION — One continuous morph
     Four stacked images. Scrub drives opacity between them.
     No panels. No text blocks. Just the landscape changing.
     ════════════════════════════════════════════════════════════════════════ */
  (function initSeasons() {
    const section = document.getElementById('seasonal-evolution');
    if (!section) return;

    const pips = section.querySelectorAll('.se-ind-pip');
    function setPip(idx) {
      pips.forEach((p, i) => p.classList.toggle('active', i === idx));
    }
    setPip(0);

    /* ── Initial states ────────────────────────────────────────────────── */
    gsap.set('.se-summer, .se-fall, .se-winter', { opacity: 0 });
    gsap.set('.se-spring', { opacity: 1, filter: 'brightness(0.62) saturate(1.05)' });

    /* Season names: spring visible, rest hidden and offset */
    gsap.set('.se-name-summer, .se-name-fall, .se-name-winter', { opacity: 0, y: 30 });
    gsap.set('.se-name-spring', { opacity: 1, y: 0 });

    /* ── Timeline (100 units → 400vh) ──────────────────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    /* Spring → Summer  (t:20-32) */
    tl
      .to('.se-spring',      { opacity: 0, duration: 12 },                     20)
      .to('.se-name-spring', { opacity: 0, y: -25, duration: 10 },             20)
      .to('.se-summer',      { opacity: 1, filter: 'brightness(0.68) saturate(1.1)', duration: 12 }, 21)
      .to('.se-name-summer', { opacity: 1, y: 0, duration: 10 },               24)

    /* Summer → Fall  (t:46-58) */
      .to('.se-summer',      { opacity: 0, duration: 12 },                     46)
      .to('.se-name-summer', { opacity: 0, y: -25, duration: 10 },             46)
      .to('.se-fall',        { opacity: 1, filter: 'brightness(0.6) saturate(0.95)', duration: 12 }, 47)
      .to('.se-name-fall',   { opacity: 1, y: 0, duration: 10 },               50)

    /* Fall → Winter  (t:72-84) */
      .to('.se-fall',        { opacity: 0, duration: 12 },                     72)
      .to('.se-name-fall',   { opacity: 0, y: -25, duration: 10 },             72)
      .to('.se-winter',      { opacity: 1, filter: 'brightness(0.5) saturate(0.62)', duration: 12 }, 73)
      .to('.se-name-winter', { opacity: 1, y: 0, duration: 10 },               76)

    /* Progress fill */
      .to('.se-progress-fill', { width: '100%', duration: 100 },                0);

    ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5,
      animation: tl,

      onUpdate (self) {
        const p = self.progress;
        setPip(p >= 0.72 ? 3 : p >= 0.46 ? 2 : p >= 0.20 ? 1 : 0);
      }
    });
  })();

})();
