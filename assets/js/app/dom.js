/* dom */
/* grab references to dom elements */
/* global Raffler */

// DOM > main divs/elements
Raffler.dom = {
  'body': document.querySelector('body'),
  'title': document.querySelector('header .title'),
  'navOverlay': document.getElementById('nav-overlay'),
  'navContent': document.getElementById('nav-content'),
  'settingsPanel': document.getElementById('settings-panel'),
  'settingsShowDebug': document.querySelector('.setting-row.debug'),
  'settingsDebug': document.getElementById('settings-debug'),
  'mainContent': document.getElementById('main-content'),
  'itemsCycle': document.getElementById('items-cycle'),
  'itemsGraph': document.getElementById('items-graph'),
  'pickWinnerContainer': document.getElementById('pick-winner-container'),
  'resultsWrapper': document.getElementById('results-wrapper'),
  'resultsCount': document.querySelector('#results-wrapper h3 span'),
  'resultsContent': document.querySelector('#results-wrapper div ul'),
  'chosenConfirm': document.getElementById('chosen-confirm'),
  'userItemsManager': document.getElementById('user-items-manager'),
  'userItemsClearDialog': document.getElementById('user-items-clear-dialog'),
  'footer': document.querySelector('.footer-container')
}

// DOM > interactive elements
Raffler.dom.interactive = {
  'btnNav': document.getElementById('button-nav'),
  'btnNavClose': document.getElementById('button-nav-close'),
  'btnHelp': document.getElementById('button-help'),
  'btnSettings': document.getElementById('button-settings'),
  'btnShowDebugSettings': document.getElementById('button-setting-show-debug'),
  'itemsUser': document.getElementById('items-user'),
  'itemsUserCount': document.getElementById('items-user-count'),
  'btnItemsUserSync': document.getElementById('button-items-user-sync'),
  'btnPickWinner': document.getElementById('button-pick-winner'),
  'btnChosenConfirmYes': document.getElementById('button-confirm-yes'),
  'btnChosenConfirmNo': document.getElementById('button-confirm-no'),
  'btnExportResults': document.getElementById('button-export-results')
}

Raffler.dom.debug = {
  'btnShowConfig': document.getElementById('button-show-config'),
  'container': document.getElementById('debug-buttons'),
  'debugItemsAvailable': document.getElementById('debug-items-available'),
  'debugItemsAvailableCount': document.getElementById('debug-items-available-count'),
  'debugItemsChosen': document.getElementById('debug-items-chosen'),
  'debugItemsChosenCount': document.getElementById('debug-items-chosen-count'),
  'timesRun': document.getElementById('text-setting-timesrun-value'),
  'btnTimerStart': document.getElementById('button-timer-start'),
  'btnTimerStop': document.getElementById('button-timer-stop'),
  'stageValue': document.getElementById('text-setting-stage-value'),
  'intervalValue': document.getElementById('range-interval-value'),
  'multiplyValue': document.getElementById('text-setting-multiply-value'),
  'btnTestVisualWrapper': document.getElementById('buttons-test-visual'),
  'btnTestVisual': document.getElementsByClassName('button-test-visual'),
  'btnResetCountdown': document.getElementById('button-reset-countdown'),
  'btnResetAll': document.getElementById('button-reset-all')
}
