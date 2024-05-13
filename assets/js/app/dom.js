/* dom */
/* grab references to dom elements */
/* global Raffler */

// DOM > main divs/elements
Raffler.dom = {
  body: document.querySelector('body'),
  settingsPanel: document.getElementById('settings-panel'),
  mainContent: document.getElementById('main-content'),
  itemsCycle: document.getElementById('items-cycle'),
  itemsCycleStart: document.getElementById('message-start'),
  itemsCycleEmpty: document.getElementById('message-empty'),
  itemsCycleLimit: document.getElementById('message-limit'),
  pickWinnerContainer: document.getElementById('pick-winner-container'),
  btnPickWinner: document.getElementById('button-pick-winner'),
  btnChosenConfirmYes: document.getElementById('button-confirm-yes'),
  btnChosenConfirmNo: document.getElementById('button-confirm-no'),
  btnExportResults: document.getElementById('button-export-results'),
  resultsWrapper: document.getElementById('results-wrapper'),
  resultsCount: document.querySelector('#results-count'),
  resultsList: document.querySelector('#results-list ul'),
  chosenConfirm: document.getElementById('chosen-confirm'),
  footer: document.querySelector('.footer-container'),
}

// DOM > local debug-only stuff
Raffler.dom.debug = {
  itemsGraph: document.getElementById('items-graph'),
}

// DOM > header
Raffler.dom.header = {
  btnNav: document.getElementById('button-nav'),
  navOverlay: document.getElementById('nav-overlay'),
  navContent: document.getElementById('nav-content'),
  btnNavClose: document.getElementById('button-nav-close'),
  btnHelp: document.getElementById('button-help'),
  title: document.querySelector('header .title'),
  btnSettings: document.getElementById('button-settings'),
}

// DOM > header > debug
Raffler.dom.header.debug = {
  container: document.getElementById('debug-buttons'),
  btnShowConfig: document.getElementById('button-show-config'),
}

// DOM > settings sidebar
Raffler.dom.settings = {
  btnSettingsPanelClose: document.getElementById('button-settings-panel-close'),
  itemsAvailable: document.getElementById('items-available'),
  itemsAvailableCount: document.getElementById('items-available-count'),
  itemsChosen: document.getElementById('items-chosen'),
  itemsChosenCount: document.getElementById('items-chosen-count'),
  settingsShowDebug: document.querySelector('.setting-row.debug'),
  btnShowDebugSettings: document.getElementById('button-setting-show-debug'),
}

// DOM > settings sidebar > debug
Raffler.dom.settings.debug = {
  container: document.getElementById('settings-debug-container'),
  spanAudioPlaying: document.getElementById('audioPlaying'),
  btnTestSoundCountdown: document.getElementById('button-test-sound-countdown'),
  btnTestSoundVictory: document.getElementById('button-test-sound-victory'),
  btnTestVisualWrapper: document.getElementById('buttons-test-visual'),
  btnTestVisual: document.getElementsByClassName('button-test-visual'),
  timesRun: document.getElementById('text-setting-timesrun-value'),
  btnTimerStart: document.getElementById('button-timer-start'),
  btnTimerStop: document.getElementById('button-timer-stop'),
  stageValue: document.getElementById('text-setting-stage-value'),
  intervalValue: document.getElementById('range-interval-value'),
  multiplyValue: document.getElementById('text-setting-multiply-value'),
  btnUndoChoices: document.getElementById('button-undo-choices'),
  btnResetAll: document.getElementById('button-reset-all'),
}
