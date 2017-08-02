/* init */
/* get the main app object set up */
/* also define a couple extensions */

let initDataFile = '/assets/json/raffler_data.json'
// change this to your own
let userDataFile = '/assets/json/alts/raffler_uccsc_small.json'

// main object
var Raffler = {}

// global variables
Raffler.dataFilePath = userDataFile ? userDataFile : initDataFile
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

// main divs/elements
Raffler.body = $('body')
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

// optiony things
Raffler.ckOptResize = $('input#check-option-resize')
Raffler.ckOptSound = $('input#check-option-sound')
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

// Array extension to make it easier to clear arrays
Array.prototype.clear = function () {
  while (this.length) {
    this.pop()
  }
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

// Export raffle results to text file
$('div#results-wrapper div button').click(function (e) {
  e.preventDefault()
  Raffler._notify('exporting results', 'notice');
  exportResults()
})

function exportResults() {
  var plainText = $('div#results-wrapper div ul')
    .html()
    .replace(/<li>/g, '')
    .replace(/<\/li>/g, "\n")

  var Blob = window.Blob
  var plainTextBlob = new Blob(
    [plainText],
    {type: 'text/plain;charset=' + document.characterSet}
  )

  var today = new Date()
  var ymd = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate()
  var filename = 'raffler-uccsc-export-results-' + ymd + '.txt'

  saveAs(plainTextBlob, filename)
}
