'use strict';

/* ===================================================
   Constants
   =================================================== */
const BOARD_SIZE = 8;
const NUM_TYPES  = 7;

// Resolved at runtime from CSS variable --cell-size
function getCellSize() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--cell-size').trim();
  return parseInt(raw, 10) || 64;
}

/* ===================================================
   Flower SVG definitions
   Each SVG is 56×56 viewBox, center (28,28)
   =================================================== */
const FLOWER_COLORS = [
  '#E74C3C', // 0 Tulip
  '#F1C40F', // 1 Sunflower
  '#E91E8F', // 2 Rose
  '#9B59B6', // 3 Violet
  '#27AE60', // 4 Clover
  '#3498DB', // 5 Morning Glory
  '#E67E22', // 6 Dandelion
];

const FLOWER_SVGS = [
  /* 0 — チューリップ (Tulip) Red */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="40" width="4" height="12" rx="2" fill="#27AE60"/>
    <path d="M22 42 Q18 38 18 30 Q18 20 28 18 Q38 20 38 30 Q38 38 34 42 Q31 44 28 44 Q25 44 22 42Z" fill="#E74C3C"/>
    <path d="M28 18 Q24 14 20 17 Q16 22 18 30" fill="#E74C3C"/>
    <path d="M28 18 Q32 14 36 17 Q40 22 38 30" fill="#C0392B"/>
    <path d="M22 24 Q20 30 22 38" stroke="#F1948A" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.6"/>
  </svg>`,

  /* 1 — ひまわり (Sunflower) Yellow */
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
    <circle cx="28" cy="27" r="9"  fill="#5D3A1A"/>
    <circle cx="28" cy="27" r="6"  fill="#7B4F27"/>
    <circle cx="25" cy="25" r="1.5" fill="#9B6B3A"/>
    <circle cx="31" cy="25" r="1.5" fill="#9B6B3A"/>
    <circle cx="28" cy="30" r="1.5" fill="#9B6B3A"/>
  </svg>`,

  /* 2 — バラ (Rose) Pink */
  `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="26" y="42" width="4" height="10" rx="2" fill="#27AE60"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(72 28 28)"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(144 28 28)"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(216 28 28)"/>
    <ellipse cx="28" cy="13" rx="10" ry="13" fill="#E91E8F" transform="rotate(288 28 28)"/>
    <circle cx="28" cy="28" r="10" fill="#AD1457"/>
    <path d="M28 20 C33 22 35 27 33 31 C31 35 25 35 23 31 C21 27 23 22 27 21 C27.5 20.5 28 20 28 20Z"
          fill="#E91E8F" opacity="0.75"/>
    <circle cx="28" cy="28" r="4.5" fill="#880E4F"/>
  </svg>`,

  /* 3 — すみれ (Violet) Purple */
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

  /* 4 — クローバー (Clover) Green */
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

  /* 5 — あさがお (Morning Glory) Blue */
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

  /* 6 — たんぽぽ (Dandelion) Orange */
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
   Board Class
   =================================================== */
class Board {
  constructor(container) {
    this.container  = container;
    this.grid       = [];   // grid[row][col] = piece | null
    this.isLocked   = false;
    this._idCounter = 0;

    // Callbacks set by main.js
    this.onScore  = null; // (points, chainDepth, centerX, centerY) => void
    this.onChain  = null; // (chainDepth, centerX, centerY) => void
    this.onDeadlock = null; // () => void

    this._cellSize = getCellSize();
    this._init();
  }

  /* ---------- Initialisation ---------- */

  _init() {
    this._cellSize = getCellSize();
    this.grid = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(null));
    this._fillNoMatch();
    this._renderAll();
  }

  _fillNoMatch() {
    // Weighted random with anti-bias: track recent counts
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
    // Horizontal: 2 same to the left
    if (c >= 2 &&
        this.grid[r][c - 1]?.type === type &&
        this.grid[r][c - 2]?.type === type) return true;
    // Vertical: 2 same above
    if (r >= 2 &&
        this.grid[r - 1][c]?.type === type &&
        this.grid[r - 2][c]?.type === type) return true;
    return false;
  }

  _weightedRandom(counts) {
    const total = counts.reduce((a, b) => a + b, 0);
    // Bias toward under-represented types
    const weights = counts.map(c => {
      const avg = total / NUM_TYPES;
      return Math.max(0.2, 1 - (c - avg) * 0.15);
    });
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < NUM_TYPES; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return NUM_TYPES - 1;
  }

  _makePiece(type, row, col) {
    return { id: this._idCounter++, type, row, col, element: null };
  }

  /* ---------- Rendering ---------- */

  _renderAll() {
    this.container.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.grid[r][c]) this._createEl(this.grid[r][c]);
      }
    }
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
    return el;
  }

  _setPiecePos(piece, row, col) {
    piece.row = row;
    piece.col = col;
    if (piece.element) {
      const cs = this._cellSize;
      piece.element.style.left = `${col * cs}px`;
      piece.element.style.top  = `${row * cs}px`;
    }
  }

  /** Get the page-center coordinates of a cell */
  cellCenter(row, col) {
    const cs   = this._cellSize;
    const rect = this.container.getBoundingClientRect();
    return {
      x: rect.left + col * cs + cs / 2,
      y: rect.top  + row * cs + cs / 2,
    };
  }

  /* ---------- Public API ---------- */

  /** Attempt to swap two adjacent cells. Returns a Promise<boolean>. */
  async trySwap(r1, c1, r2, c2) {
    if (this.isLocked) return false;
    if (!this._inBounds(r1, c1) || !this._inBounds(r2, c2)) return false;
    if (!this._isAdjacent(r1, c1, r2, c2)) return false;

    this.isLocked = true;

    const p1 = this.grid[r1][c1];
    const p2 = this.grid[r2][c2];

    await this._animateSwap(p1, p2, r1, c1, r2, c2);
    this._swapInGrid(r1, c1, r2, c2);

    const matches = this._findAllMatches();
    if (matches.length === 0) {
      // No match — swap back
      await this._delay(100);
      await this._animateSwap(p1, p2, r2, c2, r1, c1);
      this._swapInGrid(r2, c2, r1, c1);
      this.isLocked = false;
      return false;
    }

    await this._processChain(matches, 0);

    // Deadlock check
    if (!this._hasValidMoves()) {
      this.onDeadlock && this.onDeadlock();
      await this._shuffleBoard();
    }

    this.isLocked = false;
    return true;
  }

  /** Resize pieces after CSS variable --cell-size changes */
  resize() {
    this._cellSize = getCellSize();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = this.grid[r][c];
        if (p?.element) {
          const cs = this._cellSize;
          p.element.style.left = `${c * cs}px`;
          p.element.style.top  = `${r * cs}px`;
        }
      }
    }
  }

  /* ---------- Swap helpers ---------- */

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

  /* ---------- Match processing ---------- */

  async _processChain(matches, chainDepth) {
    // Calculate score and fire callbacks
    let totalPoints = 0;
    let cx = 0, cy = 0, cnt = 0;
    for (const m of matches) {
      const pts = ScoreManager.matchScore(m.cells.length, chainDepth);
      totalPoints += pts;
      for (const [r, c] of m.cells) {
        const cc = this.cellCenter(r, c);
        cx += cc.x; cy += cc.y; cnt++;
      }
    }
    if (cnt > 0) { cx /= cnt; cy /= cnt; }

    this.onScore && this.onScore(totalPoints, chainDepth, cx, cy);
    if (chainDepth > 0) this.onChain && this.onChain(chainDepth, cx, cy);

    // Animate removal
    const toRemove = new Set();
    for (const m of matches) {
      for (const [r, c] of m.cells) toRemove.add(`${r},${c}`);
    }

    // Spawn particles per removed piece
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      const p = this.grid[r][c];
      if (p?.element) {
        p.element.classList.add('removing');
        const cc = this.cellCenter(r, c);
        spawnParticles(cc.x, cc.y, FLOWER_COLORS[p.type], 4 + chainDepth);
      }
    }
    await this._delay(200);

    // Remove from DOM + grid
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      if (this.grid[r][c]) {
        this.grid[r][c].element?.remove();
        this.grid[r][c] = null;
      }
    }

    // Fall + refill
    await this._fallAndRefill();

    // Check for chain
    const nextMatches = this._findAllMatches();
    if (nextMatches.length > 0) {
      await this._delay(100);
      await this._processChain(nextMatches, chainDepth + 1);
    }
  }

  /* ---------- Fall & Refill ---------- */

  async _fallAndRefill() {
    const cs = this._cellSize;
    let maxFall = 0;
    const movedPieces = []; // pieces that actually moved (for landing bounce)

    for (let c = 0; c < BOARD_SIZE; c++) {
      // Collect surviving pieces from bottom to top
      const pieces = [];
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (this.grid[r][c] !== null) pieces.push(this.grid[r][c]);
      }
      const emptyTop = BOARD_SIZE - pieces.length;

      // Clear column to avoid stale references
      for (let r = 0; r < BOARD_SIZE; r++) this.grid[r][c] = null;

      // Re-place existing pieces at bottom rows
      for (let i = 0; i < pieces.length; i++) {
        const targetRow = BOARD_SIZE - 1 - i;
        const p = pieces[i];
        const fallDist = targetRow - p.row;
        this.grid[targetRow][c] = p;
        p.row = targetRow;
        p.col = c;
        if (fallDist > 0) {
          maxFall = Math.max(maxFall, fallDist);
          p.element.style.setProperty('--fall-duration', `${Math.min(180 * fallDist, 300)}ms`);
          p.element.classList.add('falling');
          p.element.style.top = `${targetRow * cs}px`;
          movedPieces.push(p);
        }
      }

      // Create new pieces for the empty top rows
      // All new pieces in this column travel `emptyTop` cells visually,
      // so use emptyTop for the duration calculation (cascading stagger).
      for (let i = 0; i < emptyTop; i++) {
        const row  = i;
        const type = Math.floor(Math.random() * NUM_TYPES);
        const p    = this._makePiece(type, row, c);
        this.grid[row][c] = p;
        this._createEl(p);

        // Stack new pieces above the board: piece i starts (emptyTop-i) cells above row 0
        const spawnY  = -(emptyTop - i) * cs;
        const targetY = row * cs;
        // Use a staggered duration: upper pieces take longer (emptyTop), lower take less
        const fallDist = emptyTop - i;
        maxFall = Math.max(maxFall, emptyTop); // all new pieces visually fall emptyTop cells

        p.element.style.top = `${spawnY}px`;
        p.element.style.setProperty('--fall-duration', `${Math.min(180 * fallDist, 300)}ms`);
        // Force the browser to commit the starting position before the transition
        p.element.getBoundingClientRect();
        p.element.classList.add('falling');
        p.element.style.top = `${targetY}px`;
        movedPieces.push(p);
      }
    }

    // Wait for the longest fall + bounce overshoot
    const fallMs = Math.min(180 * Math.max(maxFall, 1), 300);
    await this._delay(fallMs + 90);

    // Remove fall class and trigger landing bounce only on pieces that moved
    for (const p of movedPieces) {
      if (!p.element) continue;
      p.element.classList.remove('falling');
      p.element.style.removeProperty('--fall-duration');
      p.element.classList.add('landing');
      p.element.addEventListener('animationend', () => {
        p.element && p.element.classList.remove('landing');
      }, { once: true });
    }
  }

  /* ---------- Match Detection ---------- */

  _findAllMatches() {
    const matches = [];

    // Horizontal
    for (let r = 0; r < BOARD_SIZE; r++) {
      let c = 0;
      while (c < BOARD_SIZE) {
        const type = this.grid[r][c]?.type;
        if (type == null) { c++; continue; }
        let len = 1;
        while (c + len < BOARD_SIZE && this.grid[r][c + len]?.type === type) len++;
        if (len >= 3) {
          const cells = [];
          for (let i = 0; i < len; i++) cells.push([r, c + i]);
          matches.push({ cells, dir: 'h', type });
        }
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
        if (len >= 3) {
          const cells = [];
          for (let i = 0; i < len; i++) cells.push([r + i, c]);
          matches.push({ cells, dir: 'v', type });
        }
        r += len;
      }
    }

    return matches;
  }

  /* ---------- Deadlock Detection ---------- */

  _hasValidMoves() {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (c + 1 < BOARD_SIZE && this._swapCreatesMatch(r, c, r, c + 1)) return true;
        if (r + 1 < BOARD_SIZE && this._swapCreatesMatch(r, c, r + 1, c)) return true;
      }
    }
    return false;
  }

  _swapCreatesMatch(r1, c1, r2, c2) {
    this._swapInGrid(r1, c1, r2, c2);
    const has = this._findAllMatches().length > 0;
    this._swapInGrid(r2, c2, r1, c1);
    return has;
  }

  /* ---------- Shuffle ---------- */

  async _shuffleBoard() {
    // Collect all types, shuffle them, redistribute
    const types = [];
    const positions = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.grid[r][c]) {
          types.push(this.grid[r][c].type);
          positions.push([r, c]);
        }
      }
    }

    // Fisher-Yates
    let attempts = 0;
    do {
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      attempts++;
    } while (attempts < 50 && !this._typesHaveValidMoves(types, positions));

    // Apply shuffled types
    for (let i = 0; i < positions.length; i++) {
      const [r, c] = positions[i];
      const p = this.grid[r][c];
      p.type = types[i];
      p.element.className = `piece flower-${p.type}`;
      p.element.innerHTML = FLOWER_SVGS[p.type];
    }

    // Clear any accidental matches
    const matches = this._findAllMatches();
    if (matches.length > 0) await this._processChain(matches, 0);
  }

  _typesHaveValidMoves(types, positions) {
    // Build a temporary grid to test
    const tmpGrid = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(null));
    for (let i = 0; i < positions.length; i++) {
      const [r, c] = positions[i];
      tmpGrid[r][c] = { type: types[i] };
    }
    const savedGrid = this.grid;
    this.grid = tmpGrid;
    const result = this._hasValidMoves();
    this.grid = savedGrid;
    return result;
  }

  /* ---------- Utility ---------- */

  _inBounds(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
  }

  _isAdjacent(r1, c1, r2, c2) {
    return (r1 === r2 && Math.abs(c1 - c2) === 1) ||
           (c1 === c2 && Math.abs(r1 - r2) === 1);
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
