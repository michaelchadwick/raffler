/* init */
/* get the main app object set up */
/* also define a couple extensions */
/* global $, talkify */

// main object
if ((typeof Raffler) === 'undefined') var Raffler = {}

Raffler.options = {}
Raffler.elements = {}

// debug notifier
Raffler.options.notifierEnabled = false

// main options file
Raffler.optionsFile = './assets/json/raffler_options.json'

// init settings
Raffler.options.dataFilePath = './assets/json/raffler_data.json'
Raffler.options.logoFilePath = null
Raffler.options.logoFileLink = null
Raffler.options.talkifyKey = null
// set to true to use raffler_user_options.json
Raffler.options.userOptionsMerge = false
Raffler.options.userOptionsPath = './assets/json/raffler_user_options.json'

if (Raffler.options.userOptionsMerge) {
  $.ajax({
    url: Raffler.options.userOptionsPath,
    async: false,
    dataType: 'json',
    success: function (userOps) {
      // sync user customizations
      $.extend(Raffler, userOps)
    }
  })
}

// main Raffler properties
Raffler.itemsArr = []
Raffler.itemsLeftArr = []
Raffler.initOptionsObj = {
  'showGraph': false,
  'boxResize': false,
  'soundCountdown': true,
  'soundVictory': false,
  'soundName': false
}
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

// main divs/elements
Raffler.elements.body = $('body')
Raffler.elements.title = $('header')
// Raffler.divItemStatusBubble = $('#item-status-bubble')
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
Raffler.elements.btnTestSuccess = $('a#button-test-success')
Raffler.elements.btnTestNotice = $('a#button-test-notice')
Raffler.elements.btnTestWarning = $('a#button-test-warning')
Raffler.elements.btnTestError = $('a#button-test-error')

if (!Raffler.notifierEnabled) {
  Raffler.elements.btnTestSuccess.attr('disabled', true)
  Raffler.elements.btnTestSuccess.attr('title', 'Raffler.options.notifierEnabled is false')
  Raffler.elements.btnTestSuccess.addClass('disabled')
  Raffler.elements.btnTestNotice.attr('disabled', true)
  Raffler.elements.btnTestNotice.attr('title', 'Raffler.options.notifierEnabled is false')
  Raffler.elements.btnTestNotice.addClass('disabled')
  Raffler.elements.btnTestWarning.attr('disabled', true)
  Raffler.elements.btnTestWarning.attr('title', 'Raffler.options.notifierEnabled is false')
  Raffler.elements.btnTestWarning.addClass('disabled')
  Raffler.elements.btnTestError.attr('disabled', true)
  Raffler.elements.btnTestError.attr('title', 'Raffler.options.notifierEnabled is false')
  Raffler.elements.btnTestError.addClass('disabled')
}

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
Raffler.elements.ckOptResize = $('input#check-option-resize')
Raffler.elements.ckOptSoundCountdown = $('input#check-option-sound-countdown')
Raffler.elements.ckOptSoundVictory = $('input#check-option-sound-winner')
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
$('audio#beep').attr('src', './assets/audio/beep2.mp3')
$('audio#victory').attr('src', './assets/audio/victory2.mp3')

// debug
Raffler.divStageValue = $('#stage-value span')
Raffler.divIntervalValue = $('#interval-value span')
Raffler.divIntervalRange = $('#interval-value input[type=range]')
Raffler.divMultiplyValue = $('#multiply-value span')
Raffler.divTimesRunValue = $('#timesrun-value span')

// if we aren't doing the "resize as the raffle counts down" thing
// then fast track display to final level
if (!Raffler.elements.ckOptResize.is(':checked')) {
  Raffler.elements.body.removeClass()
  Raffler.elements.body.addClass('level4')
  Raffler.elements.itemsCycle.removeClass()
  Raffler.elements.itemsCycle.addClass('level4')
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
