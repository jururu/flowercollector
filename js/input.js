'use strict';

/* ===================================================
   InputHandler
   Supports:
     1. Drag  — mousedown on piece → drag → mouseup
     2. Click-twice — click to select, click adjacent to swap
   Touch events forwarded to mouse-equivalent logic.
   =================================================== */
class InputHandler {
  constructor(board, container) {
    this.board     = board;
    this.container = container;

    // Drag state
    this._drag = null;
    /*  {
          pieceEl, row, col,
          startX, startY,
          moved: bool,
          cloneEl (floats with cursor)
        }
    */

    // Click-select state
    this._selected = null; // { row, col, pieceEl }

    // Drag threshold in px
    this.DRAG_THRESHOLD = 10;

    this._bindEvents();
  }

  _bindEvents() {
    const c = this.container;

    // Mouse
    c.addEventListener('mousedown',  e => this._onPointerDown(e));
    window.addEventListener('mousemove', e => this._onPointerMove(e));
    window.addEventListener('mouseup',   e => this._onPointerUp(e));

    // Touch — forward to pointer handlers
    c.addEventListener('touchstart', e => {
      e.preventDefault();
      this._onPointerDown(e.changedTouches[0]);
    }, { passive: false });
    window.addEventListener('touchmove', e => {
      e.preventDefault();
      this._onPointerMove(e.changedTouches[0]);
    }, { passive: false });
    window.addEventListener('touchend', e => {
      this._onPointerUp(e.changedTouches[0]);
    });
  }

  /* ---------- Coordinate helpers ---------- */

  _clientToCell(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const cs   = this.board._cellSize;
    const col  = Math.floor((clientX - rect.left)  / cs);
    const row  = Math.floor((clientY - rect.top)   / cs);
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
    return { row, col };
  }

  _pieceAtClient(clientX, clientY) {
    const cell = this._clientToCell(clientX, clientY);
    if (!cell) return null;
    const piece = this.board.grid[cell.row][cell.col];
    return piece ? { ...cell, piece } : null;
  }

  /* ---------- Pointer Down ---------- */

  _onPointerDown(e) {
    if (this.board.isLocked) return;

    const hit = this._pieceAtClient(e.clientX, e.clientY);
    if (!hit) { this._clearSelection(); return; }

    this._drag = {
      pieceEl: hit.piece.element,
      row:     hit.row,
      col:     hit.col,
      startX:  e.clientX,
      startY:  e.clientY,
      moved:   false,
    };
  }

  /* ---------- Pointer Move ---------- */

  _onPointerMove(e) {
    if (!this._drag) return;
    if (this.board.isLocked) { this._drag = null; return; }

    const dx = e.clientX - this._drag.startX;
    const dy = e.clientY - this._drag.startY;
    const dist = Math.hypot(dx, dy);

    if (!this._drag.moved && dist >= this.DRAG_THRESHOLD) {
      this._drag.moved = true;
      this._clearSelection();
      this._drag.pieceEl.classList.add('dragging');
    }

    if (this._drag.moved) {
      // Visual: translate the piece element
      this._drag.pieceEl.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }

  /* ---------- Pointer Up ---------- */

  _onPointerUp(e) {
    if (!this._drag) return;

    const drag = this._drag;
    this._drag = null;

    if (this.board.isLocked) {
      drag.pieceEl.classList.remove('dragging');
      drag.pieceEl.style.transform = '';
      return;
    }

    if (drag.moved) {
      // --- Drag release: determine direction and attempt swap ---
      drag.pieceEl.classList.remove('dragging');
      drag.pieceEl.style.transform = '';

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const dir = this._getDirection(dx, dy);

      if (dir) {
        const dr = { up: -1, down: 1, left: 0,  right: 0  }[dir];
        const dc = { up:  0, down: 0, left: -1, right: 1 }[dir];
        this._attemptSwap(drag.row, drag.col, drag.row + dr, drag.col + dc);
      }
    } else {
      // --- Click (no drag): handle selection logic ---
      const hit = this._pieceAtClient(e.clientX, e.clientY);
      if (!hit) { this._clearSelection(); return; }

      if (this._selected) {
        if (this._selected.row === hit.row && this._selected.col === hit.col) {
          // Same piece — deselect
          this._clearSelection();
        } else if (this.board._isAdjacent(
          this._selected.row, this._selected.col, hit.row, hit.col
        )) {
          // Adjacent — swap
          const sel = this._selected;
          this._clearSelection();
          this._attemptSwap(sel.row, sel.col, hit.row, hit.col);
        } else {
          // Non-adjacent — re-select
          this._clearSelection();
          this._select(hit);
        }
      } else {
        this._select(hit);
      }
    }
  }

  /* ---------- Selection ---------- */

  _select(hit) {
    this._selected = { row: hit.row, col: hit.col, pieceEl: hit.piece.element };
    hit.piece.element.classList.add('selected');
  }

  _clearSelection() {
    if (this._selected) {
      this._selected.pieceEl.classList.remove('selected');
      this._selected = null;
    }
  }

  /* ---------- Direction Detection ---------- */

  /**
   * Returns 'up'|'down'|'left'|'right' or null.
   * Uses a lenient 45-degree cone per direction.
   */
  _getDirection(dx, dy) {
    const dist = Math.hypot(dx, dy);
    if (dist < this.DRAG_THRESHOLD) return null;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180
    // Right: -45 to 45
    if (angle > -45 && angle <= 45)   return 'right';
    // Down: 45 to 135
    if (angle > 45  && angle <= 135)  return 'down';
    // Up: -135 to -45
    if (angle > -135 && angle <= -45) return 'up';
    // Left: everything else (-180 to -135, 135 to 180)
    return 'left';
  }

  /* ---------- Swap ---------- */

  _attemptSwap(r1, c1, r2, c2) {
    if (!this.board._inBounds(r2, c2)) return;
    this.board.trySwap(r1, c1, r2, c2);
  }

  /* ---------- Refresh after board resize ---------- */

  refresh() {
    this._clearSelection();
    this._drag = null;
  }
}
