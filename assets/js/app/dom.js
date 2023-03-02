/* dom */
/* grab references to dom elements */
/* global Raffler */

// DOM > main divs/elements
Raffler.dom = {
  'body': document.querySelector('body'),
  'title': document.querySelector('header .title'),
  'navOverlay': document.getElementById('nav-overlay'),
  'navContent': document.getElementById('nav-content'),
  'mainContent': document.getElementById('main-content'),
  'itemsCycle': document.getElementById('items-cycle'),
  'itemsGraph': document.getElementById('items-graph'),
  'resultsWrapper': document.getElementById('results-wrapper'),
  'resultsCount': document.querySelector('#results-wrapper h3 span'),
  'resultsContent': document.querySelector('#results-wrapper div ul'),
  'chosenConfirm': document.getElementById('winner-confirm'),
  'dataResetDialog': document.getElementById('data-reset-dialog'),
  'userItemsManager': document.getElementById('user-items-manager'),
  'userItemsClearDialog': document.getElementById('user-items-clear-dialog'),
  'footer': document.querySelector('.footer-container')
}

// DOM > interactive elements
Raffler.dom.interactive = {
  'all': document.getElementById('debug-buttons'),
  'btnNav': document.getElementById('button-nav'),
  'btnNavClose': document.getElementById('button-nav-close'),
  'btnHelp': document.getElementById('button-help'),
  'btnSettings': document.getElementById('button-settings'),
  'btnTests': document.querySelector('#test-notify a'),
  'btnRaffle': document.getElementById('button-raffle'),
  'btnChosenConfirmYes': document.getElementById('button-confirm-yes'),
  'btnChosenConfirmNo': document.getElementById('button-confirm-no'),
  'btnExportResults': document.getElementById('button-export-results')
}

Raffler.dom.interactive.debug = {
  'btnShowConfig': document.getElementById('button-show-config'),
  'container': document.getElementById('debug-buttons'),
}
