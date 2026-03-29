'use strict';

/* ===================================================
   AudioEngine
   Web Audio API — マリンバ系SE波形合成
   ※ AudioContext は最初のユーザー操作後に初期化（autoplay policy対策）
   =================================================== */

class AudioEngine {
  constructor() {
    this._ctx         = null;
    this._seGain      = null;   // dry master
    this._convolver   = null;   // reverb convolver
    this._reverbGain  = null;   // wet master
    this._seEnabled   = true;
    this._seVolume    = 0.5;
    this._inited      = false;

    this._loadSettings();
  }

  /* ---------- Lazy init ---------- */

  /** Call on first user interaction to unlock AudioContext */
  resume() {
    this._init();
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  _init() {
    if (this._inited) return;
    this._inited = true;

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    this._ctx = new AC();
    const ctx = this._ctx;

    /* --- Routing ---
       OscillatorNode → EnvelopeGain ──► seGain (dry) ──► destination
                                     ↘► convolver ──► reverbGain (wet) ──► destination
    */

    // Dry bus
    this._seGain = ctx.createGain();
    this._seGain.gain.value = this._seVolume * 0.78;
    this._seGain.connect(ctx.destination);

    // Reverb bus
    this._convolver  = this._buildImpulse();
    this._reverbGain = ctx.createGain();
    this._reverbGain.gain.value = this._seVolume * 0.22;
    this._convolver.connect(this._reverbGain);
    this._reverbGain.connect(ctx.destination);
  }

  /** Short exponential-decay noise impulse response (≈280ms) */
  _buildImpulse() {
    const ctx = this._ctx;
    const len = Math.floor(ctx.sampleRate * 0.28);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
    }
    const cv = ctx.createConvolver();
    cv.buffer = buf;
    return cv;
  }

  /* ---------- Low-level synthesis ---------- */

  /**
   * Schedule a marimba-like tone.
   * @param {number} freq      Frequency in Hz
   * @param {number} relVol    Relative volume (0–1), multiplied by master vol
   * @param {number} durMs     Note duration in ms (attack+decay)
   * @param {number} tOffset   Scheduled offset from now in seconds
   */
  _tone(freq, relVol, durMs, tOffset = 0) {
    if (!this._seEnabled || !this._ctx) return;
    const ctx = this._ctx;
    const t0  = ctx.currentTime + tOffset;
    const vol = relVol * this._seVolume;
    const dur = Math.max(durMs, 25) / 1000;

    /* Main: triangle (warm, mallet-like) */
    const tri = ctx.createOscillator();
    tri.type = 'triangle';
    tri.frequency.value = freq;

    /* Short attack harmonic overlay for "click" (marimba transient) */
    const click     = ctx.createOscillator();
    click.type      = 'sine';
    click.frequency.value = freq * 3.5; // slightly inharmonic for wood texture
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(vol * 0.20, t0);
    clickGain.gain.linearRampToValueAtTime(0, t0 + 0.013);

    /* Envelope: fast attack (4ms), exponential decay */
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vol, t0 + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    /* Connect */
    tri.connect(env);
    click.connect(clickGain);
    clickGain.connect(env);
    env.connect(this._seGain);
    env.connect(this._convolver);

    tri.start(t0);   tri.stop(t0 + dur + 0.06);
    click.start(t0); click.stop(t0 + 0.018);
  }

  /**
   * Schedule a frequency-slide (glissando).
   * @param {number} f0     Start frequency
   * @param {number} f1     End frequency
   * @param {number} relVol
   * @param {number} durMs
   * @param {number} tOffset
   */
  _slide(f0, f1, relVol, durMs, tOffset = 0) {
    if (!this._seEnabled || !this._ctx) return;
    const ctx = this._ctx;
    const t0  = ctx.currentTime + tOffset;
    const vol = relVol * this._seVolume;
    const dur = Math.max(durMs, 25) / 1000;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t0 + dur * 0.82);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(env);
    env.connect(this._seGain);
    env.connect(this._convolver);

