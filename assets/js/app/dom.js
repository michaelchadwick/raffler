/* dom */
/* grab references to dom elements */
/* global $, Raffler */

// DOM > main divs/elements
Raffler.dom = {
  "body": $('body'),
  "title": $('header'),
  "navOverlay": $('#nav-overlay'),
  "navContent": ('$nav-content'),
  "adminMenu": $('#admin-menu'),
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

// DOM > admin elements
Raffler.dom.admin = {
  "ckOptResize": $('input#check-option-resize'),
  "ckOptSoundCountdown": $('input#check-option-sound-countdown'),
  "ckOptSoundVictory": $('input#check-option-sound-victory'),
  "ckOptSoundName": $('input#check-option-sound-name'),
  "ckOptSoundNameLabel": $('label#check-option-sound-name-label'),
  "btnTimerStart": $('a#button-timer-start'),
  "btnTimerStop": $('a#button-timer-stop'),
  "btnDataReset": $('a#button-data-reset'),
  "inputUserItemsAddName": $('input#text-user-items-add-name'),
  "inputUserItemsAddAffl": $('input#text-user-items-add-affl'),
  "btnUserItemsAdd": $('a#button-user-items-add'),
  "btnUserItemsClear": $('a#button-user-items-clear'),
  "ckOptShowDebug": $('input#check-option-show-debug'),
  "debugOptions": $('#debug-options'),
  "stageValue": $('#stage-value span'),
  "intervalValue": $('#interval-value span'),
  "intervalRange": $('#interval-value input[type=range]'),
  "multiplyValue": $('#multiply-value span'),
  "timesRunValue": $('#timesrun-value span'),
  "ckOptShowGraph": $('input#check-option-show-graph'),
  "ckOptAllowNotifications": $('input#check-option-allow-notifications'),
  "btnTestNotice": $('a#button-test-notice'),
  "btnTestSuccess": $('a#button-test-success'),
  "btnTestWarning": $('a#button-test-warning'),
  "btnTestError": $('a#button-test-error'),
  "textAvailableItems": $('div#items-available textarea'),
  "textAvailableItemsCount": $('div#items-available .title span'),
  "textChosenItems": $('div#items-chosen textarea'),
  "textChosenItemsCount": $('div#items-chosen .title span')
}

// load audio files
Raffler.audioContext = new ( window.AudioContext || window.webkitAudioContext )()
$('audio#countdown').attr('src', './assets/audio/countdown.mp3')
$('audio#victory').attr('src', './assets/audio/victory.mp3')

// if we aren't doing the "resize as the raffle counts down" thing
// then fast track display to final level
if (!Raffler.dom.admin.ckOptResize.is(':checked')) {
  Raffler.dom.body.removeClass()
  Raffler.dom.body.addClass('level4')
  Raffler.dom.itemsCycle.removeClass()
  Raffler.dom.itemsCycle.addClass('level4')
}
if (Raffler.options.showDebug) {
  Raffler.dom.admin.ckOptShowDebug.attr('checked', true)
  Raffler.dom.admin.debugOptions.toggleClass('show')
}
if (Raffler.options.notifierEnabled) {
  Raffler.dom.admin.ckOptAllowNotifications.attr('checked', 'checked')
}
