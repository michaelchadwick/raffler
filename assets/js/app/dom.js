/* dom */
/* grab references to dom elements */
/* global Raffler */

// DOM > main divs/elements
Raffler.dom = {
  'body': document.querySelector('body'),
  'title': document.querySelector('header .title'),
  'navOverlay': document.getElementById('nav-overlay'),
  'navContent': document.getElementById('nav-content'),
  'btnNav': document.getElementById('button-nav'),
  'btnNavClose': document.getElementById('button-nav-close'),
  'btnHelp': document.getElementById('button-help'),
  'btnSettings': document.getElementById('button-settings'),
  'btnShowDebugSettings': document.getElementById('button-setting-show-debug'),
  'settingsPanel': document.getElementById('settings-panel'),
  'btnSettingsPanelClose': document.getElementById('button-settings-panel-close'),
  'settingsShowDebug': document.querySelector('.setting-row.debug'),
  'settingsDebugContainer': document.getElementById('settings-debug-container'),
  'itemsAvailable': document.getElementById('items-available'),
  'itemsAvailableCount': document.getElementById('items-available-count'),
  'itemsChosen': document.getElementById('items-chosen'),
  'itemsChosenCount': document.getElementById('items-chosen-count'),
  'mainContent': document.getElementById('main-content'),
  'itemsCycle': document.getElementById('items-cycle'),
  'itemsCycleStart': document.getElementById('message-start'),
  'itemsCycleEmpty': document.getElementById('message-empty'),
  'itemsCycleLimit': document.getElementById('message-limit'),
  'pickWinnerContainer': document.getElementById('pick-winner-container'),
  'btnPickWinner': document.getElementById('button-pick-winner'),
  'btnChosenConfirmYes': document.getElementById('button-confirm-yes'),
  'btnChosenConfirmNo': document.getElementById('button-confirm-no'),
  'btnExportResults': document.getElementById('button-export-results'),
  'resultsWrapper': document.getElementById('results-wrapper'),
  'resultsCount': document.querySelector('#results-wrapper h3 span'),
  'resultsContent': document.querySelector('#results-wrapper div ul'),
  'chosenConfirm': document.getElementById('chosen-confirm'),
  'footer': document.querySelector('.footer-container')
}

Raffler.dom.debug = {
  'btnShowConfig': document.getElementById('button-show-config'),
  'container': document.getElementById('debug-buttons'),
  'itemsGraph': document.getElementById('items-graph'),
  'btnTestVisualWrapper': document.getElementById('buttons-test-visual'),
  'btnTestVisual': document.getElementsByClassName('button-test-visual'),
  'btnTestSoundCountdown': document.getElementById('button-test-sound-countdown'),
  'btnTestSoundVictory': document.getElementById('button-test-sound-victory'),
  'timesRun': document.getElementById('text-setting-timesrun-value'),
  'btnTimerStart': document.getElementById('button-timer-start'),
  'btnTimerStop': document.getElementById('button-timer-stop'),
  'stageValue': document.getElementById('text-setting-stage-value'),
  'intervalValue': document.getElementById('range-interval-value'),
  'multiplyValue': document.getElementById('text-setting-multiply-value'),
  'btnResetCountdown': document.getElementById('button-reset-countdown'),
  'btnResetAll': document.getElementById('button-reset-all')
}
