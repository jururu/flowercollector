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

  /* ---------- Game objects ---------- */
  let currentMode = 'free';
  const scoreManager = new ScoreManager('free');

  let board       = null;
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

    // Update mode button states
    btnFree.classList.toggle('active', mode === 'free');
    btnChallenge.classList.toggle('active', mode === 'challenge');

    // Destroy old board
    if (inputHandler) inputHandler.refresh();
    boardContainer.innerHTML = '';

    // Create new board
    board = new Board(boardContainer);

    board.onScore = (points, chainDepth, cx, cy) => {
      scoreManager.add(points);
      spawnScorePopup(cx, cy - 20, points);
    };

    board.onChain = (chainDepth, cx, cy) => {
      // Show chain display in header area
      chainDisplay.textContent = `${chainDepth + 1} Chain!`;
      chainDisplay.classList.remove('hidden');
      clearTimeout(board._chainHideTimer);
      board._chainHideTimer = setTimeout(() => {
        chainDisplay.classList.add('hidden');
      }, 1200);

      // Popup near the board
      spawnChainPopup(cx, cy - 40, chainDepth);
    };

    board.onDeadlock = async () => {
      shuffleOverlay.classList.remove('hidden');
      await new Promise(r => setTimeout(r, 600));
      shuffleOverlay.classList.add('hidden');
    };

    // Create input handler
    inputHandler = new InputHandler(board, boardContainer);

    // Trigger initial score display
    scoreManager._notify();
  }

  /* ---------- Mode button handlers ---------- */
  btnFree.addEventListener('click', () => {
    if (currentMode !== 'free') startGame('free');
  });

  btnChallenge.addEventListener('click', () => {
    // Challenge mode will be fully implemented in Phase 3.
    // For now start the same free game just to keep the button responsive.
    if (currentMode !== 'challenge') startGame('challenge');
  });

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
