/**
 * app.js
 * Main application controller for the Sorting Visualizer.
 * Manages state, UI interactions, playback, and rendering.
 */

(function () {
  'use strict';

  /* ========================================================
     STATE
     ======================================================== */
  const state = {
    array: [],
    steps: [],
    currentStep: 0,
    isPlaying: false,
    isPaused: false,
    isSorting: false,
    playbackTimer: null,
    selectedAlgorithm: 'bubble',
    arraySize: 30,
    speed: 3, // 1-5

    // Live counters
    comparisons: 0,
    swaps: 0,
    arrayAccesses: 0,

    // Timing
    startTime: null,
    elapsedMs: 0,
  };

  /* ========================================================
     DOM REFERENCES
     ======================================================== */
  const dom = {
    algorithmSelect: document.getElementById('algorithm-select'),
    sizeSlider: document.getElementById('size-slider'),
    sizeValue: document.getElementById('size-value'),
    speedSlider: document.getElementById('speed-slider'),
    speedValue: document.getElementById('speed-value'),
    btnGenerate: document.getElementById('btn-generate'),
    btnPlay: document.getElementById('btn-play'),
    btnPause: document.getElementById('btn-pause'),
    btnStep: document.getElementById('btn-step'),
    btnReset: document.getElementById('btn-reset'),
    playIcon: document.getElementById('play-icon'),
    barsWrapper: document.getElementById('bars-wrapper'),
    stepCounter: document.getElementById('step-counter'),
    stepLogContent: document.getElementById('step-log-content'),
    btnClearLog: document.getElementById('btn-clear-log'),
    algoInfoTitle: document.getElementById('algo-info-title'),
    algoInfoDesc: document.getElementById('algo-info-desc'),
    complexityBest: document.getElementById('complexity-best'),
    complexityAvg: document.getElementById('complexity-avg'),
    complexityWorst: document.getElementById('complexity-worst'),
    complexitySpace: document.getElementById('complexity-space'),

    // Live counters
    comparisonsCount: document.getElementById('comparisons-count'),
    swapsCount: document.getElementById('swaps-count'),
    accessesCount: document.getElementById('accesses-count'),
    statComparisons: document.getElementById('stat-comparisons'),
    statSwaps: document.getElementById('stat-swaps'),
    statAccesses: document.getElementById('stat-accesses'),

    // Performance overlay
    perfOverlay: document.getElementById('perf-overlay'),
    btnClosePerf: document.getElementById('btn-close-perf'),
    perfTimeValue: document.getElementById('perf-time-value'),
    perfComparisons: document.getElementById('perf-comparisons'),
    perfSwaps: document.getElementById('perf-swaps'),
    perfAccesses: document.getElementById('perf-accesses'),
    perfBarCmp: document.getElementById('perf-bar-cmp'),
    perfBarSwp: document.getElementById('perf-bar-swp'),
    perfBarAcc: document.getElementById('perf-bar-acc'),
    perfBarCmpVal: document.getElementById('perf-bar-cmp-val'),
    perfBarSwpVal: document.getElementById('perf-bar-swp-val'),
    perfBarAccVal: document.getElementById('perf-bar-acc-val'),

    // Custom input
    customInput: document.getElementById('custom-input'),
    btnApplyInput: document.getElementById('btn-apply-input'),
    inputHint: document.getElementById('input-hint'),
  };

  /* ========================================================
     SPEED MAP  (delay in ms per step)
     ======================================================== */
  const speedMap = {
    1: 800,  // Very Slow
    2: 400,  // Slow
    3: 150,  // Medium
    4: 50,   // Fast
    5: 10,   // Very Fast
  };

  const speedLabels = {
    1: 'Very Slow',
    2: 'Slow',
    3: 'Medium',
    4: 'Fast',
    5: 'Very Fast',
  };

  /* ========================================================
     HELPERS
     ======================================================== */
  function generateRandomArray(size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 95) + 5); // 5–99
    }
    return arr;
  }

  function getDelay() {
    return speedMap[state.speed] || 150;
  }

  function formatNumber(n) {
    return n.toLocaleString();
  }

  /* ========================================================
     LIVE COUNTERS
     ======================================================== */
  function resetCounters() {
    state.comparisons = 0;
    state.swaps = 0;
    state.arrayAccesses = 0;
    state.startTime = null;
    state.elapsedMs = 0;
    updateCounterDisplay();
  }

  function updateCountersForStep(step) {
    // Clear active highlights
    dom.statComparisons.classList.remove('active');
    dom.statSwaps.classList.remove('active');
    dom.statAccesses.classList.remove('active');

    if (step.type === 'compare') {
      state.comparisons++;
      // Array accesses: reading each compared element
      state.arrayAccesses += step.comparing.length;
      dom.statComparisons.classList.add('active');
      dom.statAccesses.classList.add('active');
    } else if (step.type === 'swap') {
      state.swaps++;
      // Array accesses: read + write for each swapped element
      state.arrayAccesses += step.swapping.length * 2;
      dom.statSwaps.classList.add('active');
      dom.statAccesses.classList.add('active');
    }

    updateCounterDisplay();
  }

  function updateCounterDisplay() {
    dom.comparisonsCount.textContent = formatNumber(state.comparisons);
    dom.swapsCount.textContent = formatNumber(state.swaps);
    dom.accessesCount.textContent = formatNumber(state.arrayAccesses);
  }

  /* ========================================================
     RENDERING
     ======================================================== */
  function renderBars(array, comparing = [], swapping = [], sorted = [], pivot = null) {
    const wrapper = dom.barsWrapper;
    const maxVal = Math.max(...array, 1);
    const showValues = array.length <= 40;

    // Toggle value visibility class
    wrapper.classList.toggle('show-values', showValues);

    // If bar count matches, update in place; otherwise rebuild
    const children = wrapper.children;
    if (children.length !== array.length) {
      wrapper.innerHTML = '';
      for (let i = 0; i < array.length; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.innerHTML = `<span class="bar-value">${array[i]}</span>`;
        const heightPct = (array[i] / maxVal) * 100;
        bar.style.height = `${heightPct}%`;
        applyBarState(bar, i, comparing, swapping, sorted, pivot);
        wrapper.appendChild(bar);
      }
    } else {
      for (let i = 0; i < array.length; i++) {
        const bar = children[i];
        const heightPct = (array[i] / maxVal) * 100;
        bar.style.height = `${heightPct}%`;
        bar.querySelector('.bar-value').textContent = array[i];
        applyBarState(bar, i, comparing, swapping, sorted, pivot);
      }
    }
  }

  function applyBarState(bar, index, comparing, swapping, sorted, pivot) {
    bar.classList.remove('comparing', 'swapping', 'sorted', 'pivot', 'celebrating');
    if (swapping.includes(index)) {
      bar.classList.add('swapping');
    } else if (comparing.includes(index)) {
      bar.classList.add('comparing');
    } else if (pivot !== null && index === pivot) {
      bar.classList.add('pivot');
    } else if (sorted.includes(index)) {
      bar.classList.add('sorted');
    }
  }

  function updateStepCounter() {
    const total = state.steps.length;
    const current = state.currentStep;
    dom.stepCounter.textContent = total > 0 ? `${current} / ${total}` : '0 / 0';
  }

  function addLogEntry(description, type) {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;

    let prefix;
    switch (type) {
      case 'compare': prefix = '[cmp]'; break;
      case 'swap': prefix = '[swp]'; break;
      case 'sorted': prefix = '[done]'; break;
      case 'pivot': prefix = '[pvt]'; break;
      default: prefix = '[info]'; break;
    }

    entry.innerHTML = `<span class="log-prefix">${prefix}</span> ${description}`;
    dom.stepLogContent.appendChild(entry);
    dom.stepLogContent.scrollTop = dom.stepLogContent.scrollHeight;

    // Limit log entries to prevent memory issues
    while (dom.stepLogContent.children.length > 200) {
      dom.stepLogContent.removeChild(dom.stepLogContent.firstChild);
    }
  }

  function clearLog() {
    dom.stepLogContent.innerHTML = '';
  }

  /* ========================================================
     ALGORITHM INFO
     ======================================================== */
  function updateAlgorithmInfo() {
    const info = SortingAlgorithms.algorithmInfo[state.selectedAlgorithm];
    if (!info) return;
    dom.algoInfoTitle.textContent = info.name;
    dom.algoInfoDesc.textContent = info.description;
    dom.complexityBest.textContent = info.best;
    dom.complexityAvg.textContent = info.avg;
    dom.complexityWorst.textContent = info.worst;
    dom.complexitySpace.textContent = info.space;
  }

  /* ========================================================
     PERFORMANCE OVERLAY
     ======================================================== */
  function showPerformanceOverlay() {
    // Calculate elapsed time
    state.elapsedMs = state.startTime ? (performance.now() - state.startTime) : 0;

    // Populate values
    dom.perfTimeValue.textContent = `${state.elapsedMs.toFixed(1)} ms`;
    dom.perfComparisons.textContent = formatNumber(state.comparisons);
    dom.perfSwaps.textContent = formatNumber(state.swaps);
    dom.perfAccesses.textContent = formatNumber(state.arrayAccesses);

    // Chart bar values
    dom.perfBarCmpVal.textContent = formatNumber(state.comparisons);
    dom.perfBarSwpVal.textContent = formatNumber(state.swaps);
    dom.perfBarAccVal.textContent = formatNumber(state.arrayAccesses);

    // Calculate proportional widths (max value = 100%)
    const maxVal = Math.max(state.comparisons, state.swaps, state.arrayAccesses, 1);
    const cmpPct = (state.comparisons / maxVal) * 100;
    const swpPct = (state.swaps / maxVal) * 100;
    const accPct = (state.arrayAccesses / maxVal) * 100;

    // Reset bars first, then animate
    dom.perfBarCmp.style.width = '0%';
    dom.perfBarSwp.style.width = '0%';
    dom.perfBarAcc.style.width = '0%';

    // Show overlay
    dom.perfOverlay.style.display = 'flex';

    // Animate bars after a small delay for the transition to kick in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dom.perfBarCmp.style.width = `${Math.max(cmpPct, 2)}%`;
        dom.perfBarSwp.style.width = `${Math.max(swpPct, 2)}%`;
        dom.perfBarAcc.style.width = `${Math.max(accPct, 2)}%`;
      });
    });

    // Log final stats
    addLogEntry(
      `Completed in ${state.elapsedMs.toFixed(1)}ms — ${formatNumber(state.comparisons)} comparisons, ${formatNumber(state.swaps)} swaps, ${formatNumber(state.arrayAccesses)} array accesses`,
      'info'
    );
  }

  function hidePerformanceOverlay() {
    dom.perfOverlay.style.display = 'none';
  }

  /* ========================================================
     PLAYBACK CONTROLS
     ======================================================== */
  function generateNewArray() {
    stopPlayback();
    hidePerformanceOverlay();
    state.array = generateRandomArray(state.arraySize);
    state.steps = [];
    state.currentStep = 0;
    state.isSorting = false;
    resetCounters();
    renderBars(state.array);
    updateStepCounter();
    clearLog();
    addLogEntry('New array generated. Press Play to begin sorting.', 'info');
    updateButtonStates();
  }

  function prepareSteps() {
    const info = SortingAlgorithms.algorithmInfo[state.selectedAlgorithm];
    if (!info) return;
    state.steps = info.fn([...state.array]);
    state.currentStep = 0;
    state.isSorting = true;
    resetCounters();
    updateStepCounter();
  }

  function showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= state.steps.length) return;

    const step = state.steps[stepIndex];
    state.currentStep = stepIndex + 1;
    renderBars(step.array, step.comparing, step.swapping, step.sorted, step.pivot);
    updateStepCounter();
    addLogEntry(step.description, step.type);

    // Update live counters
    updateCountersForStep(step);

    // On final step, trigger celebration
    if (stepIndex === state.steps.length - 1) {
      onSortComplete();
    }
  }

  function play() {
    if (!state.isSorting) {
      prepareSteps();
      clearLog();
      addLogEntry(`Running ${SortingAlgorithms.algorithmInfo[state.selectedAlgorithm].name}...`, 'info');
    }

    if (state.currentStep >= state.steps.length) {
      // Re-run from start
      state.currentStep = 0;
      resetCounters();
      clearLog();
      addLogEntry(`Re-running ${SortingAlgorithms.algorithmInfo[state.selectedAlgorithm].name}...`, 'info');
    }

    // Start timing (only on first play or re-run)
    if (!state.startTime || state.currentStep === 0) {
      state.startTime = performance.now();
    }

    state.isPlaying = true;
    state.isPaused = false;
    hidePerformanceOverlay();
    updateButtonStates();
    playNextStep();
  }

  function playNextStep() {
    if (!state.isPlaying || state.currentStep >= state.steps.length) {
      if (state.currentStep >= state.steps.length) {
        state.isPlaying = false;
        updateButtonStates();
      }
      return;
    }

    showStep(state.currentStep);

    state.playbackTimer = setTimeout(() => {
      playNextStep();
    }, getDelay());
  }

  function pause() {
    state.isPlaying = false;
    state.isPaused = true;
    clearTimeout(state.playbackTimer);
    updateButtonStates();
  }

  function stepForward() {
    if (!state.isSorting) {
      prepareSteps();
      clearLog();
      addLogEntry(`Stepping through ${SortingAlgorithms.algorithmInfo[state.selectedAlgorithm].name}...`, 'info');
      state.startTime = performance.now();
    }

    if (state.currentStep < state.steps.length) {
      showStep(state.currentStep);
    }
    updateButtonStates();
  }

  function reset() {
    stopPlayback();
    hidePerformanceOverlay();
    state.currentStep = 0;
    state.steps = [];
    state.isSorting = false;
    resetCounters();
    renderBars(state.array);
    updateStepCounter();
    clearLog();
    addLogEntry('Reset. Press Play to begin sorting.', 'info');
    updateButtonStates();
  }

  function stopPlayback() {
    state.isPlaying = false;
    state.isPaused = false;
    clearTimeout(state.playbackTimer);
  }

  function onSortComplete() {
    state.isPlaying = false;
    updateButtonStates();

    // Clear active stat highlights
    dom.statComparisons.classList.remove('active');
    dom.statSwaps.classList.remove('active');
    dom.statAccesses.classList.remove('active');

    // Celebration wave animation
    const bars = dom.barsWrapper.children;
    for (let i = 0; i < bars.length; i++) {
      setTimeout(() => {
        bars[i].classList.add('celebrating');
        setTimeout(() => bars[i].classList.remove('celebrating'), 300);
      }, i * 30);
    }

    // Show performance overlay after celebration
    const celebrationDuration = bars.length * 30 + 400;
    setTimeout(() => {
      showPerformanceOverlay();
    }, celebrationDuration);
  }

  function updateButtonStates() {
    const canPlay = !state.isPlaying;
    const canPause = state.isPlaying;
    const canStep = !state.isPlaying && (state.currentStep < state.steps.length || !state.isSorting);
    const canReset = state.isSorting;

    dom.btnPlay.disabled = !canPlay;
    dom.btnPause.disabled = !canPause;
    dom.btnStep.disabled = !canStep;
    dom.btnReset.disabled = !canReset;

    // Disable controls that shouldn't change during playback
    dom.algorithmSelect.disabled = state.isPlaying;
    dom.sizeSlider.disabled = state.isPlaying || state.isSorting;
  }

  /* ========================================================
     EVENT HANDLERS
     ======================================================== */
  dom.algorithmSelect.addEventListener('change', (e) => {
    state.selectedAlgorithm = e.target.value;
    updateAlgorithmInfo();
    if (state.isSorting) {
      reset();
    }
  });

  dom.sizeSlider.addEventListener('input', (e) => {
    state.arraySize = parseInt(e.target.value, 10);
    dom.sizeValue.textContent = state.arraySize;
    generateNewArray();
  });

  dom.speedSlider.addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value, 10);
    dom.speedValue.textContent = speedLabels[state.speed] || 'Medium';
  });

  dom.btnGenerate.addEventListener('click', generateNewArray);
  dom.btnPlay.addEventListener('click', play);
  dom.btnPause.addEventListener('click', pause);
  dom.btnStep.addEventListener('click', stepForward);
  dom.btnReset.addEventListener('click', reset);
  dom.btnClearLog.addEventListener('click', () => {
    clearLog();
    addLogEntry('Log cleared.', 'info');
  });

  // Custom input
  dom.btnApplyInput.addEventListener('click', applyCustomArray);
  dom.customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyCustomArray();
    }
  });
  dom.customInput.addEventListener('input', () => {
    // Reset visual state on typing
    dom.customInput.classList.remove('input-error', 'input-success');
    dom.inputHint.classList.remove('hint-error', 'hint-success');
    dom.inputHint.textContent = 'Comma-separated numbers (1\u201399)';
  });

  // Performance overlay close
  dom.btnClosePerf.addEventListener('click', hidePerformanceOverlay);
  dom.perfOverlay.addEventListener('click', (e) => {
    if (e.target === dom.perfOverlay) hidePerformanceOverlay();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    // Close perf overlay on Escape
    if (e.key === 'Escape' && dom.perfOverlay.style.display !== 'none') {
      hidePerformanceOverlay();
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (state.isPlaying) pause();
        else play();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!state.isPlaying) stepForward();
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        generateNewArray();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        reset();
        break;
    }
  });

  /* ========================================================
     CUSTOM ARRAY INPUT
     ======================================================== */
  function applyCustomArray() {
    const raw = dom.customInput.value.trim();

    if (!raw) {
      setInputState('error', 'Please enter at least one number');
      return;
    }

    // Parse: support comma, space, or semicolon separators
    const tokens = raw.split(/[,;\s]+/).filter(t => t.length > 0);
    const numbers = [];

    for (const token of tokens) {
      const num = Number(token);
      if (!Number.isFinite(num) || num < 1 || num > 999 || !Number.isInteger(num)) {
        setInputState('error', `Invalid value "${token}" — use integers 1–999`);
        return;
      }
      numbers.push(num);
    }

    if (numbers.length < 2) {
      setInputState('error', 'Need at least 2 numbers to sort');
      return;
    }

    if (numbers.length > 100) {
      setInputState('error', 'Maximum 100 elements allowed');
      return;
    }

    // Success — apply the custom array
    stopPlayback();
    hidePerformanceOverlay();
    state.array = numbers;
    state.arraySize = numbers.length;
    state.steps = [];
    state.currentStep = 0;
    state.isSorting = false;

    // Update size slider to reflect actual size
    dom.sizeSlider.value = Math.min(numbers.length, 100);
    dom.sizeValue.textContent = numbers.length;

    resetCounters();
    renderBars(state.array);
    updateStepCounter();
    clearLog();
    addLogEntry(`Custom array applied — ${numbers.length} elements: [${numbers.join(', ')}]`, 'info');
    updateButtonStates();

    setInputState('success', `Applied ${numbers.length} elements ✓`);

    // Clear success state after a moment
    setTimeout(() => {
      dom.customInput.classList.remove('input-success');
      dom.inputHint.classList.remove('hint-success');
      dom.inputHint.textContent = 'Comma-separated numbers (1\u201399)';
    }, 2500);
  }

  function setInputState(type, message) {
    dom.customInput.classList.remove('input-error', 'input-success');
    dom.inputHint.classList.remove('hint-error', 'hint-success');

    if (type === 'error') {
      dom.customInput.classList.add('input-error');
      dom.inputHint.classList.add('hint-error');
      dom.customInput.focus();
    } else if (type === 'success') {
      dom.customInput.classList.add('input-success');
      dom.inputHint.classList.add('hint-success');
    }

    dom.inputHint.textContent = message;
  }

  /* ========================================================
     INITIALIZATION
     ======================================================== */
  function init() {
    updateAlgorithmInfo();
    generateNewArray();
  }

  init();
})();
