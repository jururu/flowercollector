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

/** Show a chain multiplier popup (with tier styling for big chains) */
function spawnChainPopup(pageX, pageY, chainDepth) {
  const el = document.createElement('div');
  // depth 1-2 = normal, 3-4 = big (gold), 5+ = mega (red glow)
  const tier = chainDepth >= 4 ? 'mega' : chainDepth >= 2 ? 'big' : '';
  el.className = `chain-popup${tier ? ' ' + tier : ''}`;
  el.textContent = `×${chainDepth + 1} Chain!`;
  el.style.left = `${pageX}px`;
  el.style.top  = `${pageY}px`;
  document.body.appendChild(el);

  // Screen flash for chains 3+
  if (chainDepth >= 2) {
    const flash = document.createElement('div');
    flash.className = 'chain-flash';
    const alpha = Math.min(0.08 + (chainDepth - 2) * 0.04, 0.22);
    flash.style.background = `rgba(255, 180, 0, ${alpha})`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 350);
  }

  setTimeout(() => el.remove(), chainDepth >= 4 ? 900 : 700);
}

/** Petal rain — scattered flower emoji falling over the board */
function spawnPetalRain(boardRect, count = 18) {
  const petals = ['🌸', '🌺', '🌼', '🌻', '🌷', '💮', '🏵️'];
  for (let i = 0; i < count; i++) {
    const el  = document.createElement('div');
    el.className = 'petal';
    const dur   = 1600 + Math.random() * 1400;
    const drift = ((Math.random() - 0.5) * 90).toFixed(1);
    const size  = (0.9 + Math.random() * 0.9).toFixed(2);
    el.textContent = petals[Math.floor(Math.random() * petals.length)];
    el.style.cssText = `
      left: ${boardRect.left + Math.random() * boardRect.width}px;
      top:  ${boardRect.top  - 20}px;
      font-size: ${size}rem;
      --dur:   ${dur}ms;
      --drift: ${drift}px;
      animation-name: petal-fall-drift;
      animation-delay: ${(Math.random() * 800).toFixed(0)}ms;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur + 900);
  }
}
