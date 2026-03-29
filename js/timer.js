'use strict';

/* ===================================================
   Timer — チャレンジモード用カウントダウン
   =================================================== */
class Timer {
  constructor(barEl, barFillEl) {
    this._barEl     = barEl;
    this._barFillEl = barFillEl;
    this._totalMs   = 30000;
    this._remainMs  = 30000;
    this._running   = false;
    this._rafId     = null;
    this._lastTime  = 0;
    this.onExpire   = null; // () => void
    this.onChange   = null; // (remainMs, totalMs) => void
  }

  /** Start (or restart) the timer */
  start(totalMs) {
    this.stop();
    this._totalMs  = totalMs;
    this._remainMs = totalMs;
    this._running  = true;
    this._lastTime = performance.now();
    this._tick();
    this._updateBar();
  }

  stop() {
    this._running = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  /** Add milliseconds (used for match/chain/special bonuses) */
  addTime(ms) {
    if (!this._running) return;
    this._remainMs = Math.min(this._remainMs + ms, this._totalMs);
    this._updateBar();
  }

  get remainMs() { return this._remainMs; }

  _tick() {
    if (!this._running) return;
    const now   = performance.now();
    const delta = now - this._lastTime;
    this._lastTime = now;

    this._remainMs = Math.max(0, this._remainMs - delta);
    this._updateBar();
    this.onChange && this.onChange(this._remainMs, this._totalMs);

    if (this._remainMs <= 0) {
      this.stop();
      this.onExpire && this.onExpire();
      return;
    }
    this._rafId = requestAnimationFrame(() => this._tick());
  }

  _updateBar() {
    const pct = this._remainMs / this._totalMs;
    this._barFillEl.style.width = `${pct * 100}%`;

    /* Colour gradient: green → yellow → red */
    if (pct > 0.5) {
      const g = Math.round(180 + 75 * ((pct - 0.5) * 2));
      this._barFillEl.style.background = `rgb(70,${g},60)`;
    } else if (pct > 0.25) {
      const r = Math.round(255 * (1 - (pct - 0.25) * 4));
      this._barFillEl.style.background = `rgb(${220 + r * 0.14 | 0},${180 * pct / 0.5 | 0},40)`;
    } else {
      this._barFillEl.style.background = `rgb(220,60,40)`;
    }

    /* Low-time blink (<5 s) */
    const isLow = this._remainMs < 5000 && this._running;
    this._barFillEl.classList.toggle('timer-low', isLow);
  }
}
