'use strict';

/* ===================================================
   Constants
   =================================================== */
const BOARD_SIZE = 8;
const NUM_TYPES  = 7;

function getCellSize() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--cell-size').trim();
  return parseInt(raw, 10) || 64;
}

/* ===================================================
   Flower SVG definitions  (56×56 viewBox, center 28,28)
   =================================================== */
const FLOWER_COLORS = [
  '#E74C3C', '#F1C40F', '#E91E8F', '#9B59B6',
  '#27AE60', '#3498DB', '#E67E22',
];

const FLOWER_SVGS = [
  /* 0 チューリップ */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="40" width="4" height="12" rx="2" fill="#27AE60"/>
    <path d="M22 42 Q18 38 18 30 Q18 20 28 18 Q38 20 38 30 Q38 38 34 42 Q31 44 28 44 Q25 44 22 42Z" fill="#E74C3C"/>
    <path d="M28 18 Q24 14 20 17 Q16 22 18 30" fill="#E74C3C"/>
    <path d="M28 18 Q32 14 36 17 Q40 22 38 30" fill="#C0392B"/>
    <path d="M22 24 Q20 30 22 38" stroke="#F1948A" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
  /* 1 ひまわり */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="40" width="4" height="12" rx="2" fill="#27AE60"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(45 28 27)"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(90 28 27)"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(135 28 27)"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(180 28 27)"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(225 28 27)"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(270 28 27)"/>
    <ellipse cx="28" cy="12" rx="6" ry="10" fill="#F1C40F" transform="rotate(315 28 27)"/>
    <circle cx="28" cy="27" r="9" fill="#5D3A1A"/>
    <circle cx="28" cy="27" r="6" fill="#7B4F27"/>
    <circle cx="25" cy="25" r="1.5" fill="#9B6B3A"/>
    <circle cx="31" cy="25" r="1.5" fill="#9B6B3A"/>
    <circle cx="28" cy="30" r="1.5" fill="#9B6B3A"/>
  </svg>`,
  /* 2 バラ */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="42" width="4" height="10" rx="2" fill="#27AE60"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(72 28 28)"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(144 28 28)"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(216 28 28)"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(288 28 28)"/>
    <circle cx="28" cy="28" r="10" fill="#AD1457"/>
    <path d="M28 20 C33 22 35 27 33 31 C31 35 25 35 23 31 C21 27 23 22 27 21 C27.5 20.5 28 20 28 20Z" fill="#E91E8F" opacity="0.75"/>
    <circle cx="28" cy="28" r="4.5" fill="#880E4F"/>
  </svg>`,
  /* 3 すみれ */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="44" width="4" height="8" rx="2" fill="#27AE60"/>
    <ellipse cx="28" cy="14" rx="8" ry="12" fill="#9B59B6"/>
    <ellipse cx="28" cy="14" rx="8" ry="12" fill="#9B59B6" transform="rotate(72 28 28)"/>
    <ellipse cx="28" cy="14" rx="8" ry="12" fill="#9B59B6" transform="rotate(144 28 28)"/>
    <ellipse cx="28" cy="14" rx="8" ry="12" fill="#9B59B6" transform="rotate(216 28 28)"/>
    <ellipse cx="28" cy="14" rx="8" ry="12" fill="#9B59B6" transform="rotate(288 28 28)"/>
    <circle cx="28" cy="28" r="7" fill="#F39C12"/>
    <circle cx="28" cy="28" r="4" fill="#E67E22"/>
  </svg>`,
  /* 4 クローバー */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="44" width="4" height="10" rx="2" fill="#1a7a40"/>
    <ellipse cx="28" cy="16" rx="11" ry="13" fill="#2ECC71"/>
    <ellipse cx="28" cy="16" rx="11" ry="13" fill="#2ECC71" transform="rotate(90 28 28)"/>
    <ellipse cx="28" cy="16" rx="11" ry="13" fill="#2ECC71" transform="rotate(180 28 28)"/>
    <ellipse cx="28" cy="16" rx="11" ry="13" fill="#2ECC71" transform="rotate(270 28 28)"/>
    <circle cx="28" cy="28" r="5.5" fill="#27AE60"/>
    <line x1="22" y1="22" x2="28" y2="28" stroke="#27AE60" stroke-width="1.5"/>
    <line x1="34" y1="22" x2="28" y2="28" stroke="#27AE60" stroke-width="1.5"/>
    <line x1="22" y1="34" x2="28" y2="28" stroke="#27AE60" stroke-width="1.5"/>
    <line x1="34" y1="34" x2="28" y2="28" stroke="#27AE60" stroke-width="1.5"/>
  </svg>`,
  /* 5 あさがお */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="42" width="4" height="10" rx="2" fill="#27AE60"/>
    <circle cx="28" cy="26" r="18" fill="#5DADE2"/>
    <line x1="28" y1="26" x2="28" y2="8"  stroke="#2471A3" stroke-width="2" stroke-linecap="round"/>
    <line x1="28" y1="26" x2="28" y2="8"  stroke="#2471A3" stroke-width="2" stroke-linecap="round" transform="rotate(72 28 26)"/>
    <line x1="28" y1="26" x2="28" y2="8"  stroke="#2471A3" stroke-width="2" stroke-linecap="round" transform="rotate(144 28 26)"/>
    <line x1="28" y1="26" x2="28" y2="8"  stroke="#2471A3" stroke-width="2" stroke-linecap="round" transform="rotate(216 28 26)"/>
    <line x1="28" y1="26" x2="28" y2="8"  stroke="#2471A3" stroke-width="2" stroke-linecap="round" transform="rotate(288 28 26)"/>
    <circle cx="28" cy="26" r="8"  fill="white"/>
    <circle cx="28" cy="26" r="4.5" fill="#AED6F1"/>
    <circle cx="28" cy="26" r="2"  fill="#3498DB"/>
  </svg>`,
  /* 6 たんぽぽ */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="42" width="4" height="10" rx="2" fill="#27AE60"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(30 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(60 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(90 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(120 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(150 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(180 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(210 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(240 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(270 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(300 28 28)"/>
    <line x1="28" y1="28" x2="28" y2="8"  stroke="#E67E22" stroke-width="1.8" stroke-linecap="round" transform="rotate(330 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(30 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(60 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(90 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(120 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(150 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(180 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(210 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(240 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(270 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(300 28 28)"/>
    <circle cx="28" cy="10" r="3.2" fill="#F39C12" transform="rotate(330 28 28)"/>
    <circle cx="28" cy="28" r="5.5" fill="#E67E22"/>
    <circle cx="28" cy="28" r="3"   fill="#D35400"/>
  </svg>`,
];