    osc.start(t0); osc.stop(t0 + dur + 0.06);
  }

  /**
   * Noise burst (for impact / special-piece sounds).
   * @param {number} relVol
   * @param {number} durMs
   * @param {number} cutoff   Low-pass cutoff Hz
   * @param {number} tOffset
   */
  _noise(relVol, durMs, cutoff = 1200, tOffset = 0) {
    if (!this._seEnabled || !this._ctx) return;
    const ctx   = this._ctx;
    const t0    = ctx.currentTime + tOffset;
    const vol   = relVol * this._seVolume;
    const dur   = Math.max(durMs, 25) / 1000;
    const sr    = ctx.sampleRate;
    const frame = Math.ceil(dur * sr);

    const buf = ctx.createBuffer(1, frame, sr);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < frame; i++) d[i] = (Math.random() * 2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = cutoff;

    const env = ctx.createGain();
    env.gain.setValueAtTime(vol, t0);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(lp);
    lp.connect(env);
    env.connect(this._seGain);

    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  /* ---------- Public SE methods ---------- */

  /** ピース選択: C5, 短いコッ音 */
  playSelect() {
    const N = AudioEngine.NOTES;
    this._tone(N.C5, 0.15, 60);
  }

  /** ピース入れ替え: E5→C5 スライド */
  playSwap() {
    const N = AudioEngine.NOTES;
    this._slide(N.E5, N.C5, 0.2, 100);
  }

  /** 入れ替え失敗: E4→D4 下降 */
  playSwapFail() {
    const N = AudioEngine.NOTES;
    this._slide(N.E4, N.D4, 0.15, 80);
  }

  /**
   * マッチ消去音
   * @param {number} maxLen   最大マッチ数 (3|4|5+)
   */
  playMatch(maxLen) {
    const N = AudioEngine.NOTES;
    if (maxLen >= 5) {
      // C-E-G アルペジオ
      this._tone(N.C5, 0.30, 150, 0.000);
      this._tone(N.E5, 0.30, 130, 0.040);
      this._tone(N.G5, 0.28, 120, 0.080);
    } else if (maxLen === 4) {
      // C5 + 50ms後C6
      this._tone(N.C5, 0.30, 200, 0.000);
      this._tone(N.C6, 0.25, 150, 0.050);
    } else {
      // 3マッチ: コロン単音
      this._tone(N.C5, 0.30, 150, 0);
    }
  }

  /**
   * 連鎖音 — ド→ミ→ソ→ド↑ と上昇していく
   * @param {number} depth  連鎖深さ (1始まり)
   */
  playChain(depth) {
    const N = AudioEngine.NOTES;
    const scale = [N.C5, N.E5, N.G5, N.C6];
    if (depth >= 5) {
      // C6+E6 和音
      this._tone(N.C6, 0.35, 200, 0);
      this._tone(N.E6, 0.30, 180, 0);
    } else {
      this._tone(scale[Math.min(depth - 1, 3)], 0.30, 150, 0);
    }
  }

  /** 落下着地: G4, 軽いトン */
  playLand() {
    const N = AudioEngine.NOTES;
    this._tone(N.G4, 0.10, 40);
  }

  /** ステージクリア: C-E-G-C↑ ファンファーレ */
  playStageClear() {
    const N  = AudioEngine.NOTES;
    const fs = [N.C5, N.E5, N.G5, N.C6];
    const ds = [200, 180, 160, 400];
    fs.forEach((f, i) => this._tone(f, 0.40, ds[i], i * 0.10));
  }

  /** ゲームオーバー: C5→A4→F4 穏やかな下降 */
  playGameOver() {
    const N = AudioEngine.NOTES;
    this._tone(N.C5, 0.25, 300, 0.00);
    this._tone(N.A4, 0.25, 300, 0.15);
    this._tone(N.F4, 0.25, 450, 0.30);
  }

  /* --- Phase 3 stubs (特殊ピース) --- */

  /** ラインピース生成: C5→G5 上昇グリッサンド */
  playLineCreate() {
    const N = AudioEngine.NOTES;
    this._slide(N.C5, N.G5, 0.25, 200);
  }

  /** 爆発ピース生成: C+E+G 和音 */
  playBombCreate() {
    const N = AudioEngine.NOTES;
    this._tone(N.C5, 0.25, 200, 0);
    this._tone(N.E5, 0.22, 180, 0);
    this._tone(N.G5, 0.20, 160, 0);
  }

  /** フラワーボム生成: C-E-G-C↑ キラキラアルペジオ */
  playBombFlowerCreate() {
    const N  = AudioEngine.NOTES;
    const fs = [N.C5, N.E5, N.G5, N.C6];
    fs.forEach((f, i) => this._tone(f, 0.25, 200, i * 0.040));
  }

  /** ラインピース発動 */
  playLineActivate() {
    const N = AudioEngine.NOTES;
    this._slide(N.C6, N.C5, 0.35, 200, 0);
    this._noise(0.18, 200, 2000, 0);
  }

  /** 爆発ピース発動 */
  playBombActivate() {
    const N = AudioEngine.NOTES;
    this._tone(N.C4, 0.35, 300, 0);
    this._noise(0.25, 200, 600, 0.02);
  }

  /** フラワーボム発動 */
  playBombFlowerActivate() {
    const N = AudioEngine.NOTES;
    this._slide(N.C5, N.C6, 0.35, 400, 0);
    this._noise(0.20, 300, 3000, 0.10);
  }

  /* ---------- Volume / Enable ---------- */

  /** SE master volume (0–1) */
  setSEVolume(vol) {
    this._seVolume = Math.max(0, Math.min(1, vol));
    if (this._seGain)     this._seGain.gain.value     = this._seVolume * 0.78;
    if (this._reverbGain) this._reverbGain.gain.value  = this._seVolume * 0.22;
    this._saveSettings();
  }

  /** Toggle SE on/off */
  setSEEnabled(on) {
    this._seEnabled = !!on;
    this._saveSettings();
  }

  get seVolume()  { return this._seVolume; }
  get seEnabled() { return this._seEnabled; }

  /* ---------- Persistence ---------- */

  _loadSettings() {
    try {
      const v = parseFloat(localStorage.getItem('flowerMatch_seVol') ?? '0.5');
      this._seVolume  = isNaN(v) ? 0.5 : Math.max(0, Math.min(1, v));
      const e = localStorage.getItem('flowerMatch_seEnabled');
      this._seEnabled = e !== 'false';
    } catch { /* ignore */ }
  }

  _saveSettings() {
    try {
      localStorage.setItem('flowerMatch_seVol',     String(this._seVolume));
      localStorage.setItem('flowerMatch_seEnabled',  String(this._seEnabled));
    } catch { /* ignore */ }
  }
}

/* --- Note frequency table (Hz) --- */
AudioEngine.NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 784.00, A5: 880.00,
  C6: 1046.50, E6: 1318.51, G6: 1567.98,
};
