/* init */
/* get the main app object set up */
/* also define a couple extensions */
/* global $ */

// main object
var Raffler = {}

// debug notifier
Raffler.notifierEnabled = false

// init customizable things
Raffler.initDataFile = './assets/json/raffler_data.json'
Raffler.initOptionsFile = './assets/json/raffler_options.json'
Raffler.initLogoFile = null
Raffler.initLogoLink = null

// user options
// set to true to use raffler_user_options.json
Raffler.userOptionsMerge = false
Raffler.userOptionsPath = './assets/json/raffler_user_options.json'

if (Raffler.userOptionsMerge) {
  $.getJSON(Raffler.userOptionsPath, function () {})
    .done(function (data) {
      // get user options, if they exist
      Raffler.userDataFile = data.userDataFile
      Raffler.userLogoFile = data.userLogoFile
      Raffler.userLogoLink = data.userLogoLink

      // sync user customizations
      Raffler.dataFilePath = Raffler.userDataFile || Raffler.initDataFile
      Raffler.logoFilePath = Raffler.userLogoFile || Raffler.initLogoFile
      Raffler.logoFileLink = Raffler.userLogoLink || Raffler.initLogoLink
    })
    .fail(function () {
      Raffler.dataFilePath = Raffler.initDataFile
    })
} else {
  Raffler.dataFilePath = Raffler.initDataFile
}

// main Raffler properties
Raffler.itemsArr = []
Raffler.itemsLeftArr = []
Raffler.initOptionsObj = {
  'showGraph': false,
  'boxResize': false,
  'soundCountdown': true,
  'soundVictory': false
}
Raffler.initItemsObj = []
Raffler.initInterval = 25
Raffler.initMult = 1
Raffler.initTimesRun = 0
Raffler.lastInterval = 359
Raffler.hasLocalStorage = true
Raffler.shouldIgnoreSound = false
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
Raffler.body = $('body')
Raffler.title = $('header')
Raffler.divItemStatusBubble = $('#item-status-bubble')
Raffler.divAdminMenu = $('#admin-menu')
Raffler.divMainContent = $('#main-content')
Raffler.divItemsCycle = $('#items-cycle')
Raffler.divItemsGraph = $('#items-graph')
Raffler.divResultsWrapper = $('#results-wrapper')
Raffler.divResultsCount = $('#results-wrapper h3 span')
Raffler.divResultsContent = $('#results-wrapper div ul')
Raffler.divDataResetDialog = $('#data-reset-dialog')
Raffler.divUserItemsManager = $('#user-items-manager')
Raffler.divUserItemsDisplay = $('#user-items-display')
Raffler.divUserItemsClearDialog = $('#user-items-clear-dialog')
Raffler.divFooter = $('.footer-container')

// clicky things
Raffler.btnAdminMenuToggle = $('span#button-admin-menu-toggle')
Raffler.btnTestSuccess = $('a#button-test-success')
Raffler.btnTestNotice = $('a#button-test-notice')
Raffler.btnTestWarning = $('a#button-test-warning')
Raffler.btnTestError = $('a#button-test-error')
Raffler.btnTimerStart = $('a#button-timer-start')
Raffler.btnTimerStop = $('a#button-timer-stop')
Raffler.btnDataReset = $('a#button-data-reset')
Raffler.btnUserItemsAdd = $('a#button-user-items-add')
Raffler.btnUserItemsClear = $('a#button-user-items-clear')
Raffler.btnRaffle = $('a#button-raffle')
Raffler.divChosenConfirm = $('#winner-confirm')
Raffler.btnChosenConfirmYes = $('button#button-confirm-yes')
Raffler.btnChosenConfirmNo = $('button#button-confirm-no')
Raffler.btnExportResults = $('a#button-export-results')

// optiony things
Raffler.ckOptShowGraph = $('input#check-option-show-graph')
Raffler.ckOptResize = $('input#check-option-resize')
Raffler.ckOptSoundCountdown = $('input#check-option-sound-countdown')
Raffler.ckOptSoundVictory = $('input#check-option-sound-winner')
Raffler.ckOptFireworks = $('input#check-option-fireworks')

// input things
Raffler.inputUserItemsAddName = $('input#text-user-items-add-name')
Raffler.inputUserItemsAddAffl = $('input#text-user-items-add-affl')
Raffler.textAvailableItems = $('div#items-available textarea')
Raffler.textAvailableItemsCount = $('div#items-available .title span')
Raffler.textChosenItems = $('div#items-chosen textarea')
Raffler.textChosenItemsCount = $('div#items-chosen .title span')

// audio files
Raffler.sndBeep = $('audio#beep')
Raffler.sndVictory = $('audio#victory')

// debug
Raffler.divStageValue = $('#stage-value span')
Raffler.divIntervalValue = $('#interval-value span')
Raffler.divIntervalRange = $('#interval-value input[type=range]')
Raffler.divMultiplyValue = $('#multiply-value span')
Raffler.divTimesRunValue = $('#timesrun-value span')

// if we aren't doing the "resize as the raffle counts down" thing
// then fast track display to final level
if (!Raffler.ckOptResize.is(':checked')) {
  Raffler.body.removeClass()
  Raffler.body.addClass('level4')
  Raffler.divItemsCycle.removeClass()
  Raffler.divItemsCycle.addClass('level4')
}

// sfx
Raffler.sndBeep.attr('src', './assets/audio/beep.mp3')
Raffler.sndVictory.attr('src', './assets/audio/victory.mp3')

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
