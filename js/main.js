'use strict';

/* ===================================================
   Main — entry point
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- DOM refs ---------- */
  const boardContainer    = document.getElementById('board-container');
  const scoreDisplay      = document.getElementById('score-display');
  const hiScoreDisplay    = document.getElementById('hi-score-display');
  const chainDisplay      = document.getElementById('chain-display');
  const btnFree           = document.getElementById('btn-free');
  const btnChallenge      = document.getElementById('btn-challenge');
  const shuffleOverlay    = document.getElementById('shuffle-overlay');

  const timerWrap         = document.getElementById('timer-wrap');
  const timerBarFill      = document.getElementById('timer-bar-fill');
  const stageInfo         = document.getElementById('stage-info');
  const stageDisplay      = document.getElementById('stage-display');
  const goalPanel         = document.getElementById('goal-panel');
  const goalList          = document.getElementById('goal-list');
  const hiStageWrap       = document.getElementById('hi-stage-wrap');
  const hiStageDisplay    = document.getElementById('hi-stage-display');
  const stageclearOverlay = document.getElementById('stageclear-overlay');
  const clearStageText    = document.getElementById('clear-stage-text');
  const gameoverOverlay   = document.getElementById('gameover-overlay');
  const resultStage       = document.getElementById('result-stage');
  const resultScore       = document.getElementById('result-score');
  const resultHiNote      = document.getElementById('result-hi-note');
  const btnRetry          = document.getElementById('btn-retry');

  const btnSEToggle    = document.getElementById('btn-se-toggle');
  const seVolumeSlider = document.getElementById('se-volume');

  /* ---------- Audio ---------- */
  const audio = new AudioEngine();
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

  /* ---------- Game state ---------- */
  let currentMode  = 'free';
  let board        = null;
  let inputHandler = null;
  let timer        = null;
  let stageManager = null;
  let goals        = null;  // { [type]: remainingCount }
  let stageLocked  = false; // prevents re-entrant stage clear / game over

  const scoreManager = new ScoreManager('free');
  scoreManager.onChange = (current, hi) => {
    scoreDisplay.textContent   = ScoreManager.format(current);
    hiScoreDisplay.textContent = ScoreManager.format(hi);
  };

  /* ---------- Goal helpers ---------- */
  function _setupGoals(stage) {
    goals = {};
    goalList.innerHTML = '';
    const target = stageManager.targetPerFlower(stage);

    for (let t = 0; t < 7; t++) {
      goals[t] = target;

      const item = document.createElement('div');
      item.className = 'goal-item';
      item.dataset.type = t;

      const icon = document.createElement('div');
      icon.className = 'goal-flower-icon';
      icon.innerHTML = FLOWER_SVGS[t];

      const cnt = document.createElement('span');
      cnt.className = 'goal-count';
      cnt.textContent = target;

      item.appendChild(icon);
      item.appendChild(cnt);
      goalList.appendChild(item);
    }
  }

  function _updateGoalUI(type) {
    const item = goalList.querySelector(`[data-type="${type}"]`);
    if (!item) return;
    const cnt = item.querySelector('.goal-count');
    if (goals[type] <= 0) {
      cnt.textContent = '✓';
      item.classList.add('done');
    } else {
      cnt.textContent = goals[type];
    }
  }

  function _allGoalsDone() {
    return goals !== null && Object.values(goals).every(v => v <= 0);
  }

  /* ---------- Board callbacks ---------- */
  function _wireBoardCallbacks() {
    board.onScore = (points, chainDepth, cx, cy) => {
      scoreManager.add(points);
      spawnScorePopup(cx, cy - 20, points);
    };

    board.onChain = (chainDepth, cx, cy) => {
      chainDisplay.textContent = `${chainDepth + 1} Chain!`;
      chainDisplay.classList.remove('hidden');
      clearTimeout(board._chainHideTimer);
      board._chainHideTimer = setTimeout(
        () => chainDisplay.classList.add('hidden'), 1200
      );
      spawnChainPopup(cx, cy - 40, chainDepth);
    };

    board.onDeadlock = async () => {
      shuffleOverlay.classList.remove('hidden');
      await new Promise(r => setTimeout(r, 600));
      shuffleOverlay.classList.add('hidden');
    };

    if (currentMode === 'challenge') {
      board.onRemove = (type) => {
        if (!goals || goals[type] === undefined || goals[type] <= 0) return;
        goals[type]--;
        _updateGoalUI(type);
        if (_allGoalsDone()) _handleStageClear();
      };

      board.onMatch = (maxLen, chainDepth) => {
        if (!timer) return;
        timer.addTime(StageManager.timeBonusMatch(maxLen));
        if (chainDepth > 0) timer.addTime(StageManager.timeBonusChain());
      };

      board.onSpecial = () => {
        timer?.addTime(StageManager.timeBonusSpecial());
      };
    }
  }

  /* ---------- Start game ---------- */
  function startGame(mode) {
    if (timer) { timer.stop(); timer = null; }
    stageLocked = false;
    boardContainer.style.filter = '';

    currentMode = mode;
    scoreManager.setMode(mode);

    btnFree.classList.toggle('active', mode === 'free');
    btnChallenge.classList.toggle('active', mode === 'challenge');

    stageclearOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    chainDisplay.classList.add('hidden');

    boardContainer.innerHTML = '';
    board = new Board(boardContainer);
    board.audio = audio;
    _wireBoardCallbacks();

    inputHandler = new InputHandler(board, boardContainer);
    inputHandler.audio = audio;

    if (mode === 'challenge') {
      stageManager = new StageManager();

      timerWrap.classList.remove('hidden');
      stageInfo.classList.remove('hidden');
      goalPanel.classList.remove('hidden');
      hiStageWrap.classList.remove('hidden');

      stageDisplay.textContent   = stageManager.stage;
      hiStageDisplay.textContent = stageManager.hiStage;

      _setupGoals(stageManager.stage);

      timer = new Timer(timerWrap, timerBarFill);
      timer.onExpire = () => _handleGameOver();
      timer.start(stageManager.timerMs());
    } else {
      timerWrap.classList.add('hidden');
      stageInfo.classList.add('hidden');
      goalPanel.classList.add('hidden');
      hiStageWrap.classList.add('hidden');
      stageManager = null;
      goals = null;
    }

    scoreManager._notify();
  }

  /* ---------- Stage clear ---------- */
  async function _handleStageClear() {
    if (stageLocked) return;
    stageLocked = true;
    timer.stop();
    board.isLocked = true;

    clearStageText.textContent = `Stage ${stageManager.stage} クリア！`;
    stageclearOverlay.classList.remove('hidden');
    audio.playStageClear();
    spawnPetalRain(boardContainer.getBoundingClientRect(), 18);

    await new Promise(r => setTimeout(r, 2200));
    stageclearOverlay.classList.add('hidden');

    stageManager.advance();
    stageDisplay.textContent   = stageManager.stage;
    hiStageDisplay.textContent = stageManager.hiStage;

    // Rebuild board for next stage
    boardContainer.innerHTML = '';
    board = new Board(boardContainer);
    board.audio = audio;
    _wireBoardCallbacks();
    inputHandler.board = board;
    inputHandler.refresh();

    _setupGoals(stageManager.stage);
    timer.start(stageManager.timerMs());
    stageLocked = false;
  }

  /* ---------- Game over ---------- */
  function _handleGameOver() {
    if (stageLocked) return;
    stageLocked = true;
    board.isLocked = true;

    boardContainer.style.filter = 'grayscale(0.65) brightness(0.85)';

    resultStage.textContent = stageManager.stage;
    resultScore.textContent = ScoreManager.format(scoreManager.current);
    resultHiNote.textContent =
      (scoreManager.current > 0 && scoreManager.current === scoreManager.hi)
        ? '🎉 ハイスコア！'
        : '';

    gameoverOverlay.classList.remove('hidden');
    audio.playGameOver();
  }

  /* ---------- Retry button ---------- */
  btnRetry.addEventListener('click', () => startGame('challenge'));

  /* ---------- Mode buttons ---------- */
  btnFree.addEventListener('click', () => {
    if (currentMode !== 'free') startGame('free');
  });

  btnChallenge.addEventListener('click', () => {
    if (currentMode !== 'challenge') startGame('challenge');
  });

  /* ---------- AudioContext unlock on first interaction ---------- */
  function _resumeAudio() { audio.resume(); }
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
        inputHandler?.refresh();
      }
    }, 150);
  });

  /* ---------- Boot ---------- */
  startGame('free');
});
