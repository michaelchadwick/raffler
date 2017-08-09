/* init */
/* get the main app object set up */
/* also define a couple extensions */
/* global $, saveAs */

// main object
var Raffler = {}

// init customizable things
Raffler.initDataFile = '/assets/json/raffler_data.json'
Raffler.initLogoFile = null
Raffler.initLogoLink = null

// user options
//// set to true to use raffler_user_options.json
Raffler.userOptionsMerge = false
Raffler.userOptionsPath = '/assets/json/raffler_user_options.json'

if (Raffler.userOptionsMerge) {
  var jqxhr = $.getJSON(Raffler.userOptionsPath, function (data) {})
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
    .fail(function (jqxhr, textStatus, e) {
      //Raffler._notify('User options not loaded: ' + e, 'notice')
      Raffler.dataFilePath = Raffler.initDataFile
    })
} else {
  Raffler.dataFilePath = Raffler.initDataFile
}

// global variables
Raffler.itemsArr = []
Raffler.initItemsObj = []
Raffler.initInterval = 25
Raffler.initMult = 1
Raffler.initTimesRun = 0
Raffler.lastInterval = 359
Raffler.hasLocalStorage = true
Raffler.ignoreSound = false
Raffler.enableUserItems = false
Raffler.lastItemChosen = ''
Raffler.lastItemChosenConfirmed = false

// main divs/elements
Raffler.body = $('body')
Raffler.title = $('header')
Raffler.divItemStatusBubble = $('div#item-status-bubble')
Raffler.divAdminMenu = $('div#admin-menu')
Raffler.divMainWrapper = $('div#wrapper')
Raffler.divItemsCycle = $('div#items-cycle')
Raffler.divResultsWrapper = $('div#results-wrapper')
Raffler.divResultsCount = $('div#results-wrapper h3 span')
Raffler.divResultsContent = $('div#results-wrapper div ul')
Raffler.divDataResetDialog = $('div#data-reset-dialog')
Raffler.divUserItemsManager = $('div#user-items-manager')
Raffler.divUserItemsDisplay = $('div#user-items-display')
Raffler.divUserItemsClearDialog = $('div#user-items-clear-dialog')
Raffler.canvasFireworks = $('canvas')

// clicky things
Raffler.btnAdminMenuToggle = $('span#button-admin-menu-toggle')
Raffler.btnTestSuccess = $('a#button-test-success')
Raffler.btnTestNotice = $('a#button-test-notice')
Raffler.btnTestWarning = $('a#button-test-warning')
Raffler.btnTestError = $('a#button-test-error')
Raffler.btnTimerStart = $('a#button-timer-start')
Raffler.btnTimerStop = $('a#button-timer-stop')
Raffler.btnDataReset = $('a#button-data-reset')
Raffler.btnUserItemsAdd = $('button#button-user-items-add')
Raffler.btnUserItemsClear = $('button#button-user-items-clear')
Raffler.btnRaffle = $('a#button-raffle')
Raffler.divChosenConfirm = $('div#winner-confirm')
Raffler.btnChosenConfirmYes = $('button#button-confirm-yes')
Raffler.btnChosenConfirmNo = $('button#button-confirm-no')
Raffler.btnExportResults = $('div#results-wrapper div button')

// optiony things
Raffler.ckOptResize = $('input#check-option-resize')
Raffler.ckOptSoundCountdown = $('input#check-option-sound-countdown')
Raffler.ckOptSoundWinner = $('input#check-option-sound-winner')
Raffler.ckOptFireworks = $('input#check-option-fireworks')

// input things
Raffler.inputUserItemsAdd = $('input#text-user-items-add')
Raffler.textAvailableItems = $('div#items-available textarea')
Raffler.textChosenItems = $('div#items-chosen textarea')

// audio files
Raffler.sndBeep = $('audio#beep')
Raffler.sndVictory = $('audio#victory')

// debug
Raffler.divStageValue = $('div#stage-value span')
Raffler.divIntervalValue = $('div#interval-value span')
Raffler.divIntervalRange = $('div#interval-value input[type=range]')
Raffler.divMultiplyValue = $('div#multiply-value span')
Raffler.divTimesRunValue = $('div#timesrun-value span')

// if we aren't doing the "resize as the raffle counts down" thing
// then fast track display to final level
if (!Raffler.ckOptResize.is(':checked')) {
  Raffler.body.removeClass()
  Raffler.body.addClass('level4')
  Raffler.divItemsCycle.removeClass()
  Raffler.divItemsCycle.addClass('level4')
}

// sfx
Raffler.sndBeep.attr('src', '/assets/audio/beep.mp3')
Raffler.sndVictory.attr('src', '/assets/audio/victory.mp3')

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
