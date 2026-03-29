'use strict';

class ScoreManager {
  constructor(mode = 'free') {
    this.mode = mode;
    this.current = 0;
    this._hiScoreKey = () => `flowerMatch_hiScore_${this.mode}`;
    this.hi = this._loadHi();
    this.onChange = null; // callback(current, hi)
  }

  setMode(mode) {
    this.mode = mode;
    this.hi = this._loadHi();
    this.current = 0;
    this._notify();
  }

  add(points) {
    this.current += points;
    if (this.current > this.hi) {
      this.hi = this.current;
      this._saveHi();
    }
    this._notify();
    return this.current;
  }

  reset() {
    this.current = 0;
    this._notify();
  }

  _loadHi() {
    try {
      return parseInt(localStorage.getItem(this._hiScoreKey()) || '0', 10);
    } catch {
      return 0;
    }
  }

  _saveHi() {
    try {
      localStorage.setItem(this._hiScoreKey(), String(this.hi));
    } catch {
      // Ignore storage errors
    }
  }

  _notify() {
    if (this.onChange) this.onChange(this.current, this.hi);
  }

  /** Calculate match score based on match length and chain depth */
  static matchScore(matchLen, chainDepth) {
    let base;
    if (matchLen === 3)      base = 100;
    else if (matchLen === 4) base = 200;
    else                     base = 500; // 5+
    const multiplier = chainDepth > 0 ? (chainDepth + 1) : 1;
    return base * multiplier;
  }

  /** Format number with commas */
  static format(n) {
    return n.toLocaleString('ja-JP');
  }
}
