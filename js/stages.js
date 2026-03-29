'use strict';

/* ===================================================
   StageManager — チャレンジモードのステージ管理
   =================================================== */
class StageManager {
  constructor() {
    this.stage   = 1;
    this._hiKey  = 'flowerMatch_hiStage';
    this.hiStage = this._load();
    this.onChange = null; // (stage, hiStage) => void
  }

  /* ---------- Stage rules ---------- */

  /** 各花の目標消去数: Stage N → N+2 個 */
  targetPerFlower(stage = this.stage) {
    return stage + 2;
  }

  /** 制限時間 ms: 30s - (stage-1), 下限 15s */
  timerMs(stage = this.stage) {
    return Math.max(30 - (stage - 1), 15) * 1000;
  }

  /* ---------- Time bonuses (仕様 §タイマー) ---------- */
  static timeBonusMatch(matchLen) {
    if (matchLen >= 5) return 4000;
    if (matchLen === 4) return 2500;
    return 1500; // 3-match
  }
  static timeBonusChain()   { return 1000; }  // 2連鎖以降 +1.0s
  static timeBonusSpecial() { return 3000; }  // 特殊ピース発動 +3.0s

  /* ---------- Score multiplier (spec §スコア, 連鎖ボーナス) ---------- */
  // Already handled in ScoreManager.matchScore — nothing extra needed here.

  /* ---------- Lifecycle ---------- */

  advance() {
    this.stage++;
    if (this.stage > this.hiStage) {
      this.hiStage = this.stage;
      this._save();
    }
    this.onChange && this.onChange(this.stage, this.hiStage);
  }

  reset() {
    this.stage = 1;
    this.onChange && this.onChange(this.stage, this.hiStage);
  }

  /* ---------- Persistence ---------- */

  _load() {
    try { return parseInt(localStorage.getItem(this._hiKey) || '0', 10) || 0; }
    catch { return 0; }
  }

  _save() {
    try { localStorage.setItem(this._hiKey, String(this.hiStage)); }
    catch { /* ignore */ }
  }
}
