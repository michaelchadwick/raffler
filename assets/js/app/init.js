/* init */
/* get the main app object set up */
/* also define a couple extensions */
/* global $, talkify */

// Raffler object init
if ((typeof Raffler) === 'undefined') var Raffler = {}

// Raffler properties
Raffler.itemsArr = []
Raffler.itemsLeftArr = []
Raffler.initItemsObj = []
Raffler.initInterval = 25
Raffler.initMult = 1
Raffler.initTimesRun = 0
Raffler.lastInterval = 361
Raffler.hasLocalStorage = true
Raffler.lastItemChosen = ''
Raffler.lastItemChosenConfirmed = false
Raffler.stages = {
  INIT: 0,
  BEGUN: 1,
  SLOWED: 2,
  SLOWEST: 3,
  DONE: 4
}

// Raffler sub-property groups
Raffler.options = {}
Raffler.elements = {}

// Raffler options file
const RAFFLER_OPTIONS_FILE = './config/raffler_options.json'

$.ajax({
  dataType: 'json',
  url: RAFFLER_OPTIONS_FILE,
  async: false,
  success: function(data) {
    Raffler.defaults = data
    $.extend(Raffler.options, data)
  }
})

// Raffler user overrides file
const USER_OPTIONS_FILE = './config/raffler_options.user.json'

$.ajax({
  dataType: 'json',
  url: USER_OPTIONS_FILE,
  async: false,
  success: function(data) {
    Raffler.options = $.extend({}, Raffler.options, data)
  }
})

// main divs/elements
Raffler.elements.body = $('body')
Raffler.elements.title = $('header')
Raffler.elements.adminMenu = $('#admin-menu')
Raffler.elements.adminMenuInner = $('#admin-menu .menu')
Raffler.elements.mainContent = $('#main-content')
Raffler.elements.debugOptions = $('#debug-options')
Raffler.elements.itemsCycle = $('#items-cycle')
Raffler.elements.itemsGraph = $('#items-graph')
Raffler.elements.resultsWrapper = $('#results-wrapper')
Raffler.elements.resultsCount = $('#results-wrapper h3 span')
Raffler.elements.resultsContent = $('#results-wrapper div ul')
Raffler.elements.chosenConfirm = $('#winner-confirm')
Raffler.elements.dataResetDialog = $('#data-reset-dialog')
Raffler.elements.userItemsManager = $('#user-items-manager')
Raffler.elements.userItemsDisplay = $('#user-items-display')
Raffler.elements.userItemsClearDialog = $('#user-items-clear-dialog')
Raffler.elements.footer = $('.footer-container')

// clicky things
Raffler.elements.btnAdminMenuToggle = $('span#button-admin-menu-toggle')
Raffler.elements.btnTests = $('#test-notify a')
Raffler.elements.btnTestSuccess = $('a#button-test-success')
Raffler.elements.btnTestNotice = $('a#button-test-notice')
Raffler.elements.btnTestWarning = $('a#button-test-warning')
Raffler.elements.btnTestError = $('a#button-test-error')
Raffler.elements.btnTimerStart = $('a#button-timer-start')
Raffler.elements.btnTimerStop = $('a#button-timer-stop')
Raffler.elements.btnDataReset = $('a#button-data-reset')
Raffler.elements.btnUserItemsAdd = $('a#button-user-items-add')
Raffler.elements.btnUserItemsClear = $('a#button-user-items-clear')
Raffler.elements.btnRaffle = $('a#button-raffle')
Raffler.elements.btnChosenConfirmYes = $('button#button-confirm-yes')
Raffler.elements.btnChosenConfirmNo = $('button#button-confirm-no')
Raffler.elements.btnExportResults = $('a#button-export-results')

// optiony things
Raffler.elements.ckOptShowGraph = $('input#check-option-show-graph')
Raffler.elements.ckOptAllowNotifications = $('input#check-option-allow-notifications')
Raffler.elements.ckOptResize = $('input#check-option-resize')
Raffler.elements.ckOptSoundCountdown = $('input#check-option-sound-countdown')
Raffler.elements.ckOptSoundVictory = $('input#check-option-sound-victory')
Raffler.elements.ckOptSoundName = $('input#check-option-sound-name')
Raffler.elements.ckOptSoundNameLabel = $('label#check-option-sound-name-label')
Raffler.elements.ckOptFireworks = $('input#check-option-fireworks')
Raffler.elements.ckOptShowDebug = $('input#check-option-show-debug')

// input things
Raffler.elements.inputUserItemsAddName = $('input#text-user-items-add-name')
Raffler.elements.inputUserItemsAddAffl = $('input#text-user-items-add-affl')
Raffler.elements.textAvailableItems = $('div#items-available textarea')
Raffler.elements.textAvailableItemsCount = $('div#items-available .title span')
Raffler.elements.textChosenItems = $('div#items-chosen textarea')
Raffler.elements.textChosenItemsCount = $('div#items-chosen .title span')

// load audio files
Raffler.audioContext = new ( window.AudioContext || window.webkitAudioContext )()
$('audio#countdown').attr('src', './assets/audio/countdown.mp3')
$('audio#victory').attr('src', './assets/audio/victory.mp3')

// debug
Raffler.elements.stageValue = $('#stage-value span')
Raffler.elements.intervalValue = $('#interval-value span')
Raffler.elements.intervalRange = $('#interval-value input[type=range]')
Raffler.elements.multiplyValue = $('#multiply-value span')
Raffler.elements.timesRunValue = $('#timesrun-value span')

// if we aren't doing the "resize as the raffle counts down" thing
// then fast track display to final level
if (!Raffler.elements.ckOptResize.is(':checked')) {
  Raffler.elements.body.removeClass()
  Raffler.elements.body.addClass('level4')
  Raffler.elements.itemsCycle.removeClass()
  Raffler.elements.itemsCycle.addClass('level4')
}
if (Raffler.options.showDebug) {
  Raffler.elements.ckOptShowDebug.attr('checked', true)
  Raffler.elements.debugOptions.toggleClass('show')
  Raffler.elements.adminMenuInner.toggleClass('with-debug')
}
if (Raffler.options.notifierEnabled) {
  Raffler.elements.ckOptAllowNotifications.attr('checked', 'checked')
}

// talkify
talkify.config.debug = false
talkify.config.remoteService.enabled = false
talkify.config.remoteService.host = 'https://talkify.net'
talkify.config.remoteService.apiKey = Raffler.options.talkifyKey
talkify.config.ui.audioControls = {
  enabled: false,
  container: document.getElementById('#talkify-audio')
}

if (Raffler.options.talkifyKey === null || Raffler.options.talkifyKey === '') {
  Raffler.elements.ckOptSoundName.attr('disabled', true)
  Raffler.elements.ckOptSoundName.attr('title', 'Currently disabled as no valid Talkify API Key was found')
  Raffler.elements.ckOptSoundNameLabel.attr('title', 'Currently disabled as no valid Talkify API Key was found')
}

// jQuery extension to parse url querystring
$.QueryString = (function (a) {
  if (a === '') return {}
  var b = {}
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=', 2)
    if (p.length !== 2) {
      continue
    }
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '))
  }
  return b
})(window.location.search.substr(1).split('&'))
