'use strict';

/* ===================================================
   Main — entry point
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- DOM refs ---------- */
  const boardContainer  = document.getElementById('board-container');
  const scoreDisplay    = document.getElementById('score-display');
  const hiScoreDisplay  = document.getElementById('hi-score-display');
  const chainDisplay    = document.getElementById('chain-display');
  const btnFree         = document.getElementById('btn-free');
  const btnChallenge    = document.getElementById('btn-challenge');
  const shuffleOverlay  = document.getElementById('shuffle-overlay');

  const btnSEToggle     = document.getElementById('btn-se-toggle');
  const seVolumeSlider  = document.getElementById('se-volume');

  /* ---------- Audio ---------- */
  const audio = new AudioEngine();

  // Sync initial slider value from persisted settings
  seVolumeSlider.value = audio.seVolume;
  _updateSEToggleUI();

  function _updateSEToggleUI() {
    const on = audio.seEnabled;
    btnSEToggle.textContent = on ? '🔔' : '🔕';
    btnSEToggle.classList.toggle('muted', !on);
    seVolumeSlider.disabled = !on;
    seVolumeSlider.style.opacity = on ? '1' : '0.4';
  }

  btnSEToggle.addEventListener('click', () => {
    audio.resume();
    audio.setSEEnabled(!audio.seEnabled);
    _updateSEToggleUI();
  });

  seVolumeSlider.addEventListener('input', () => {
    audio.resume();
    audio.setSEVolume(parseFloat(seVolumeSlider.value));
  });

  /* ---------- Game objects ---------- */
  let currentMode  = 'free';
  const scoreManager = new ScoreManager('free');

  let board        = null;
  let inputHandler = null;

  /* ---------- Score callbacks ---------- */
  scoreManager.onChange = (current, hi) => {
    scoreDisplay.textContent   = ScoreManager.format(current);
    hiScoreDisplay.textContent = ScoreManager.format(hi);
  };

  /* ---------- Start game ---------- */
  function startGame(mode) {
    currentMode = mode;
    scoreManager.setMode(mode);

    btnFree.classList.toggle('active', mode === 'free');
    btnChallenge.classList.toggle('active', mode === 'challenge');

    if (inputHandler) inputHandler.refresh();
    boardContainer.innerHTML = '';

    // Create board
    board = new Board(boardContainer);
    board.audio = audio; // wire up audio

    board.onScore = (points, chainDepth, cx, cy) => {
      scoreManager.add(points);
      spawnScorePopup(cx, cy - 20, points);
    };

    board.onChain = (chainDepth, cx, cy) => {
      chainDisplay.textContent = `${chainDepth + 1} Chain!`;
      chainDisplay.classList.remove('hidden');
      clearTimeout(board._chainHideTimer);
      board._chainHideTimer = setTimeout(() => {
        chainDisplay.classList.add('hidden');
      }, 1200);
      spawnChainPopup(cx, cy - 40, chainDepth);
    };

    board.onDeadlock = async () => {
      shuffleOverlay.classList.remove('hidden');
      await new Promise(r => setTimeout(r, 600));
      shuffleOverlay.classList.add('hidden');
    };

    // Create input handler
    inputHandler = new InputHandler(board, boardContainer);
    inputHandler.audio = audio; // wire up audio

    scoreManager._notify();
  }

  /* ---------- Mode buttons ---------- */
  btnFree.addEventListener('click', () => {
    if (currentMode !== 'free') startGame('free');
  });

  btnChallenge.addEventListener('click', () => {
    // Challenge mode will be fully implemented in Phase 3.
    if (currentMode !== 'challenge') startGame('challenge');
  });

  /* ---------- Unlock AudioContext on first interaction ---------- */
  function _resumeAudio() {
    audio.resume();
  }
  document.addEventListener('mousedown',  _resumeAudio, { once: true });
  document.addEventListener('touchstart', _resumeAudio, { once: true });
  document.addEventListener('keydown',    _resumeAudio, { once: true });

  /* ---------- Window resize ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (board) {
        board.resize();
        inputHandler && inputHandler.refresh();
      }
    }, 150);
  });

  /* ---------- Boot ---------- */
  startGame('free');
});
