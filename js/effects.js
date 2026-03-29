'use strict';

/** Spawn small coloured particles at a given page position */
function spawnParticles(pageX, pageY, color, count = 5) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const dist  = 24 + Math.random() * 22;
    const dx    = Math.cos(angle) * dist;
    const dy    = Math.sin(angle) * dist;
    const dur   = 320 + Math.random() * 140;
    el.style.cssText = `
      left: ${pageX - 4}px;
      top:  ${pageY - 4}px;
      background: ${color};
      --dx: ${dx.toFixed(1)}px;
      --dy: ${dy.toFixed(1)}px;
      --dur: ${dur}ms;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur + 20);
  }
}

/** Show a score popup near a board cell */
function spawnScorePopup(pageX, pageY, points) {
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.textContent = `+${ScoreManager.format(points)}`;
  el.style.left = `${pageX}px`;
  el.style.top  = `${pageY}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/** Show a chain multiplier popup */
function spawnChainPopup(pageX, pageY, chainDepth) {
  const el = document.createElement('div');
  el.className = 'chain-popup';
  el.textContent = `×${chainDepth + 1} Chain!`;
  el.style.left = `${pageX}px`;
  el.style.top  = `${pageY}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

/** Petal rain — scattered flower emoji over the board (Phase 4+, available early) */
function spawnPetalRain(boardRect, count = 18) {
  const petals = ['🌸', '🌺', '🌼', '🌻', '💐'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'petal';
    const dur = 1800 + Math.random() * 1200;
    el.textContent = petals[Math.floor(Math.random() * petals.length)];
    el.style.cssText = `
      left: ${boardRect.left + Math.random() * boardRect.width}px;
      top:  ${boardRect.top  - 20}px;
      --dur: ${dur}ms;
      animation-delay: ${Math.random() * 600}ms;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur + 700);
  }
}