/* ===================================================
   Special piece badge SVGs (20×20 viewBox, white icons)
   =================================================== */
const SPECIAL_BADGE_SVGS = {
  'line-h': `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10h14M14 6l4 4-4 4M6 6L2 10l4 4"
          stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'line-v': `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 3v14M6 6l4-4 4 4M6 14l4 4 4-4"
          stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'bomb': `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="white" stroke-width="2" fill="none"/>
    <path d="M6.5 6.5l7 7M13.5 6.5l-7 7"
          stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  'flower': `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="white" stroke-width="2"
            fill="none" stroke-dasharray="3.5 2"/>
    <circle cx="10" cy="10" r="3" fill="white"/>
  </svg>`,
};

/* ===================================================
   Board Class
   =================================================== */
class Board {
  constructor(container) {
    this.container  = container;
    this.grid       = [];
    this.isLocked   = false;
    this._idCounter = 0;

    /* Callbacks */
    this.onScore    = null; // (points, chainDepth, cx, cy)
    this.onMatch    = null; // (maxMatchLen, chainDepth)  — for time bonuses
    this.onRemove   = null; // (type)                     — per removed piece
    this.onChain    = null; // (chainDepth, cx, cy)
    this.onSpecial  = null; // (specialType)              — special activated
    this.onDeadlock = null; // ()

    this.audio     = null;
    this._cellSize = getCellSize();
    this._init();
  }

  /* ====================== Initialisation ====================== */

  _init() {
    this._cellSize = getCellSize();
    this.grid = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(null));
    this._fillNoMatch();
    this._renderAll();
  }

  _fillNoMatch() {
    const counts = new Array(NUM_TYPES).fill(0);
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        let type, tries = 0;
        do {
          type = this._weightedRandom(counts);
          tries++;
        } while (tries < 30 && this._wouldMatch(r, c, type));
        counts[type]++;
        this.grid[r][c] = this._makePiece(type, r, c);
      }
    }
  }

  _wouldMatch(r, c, type) {
    if (c >= 2 && this.grid[r][c-1]?.type === type && this.grid[r][c-2]?.type === type) return true;
    if (r >= 2 && this.grid[r-1][c]?.type === type && this.grid[r-2][c]?.type === type) return true;
    return false;
  }

  _weightedRandom(counts) {
    const total = counts.reduce((a, b) => a + b, 0);
    const weights = counts.map(c => Math.max(0.2, 1 - (c - total / NUM_TYPES) * 0.15));
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < NUM_TYPES; i++) { r -= weights[i]; if (r <= 0) return i; }
    return NUM_TYPES - 1;
  }

  _makePiece(type, row, col) {
    return { id: this._idCounter++, type, row, col, element: null, special: null };
  }

  /* ====================== Rendering ====================== */

  _renderAll() {
    this.container.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (this.grid[r][c]) this._createEl(this.grid[r][c]);
  }

  _createEl(piece) {
    const el = document.createElement('div');
    el.className = `piece flower-${piece.type}`;
    el.dataset.id = piece.id;
    const cs = this._cellSize;
    el.style.cssText = `left:${piece.col * cs}px; top:${piece.row * cs}px;`;
    el.innerHTML = FLOWER_SVGS[piece.type];
    piece.element = el;
    this.container.appendChild(el);
    if (piece.special) this._applySpecialEl(piece);
    return el;
  }

  /** Apply or remove the special-piece visual to an existing element */
  _applySpecialEl(piece) {
    if (!piece.element) return;
    const el = piece.element;
    // Remove old special classes / badge
    el.classList.remove('special-line-h', 'special-line-v', 'special-bomb', 'special-flower');
    el.querySelector('.special-badge')?.remove();

    if (!piece.special) return;

    el.classList.add(`special-${piece.special}`);
    const badge = document.createElement('div');
    badge.className = 'special-badge';
    badge.innerHTML = SPECIAL_BADGE_SVGS[piece.special] || '';
    el.appendChild(badge);

    // Pop-in animation
    el.classList.add('special-creating');
    el.addEventListener('animationend', () => el.classList.remove('special-creating'), { once: true });
  }

  cellCenter(row, col) {
    const cs   = this._cellSize;
    const rect = this.container.getBoundingClientRect();
    return { x: rect.left + col * cs + cs / 2, y: rect.top + row * cs + cs / 2 };
  }

  /* ====================== Public API ====================== */

  async trySwap(r1, c1, r2, c2) {
    if (this.isLocked) return false;
    if (!this._inBounds(r1, c1) || !this._inBounds(r2, c2)) return false;
    if (!this._isAdjacent(r1, c1, r2, c2)) return false;

    const p1 = this.grid[r1][c1];
    const p2 = this.grid[r2][c2];
    if (!p1 || !p2) return false;

    this.isLocked = true;

    // ---- Special piece direct swap ----
    if (p1.special || p2.special) {
      await this._animateSwap(p1, p2, r1, c1, r2, c2);
      this._swapInGrid(r1, c1, r2, c2);
      await this._activateSpecialSwap(p1, p2);
      if (!this._hasValidMoves()) { this.onDeadlock?.(); await this._shuffleBoard(); }
      this.isLocked = false;
      return true;
    }

    // ---- Normal swap ----
    await this._animateSwap(p1, p2, r1, c1, r2, c2);
    this._swapInGrid(r1, c1, r2, c2);

    const matches = this._findAllMatches();
    if (matches.length === 0) {
      await this._delay(100);
      this.audio?.playSwapFail();
      await this._animateSwap(p1, p2, r2, c2, r1, c1);
      this._swapInGrid(r2, c2, r1, c1);
      this.isLocked = false;
      return false;
    }

    await this._processChain(matches, 0);
    if (!this._hasValidMoves()) { this.onDeadlock?.(); await this._shuffleBoard(); }
    this.isLocked = false;
    return true;
  }

  resize() {
    this._cellSize = getCellSize();
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = this.grid[r][c];
        if (p?.element) {
          const cs = this._cellSize;
          p.element.style.left = `${c * cs}px`;
          p.element.style.top  = `${r * cs}px`;
        }
      }
  }

  /* ====================== Swap Helpers ====================== */

  async _animateSwap(p1, p2, fromR1, fromC1, fromR2, fromC2) {
    const cs = this._cellSize;
    p1.element.classList.add('swapping');
    p2.element.classList.add('swapping');
    p1.element.style.left = `${fromC2 * cs}px`;
    p1.element.style.top  = `${fromR2 * cs}px`;
    p2.element.style.left = `${fromC1 * cs}px`;
    p2.element.style.top  = `${fromR1 * cs}px`;
    await this._delay(150);
    p1.element.classList.remove('swapping');
    p2.element.classList.remove('swapping');
  }

  _swapInGrid(r1, c1, r2, c2) {
    const tmp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = tmp;
    if (this.grid[r1][c1]) { this.grid[r1][c1].row = r1; this.grid[r1][c1].col = c1; }
    if (this.grid[r2][c2]) { this.grid[r2][c2].row = r2; this.grid[r2][c2].col = c2; }
  }

  /* ====================== Special Piece Activation ====================== */

  async _activateSpecialSwap(p1, p2) {
    const toRemove = new Set();

    if (p1.special === 'flower' && p2.special === 'flower') {
      // Both flower bombs → clear entire board
      for (let r = 0; r < BOARD_SIZE; r++)
        for (let c = 0; c < BOARD_SIZE; c++)
          if (this.grid[r][c]) toRemove.add(`${r},${c}`);
    } else if (p1.special === 'flower') {
      this._addAllOfType(p2.type, toRemove);
      toRemove.add(`${p1.row},${p1.col}`);
    } else if (p2.special === 'flower') {
      this._addAllOfType(p1.type, toRemove);
      toRemove.add(`${p2.row},${p2.col}`);
    } else {
      if (p1.special) this._addSpecialArea(p1, toRemove);
      if (p2.special) this._addSpecialArea(p2, toRemove);
      toRemove.add(`${p1.row},${p1.col}`);
      toRemove.add(`${p2.row},${p2.col}`);
    }

    // One cascade pass for specials swept up in the removal
    const extra = new Set();
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      const p = this.grid[r][c];
      if (p?.special && p !== p1 && p !== p2) this._addSpecialArea(p, extra);
    }
    for (const k of extra) toRemove.add(k);

    const activatedType = p1.special || p2.special;
    this._playSpecialActivate(activatedType);
    this.onSpecial?.(activatedType);

    await this._removeSet(toRemove, 0, 300);

    const chains = this._findAllMatches();
    if (chains.length > 0) { await this._delay(100); await this._processChain(chains, 0); }
  }

  _addAllOfType(type, set) {
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (this.grid[r][c]?.type === type) set.add(`${r},${c}`);
  }

  _addSpecialArea(p, set) {
    switch (p.special) {
      case 'line-h':
        for (let c = 0; c < BOARD_SIZE; c++) set.add(`${p.row},${c}`);
        break;
      case 'line-v':
        for (let r = 0; r < BOARD_SIZE; r++) set.add(`${r},${p.col}`);
        break;
      case 'bomb':
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const r = p.row + dr, c = p.col + dc;
            if (this._inBounds(r, c)) set.add(`${r},${c}`);
          }
        break;
      case 'flower':
        this._addAllOfType(p.type, set);
        set.add(`${p.row},${p.col}`);
        break;
    }
  }

  /* ====================== Match Processing ====================== */

  async _processChain(matches, chainDepth) {
    // Score & centroid
    let totalPoints = 0;
    let cx = 0, cy = 0, cnt = 0;
    for (const m of matches) {
      const pts = ScoreManager.matchScore(m.cells.length, chainDepth);
      totalPoints += pts;
      for (const [r, c] of m.cells) {
        const cc = this.cellCenter(r, c); cx += cc.x; cy += cc.y; cnt++;
      }
    }
    if (cnt) { cx /= cnt; cy /= cnt; }

    const maxLen = matches.reduce((mx, m) => Math.max(mx, m.cells.length), 0);
    this.onScore?.(totalPoints, chainDepth, cx, cy);
    this.onMatch?.(maxLen, chainDepth);
    if (chainDepth > 0) this.onChain?.(chainDepth, cx, cy);

    this.audio?.playMatch(maxLen);
    if (chainDepth >= 1) this.audio?.playChain(chainDepth);

    // Build removal set; reserve cells that will become special pieces
    const toRemove   = new Set();
    const specCreate = []; // {row,col,special,type}

    for (const m of matches) {
      for (const [r, c] of m.cells) toRemove.add(`${r},${c}`);
      if (m.special && m.specialCell) {
        const [sr, sc] = m.specialCell;
        toRemove.delete(`${sr},${sc}`);
        specCreate.push({ row: sr, col: sc, special: m.special, type: m.type });
      }
    }

    // Expand for existing special pieces caught in the removal
    const extraSpecial = new Set();
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      const p = this.grid[r][c];
      if (p?.special) {
        this._addSpecialArea(p, extraSpecial);
        this._playSpecialActivate(p.special);
        this.onSpecial?.(p.special);
      }
    }
    for (const k of extraSpecial) toRemove.add(k);

    // Animate + remove
    const particleCount = chainDepth === 0 ? 5 : Math.min(5 + chainDepth * 3, 16);
    await this._removeSet(toRemove, chainDepth, 200, particleCount);

    // Transform surviving cells into special pieces
    for (const { row, col, special, type } of specCreate) {
      const p = this.grid[row][col];
      if (p && p.type === type && !p.special) {
        p.special = special;
        this._applySpecialEl(p);
        this._playSpecialCreate(special);
      }
    }

    await this._fallAndRefill();

    const next = this._findAllMatches();
    if (next.length > 0) { await this._delay(100); await this._processChain(next, chainDepth + 1); }
  }

  /** Animate + remove a Set of "r,c" keys, fire onRemove per piece */
  async _removeSet(toRemove, chainDepth, animMs = 200, particleCount = 5) {
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      const p = this.grid[r][c];
      if (p?.element) {
        p.element.classList.add('removing');
        const cc = this.cellCenter(r, c);
        spawnParticles(cc.x, cc.y, FLOWER_COLORS[p.type], particleCount);
      }
    }
    await this._delay(animMs);

    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      if (this.grid[r][c]) {
        this.onRemove?.(this.grid[r][c].type);
        this.grid[r][c].element?.remove();
        this.grid[r][c] = null;
      }
    }
  }

  /* ====================== Fall & Refill ====================== */

  async _fallAndRefill() {
    const cs = this._cellSize;
    let maxFall = 0;
    const movedPieces = [];

    for (let c = 0; c < BOARD_SIZE; c++) {
      const pieces = [];
      for (let r = BOARD_SIZE - 1; r >= 0; r--)
        if (this.grid[r][c] !== null) pieces.push(this.grid[r][c]);
      const emptyTop = BOARD_SIZE - pieces.length;

      for (let r = 0; r < BOARD_SIZE; r++) this.grid[r][c] = null;

      for (let i = 0; i < pieces.length; i++) {
        const targetRow = BOARD_SIZE - 1 - i;
        const p = pieces[i];
        const fallDist = targetRow - p.row;
        this.grid[targetRow][c] = p;
        p.row = targetRow; p.col = c;
        if (fallDist > 0) {
          maxFall = Math.max(maxFall, fallDist);
          p.element.style.setProperty('--fall-duration', `${Math.min(180 * fallDist, 300)}ms`);
          p.element.classList.add('falling');
          p.element.style.top = `${targetRow * cs}px`;
          movedPieces.push(p);
        }
      }

      for (let i = 0; i < emptyTop; i++) {
        const row  = i;
        const type = Math.floor(Math.random() * NUM_TYPES);
        const p    = this._makePiece(type, row, c);
        this.grid[row][c] = p;
        this._createEl(p);

        const spawnY   = -(emptyTop - i) * cs;
        const fallDist = emptyTop - i;
        maxFall = Math.max(maxFall, emptyTop);

        p.element.style.top = `${spawnY}px`;
        p.element.style.setProperty('--fall-duration', `${Math.min(180 * fallDist, 300)}ms`);
        p.element.getBoundingClientRect(); // force layout
        p.element.classList.add('falling');
        p.element.style.top = `${row * cs}px`;
        movedPieces.push(p);
      }
    }

    const fallMs = Math.min(180 * Math.max(maxFall, 1), 300);
    await this._delay(fallMs + 90);

    if (movedPieces.length > 0) this.audio?.playLand();

    for (const p of movedPieces) {
      if (!p.element) continue;
      p.element.classList.remove('falling');
      p.element.style.removeProperty('--fall-duration');
      p.element.classList.add('landing');
      p.element.addEventListener('animationend', () => p.element?.classList.remove('landing'), { once: true });
    }
  }

  /* ====================== Match Detection ====================== */

  _findAllMatches() {
    return this._classifyRuns(this._findRuns());
  }

  _findRuns() {
    const runs = [];
    // Horizontal
    for (let r = 0; r < BOARD_SIZE; r++) {
      let c = 0;
      while (c < BOARD_SIZE) {
        const type = this.grid[r][c]?.type;
        if (type == null) { c++; continue; }
        let len = 1;
        while (c + len < BOARD_SIZE && this.grid[r][c + len]?.type === type) len++;
        if (len >= 3) runs.push({ cells: Array.from({length:len}, (_,i)=>[r,c+i]), dir:'h', type });
        c += len;
      }
    }
    // Vertical
    for (let c = 0; c < BOARD_SIZE; c++) {
      let r = 0;
      while (r < BOARD_SIZE) {
        const type = this.grid[r][c]?.type;
        if (type == null) { r++; continue; }
        let len = 1;
        while (r + len < BOARD_SIZE && this.grid[r + len][c]?.type === type) len++;
        if (len >= 3) runs.push({ cells: Array.from({length:len}, (_,i)=>[r+i,c]), dir:'v', type });
        r += len;
      }
    }
    return runs;
  }

  _classifyRuns(runs) {
    if (!runs.length) return [];

    // Map each cell to the run indices it belongs to
    const cellMap = new Map();
    for (let i = 0; i < runs.length; i++)
      for (const [r, c] of runs[i].cells) {
        const k = `${r},${c}`;
        if (!cellMap.has(k)) cellMap.set(k, []);
        cellMap.get(k).push(i);
      }

    const used   = new Set();
    const result = [];

    for (let i = 0; i < runs.length; i++) {
      if (used.has(i)) continue;

      let run = runs[i];
      let intersectCell = null;

      // Look for L/T intersection with another run of same type, different direction
      outer:
      for (const [r, c] of run.cells) {
        for (const j of (cellMap.get(`${r},${c}`) || [])) {
          if (j === i || used.has(j) || runs[j].type !== run.type || runs[j].dir === run.dir) continue;
          // Merge into one run
          const merged = [
            ...new Map([...run.cells, ...runs[j].cells].map(([r2,c2])=>[`${r2},${c2}`,[r2,c2]])).values()
          ];
          run = { cells: merged, type: run.type, dir: 'lt' };
          intersectCell = [r, c];
          used.add(j);
          break outer;
        }
      }

      // Classify for special piece creation
      // Only create specials if no cell in the run is already a special piece
      const hasSpecial = run.cells.some(([r2,c2]) => this.grid[r2][c2]?.special);
      let special = null, specialCell = null;

      if (!hasSpecial) {
        if (intersectCell) {
          special = 'bomb';
          specialCell = intersectCell;
        } else if (run.cells.length >= 5) {
          special = 'flower';
          specialCell = run.cells[Math.floor(run.cells.length / 2)];
        } else if (run.cells.length === 4) {
          // Cross direction: horizontal match → vertical line piece (clears column)
          special = run.dir === 'h' ? 'line-v' : 'line-h';
          specialCell = run.cells[Math.floor(run.cells.length / 2)];
        }
      }

      result.push({ ...run, special, specialCell });
    }
    return result;
  }

  /* ====================== Deadlock / Shuffle ====================== */

  _hasValidMoves() {
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (c + 1 < BOARD_SIZE && this._swapCreatesMatch(r, c, r, c + 1)) return true;
        if (r + 1 < BOARD_SIZE && this._swapCreatesMatch(r, c, r + 1, c)) return true;
      }
    return false;
  }

  _swapCreatesMatch(r1, c1, r2, c2) {
    this._swapInGrid(r1, c1, r2, c2);
    const has = this._findAllMatches().length > 0;
    this._swapInGrid(r2, c2, r1, c1);
    return has;
  }

  async _shuffleBoard() {
    const types = [], positions = [];
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (this.grid[r][c]) {
          types.push(this.grid[r][c].type);
          positions.push([r, c]);
        }

    let attempts = 0;
    do {
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
    } while (++attempts < 50 && !this._typesHaveValidMoves(types, positions));

    for (let i = 0; i < positions.length; i++) {
      const [r, c] = positions[i];
      const p = this.grid[r][c];
      p.type    = types[i];
      p.special = null; // clear specials on shuffle
      p.element.className  = `piece flower-${p.type}`;
      p.element.innerHTML  = FLOWER_SVGS[p.type];
    }

    const matches = this._findAllMatches();
    if (matches.length > 0) await this._processChain(matches, 0);
  }

  _typesHaveValidMoves(types, positions) {
    const tmp = Array.from({length:BOARD_SIZE}, () => new Array(BOARD_SIZE).fill(null));
    for (let i = 0; i < positions.length; i++) {
      const [r, c] = positions[i];
      tmp[r][c] = { type: types[i] };
    }
    const saved = this.grid;
    this.grid = tmp;
    const ok = this._hasValidMoves();
    this.grid = saved;
    return ok;
  }

  /* ====================== Audio helpers ====================== */

  _playSpecialCreate(special) {
    if (!this.audio) return;
    switch (special) {
      case 'line-h': case 'line-v': this.audio.playLineCreate?.();       break;
      case 'bomb':                  this.audio.playBombCreate?.();        break;
      case 'flower':                this.audio.playBombFlowerCreate?.();  break;
    }
  }

  _playSpecialActivate(special) {
    if (!this.audio) return;
    switch (special) {
      case 'line-h': case 'line-v': this.audio.playLineActivate?.();      break;
      case 'bomb':                  this.audio.playBombActivate?.();       break;
      case 'flower':                this.audio.playBombFlowerActivate?.(); break;
    }
  }

  /* ====================== Utilities ====================== */

  _inBounds(r, c)       { return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE; }
  _isAdjacent(r1,c1,r2,c2) {
    return (r1===r2 && Math.abs(c1-c2)===1) || (c1===c2 && Math.abs(r1-r2)===1);
  }
  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}
