'use strict';

const businessSide = document.getElementById('business-side');
const personalSide = document.getElementById('personal-side');
const gate         = document.getElementById('gate');
let locked = false;

/* ── Hover expand ────────────────────────────────────────────────────────── */
function onEnter(activeSide, dimSide) {
  if (locked) return;
  activeSide.classList.add('is-active');
  activeSide.classList.remove('is-dimmed');
  dimSide.classList.add('is-dimmed');
  dimSide.classList.remove('is-active');
}

function onLeave() {
  if (locked) return;
  businessSide.classList.remove('is-active', 'is-dimmed');
  personalSide.classList.remove('is-active', 'is-dimmed');
}

businessSide.addEventListener('mouseenter', () => onEnter(businessSide, personalSide));
personalSide.addEventListener('mouseenter', () => onEnter(personalSide, businessSide));
businessSide.addEventListener('mouseleave', onLeave);
personalSide.addEventListener('mouseleave', onLeave);

/* ── Touch / tap support ─────────────────────────────────────────────────── */
businessSide.addEventListener('touchstart', (e) => {
  if (locked) return;
  e.preventDefault();
  onEnter(businessSide, personalSide);
}, { passive: false });
businessSide.addEventListener('touchend', (e) => {
  if (locked) return;
  e.preventDefault();
  selectExperience('business');
});

personalSide.addEventListener('touchstart', (e) => {
  if (locked) return;
  e.preventDefault();
  onEnter(personalSide, businessSide);
}, { passive: false });
personalSide.addEventListener('touchend', (e) => {
  if (locked) return;
  e.preventDefault();
  selectExperience('personal');
});

/* ── Select & transition ─────────────────────────────────────────────────── */
function selectExperience(type) {
  if (locked) return;
  locked = true;

  const chosen = type === 'business' ? businessSide : personalSide;
  const other  = type === 'business' ? personalSide  : businessSide;
  const dest   = type === 'business' ? 'business.html' : 'personal.html';

  gate.classList.add('transitioning');

  /* Expand chosen side to full width */
  chosen.style.transition = 'flex 0.75s cubic-bezier(0.4,0,0.2,1), opacity 0.75s ease';
  other.style.transition  = 'flex 0.75s cubic-bezier(0.4,0,0.2,1), opacity 0.75s ease';

  chosen.style.flex = '1 1 100%';
  other.style.flex  = '0 1 0%';
  other.style.opacity = '0';

  /* Remove the divider cleanly */
  const divider = document.querySelector('.gate-divider');
  if (divider) {
    divider.style.transition = 'opacity 0.4s ease';
    divider.style.opacity = '0';
  }

  /* Brief flash to white then navigate */
  setTimeout(() => {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0;
      background: #092A00; z-index: 9999;
      opacity: 0; transition: opacity 0.35s ease;
      pointer-events: none;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.style.opacity = '1';
      setTimeout(() => { window.location.href = dest; }, 380);
    });
  }, 680);
}

/* ── Keyboard navigation ─────────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (locked) return;
  if (e.key === 'ArrowLeft')  selectExperience('business');
  if (e.key === 'ArrowRight') selectExperience('personal');
  if (e.key === 'Enter') {
    if (businessSide.classList.contains('is-active')) selectExperience('business');
    if (personalSide.classList.contains('is-active')) selectExperience('personal');
  }
});

/* ── Entrance animation ──────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.8s ease';
  requestAnimationFrame(() => {
    setTimeout(() => { document.body.style.opacity = '1'; }, 80);
  });
});
