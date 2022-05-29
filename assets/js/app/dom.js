/* dom */
/* grab references to dom elements */
/* global $, Raffler */

// DOM > main divs/elements
Raffler.dom = {
  "body": $('body'),
  "title": $('header'),
  "navOverlay": $('#nav-overlay'),
  "navContent": ('$nav-content'),
  "mainContent": $('#main-content'),
  "itemsCycle": $('#items-cycle'),
  "itemsGraph": $('#items-graph'),
  "resultsWrapper": $('#results-wrapper'),
  "resultsCount": $('#results-wrapper h3 span'),
  "resultsContent": $('#results-wrapper div ul'),
  "chosenConfirm": $('#winner-confirm'),
  "dataResetDialog": $('#data-reset-dialog'),
  "userItemsManager": $('#user-items-manager'),
  "userItemsDisplay": $('#user-items-display'),
  "userItemsClearDialog": $('#user-items-clear-dialog'),
  "footer": $('.footer-container')
}

// DOM > interactive elements
Raffler.dom.interactive = {
  "btnNav": $('#button-nav'),
  "btnNavClose": $('#button-nav-close'),
  "btnHelp": $('#button-help'),
  "btnSettings": $('#button-settings'),
  "btnTests": $('#test-notify a'),
  "btnRaffle": $('a#button-raffle'),
  "btnChosenConfirmYes": $('button#button-confirm-yes'),
  "btnChosenConfirmNo": $('button#button-confirm-no'),
  "btnExportResults": $('a#button-export-results')
}

// load audio files
$('audio#countdown').attr('src', './assets/audio/countdown.mp3')
$('audio#victory').attr('src', './assets/audio/victory.mp3')
