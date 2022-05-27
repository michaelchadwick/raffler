/* main */
/* app entry point and main functions */
/* global $, Raffler, talkify */

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

// load options
$.ajax({
  dataType: 'json', url: RAFFLER_OPTIONS_FILE, async: false,
  success: function(data) {
    Raffler.defaults = data
    $.extend(Raffler.options, data)
  }
})

// load user options
$.ajax({
  dataType: 'json', url: USER_OPTIONS_FILE, async: false,
  success: function(data) {
    Raffler.options = $.extend({}, Raffler.options, data)
  }
})

// app entry point
Raffler.initApp = function () {
  // if admin passed, show hamburger menu
  if ((typeof $.QueryString.admin) !== 'undefined') {
    Raffler.initAdmin()
  }

  // set env
  Raffler.env = ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (Raffler.env == 'local') {
    document.title = '(LH) ' + document.title
  }

  // add logo, if exists
  if (Raffler.options.logoFilePath !== '' && Raffler.options.logoFileLink !== '') {
    Raffler.dom.title.append('<span>at</span>')
    Raffler.dom.title.append(`<a href='${Raffler.options.logoFileLink}' target='_blank'>`)
    Raffler.dom.title.append(`<img id='logo' src='${Raffler.options.logoFilePath}' />`)
    Raffler.dom.title.append('</a>')
  } else {
    Raffler._notify('raffler_options.user: no custom logo or link found')
  }

  Raffler.attachEventListeners()
  Raffler.checkForLocalStorage()
  Raffler.resetApp()
  Raffler.refreshDebugValues()
  Raffler.refreshItemsGraph(Raffler.itemsLeftArr)

  if (Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY).length) {
    Raffler.refreshChosenItemsDisplay()
    Raffler.dom.resultsWrapper.show()
  }
  Raffler.dom.admin.intervalValue.text(Raffler.dom.admin.intervalRange.val())

  Raffler._disableTimerStart()
  // set cycler to init text
  Raffler._initCycleText()
  Raffler.timerStop()
  Raffler.dom.interactive.btnRaffle.focus()

  Raffler._notify('Raffler init', 'notice')
}

// if admin settings are to be shown, initialize some things
Raffler.initAdmin = function () {
  // console.log('initiating admin stuff...')

  Raffler.dom.interactive.btnSettings.addClass('show')

  var debugStyles = document.createElement('link')
  debugStyles.rel = 'stylesheet'
  debugStyles.href = './public/build/css/admin.css'
  document.head.appendChild(debugStyles)
}

// modal opening functions
async function modalOpen(type) {
  switch(type) {
    case 'help':
      this.myModal = new Modal('perm', 'How to use Raffler',
        `
          <p>Draw something at random.</p>

          <ol class="help">
            <li>Press the main raffle area to get it going</li>
            <li>Press the "PICK A WINNER!" button to start slowing down the raffler</li>
            <li>Announce the winner!
              <p>If the winner is present: Press "YES", the winner is removed from the pool, and the raffler goes again. If the winner is not present: Press "NO", the winner remains in the pool, and the raffler goes again.</p>
              </p>
            </li>
            <li>Raffler will keep removing winners until it's left with one remaining item, and then it's done</li>
          </ol>
        `,
        null,
        null
      )
      break

    case 'settings':
      this.myModal = new Modal('perm', 'Admin Settings',
        `
          <nav id="admin-menu">
            <div id="fancy-options">
              <label class="title">Special Effects</label>
              <div class="checkbox">
                <label for="check-option-resize">box/text resize</label>
                <input type="checkbox" id="check-option-resize" />
              </div>
              <div class="checkbox">
                <label for="check-option-sound-countdown">sound: countdown</label>
                <input type="checkbox" id="check-option-sound-countdown" />
              </div>
              <div class="checkbox">
                <label for="check-option-sound-victory">sound: victory</label>
                <input type="checkbox" id="check-option-sound-victory" />
              </div>
              <div class="checkbox">
                <label for="check-option-sound-name">sound: name</label>
                <input type="checkbox" id="check-option-sound-name" />
              </div>
            </div>
            <div id="timer-controls">
              <label class="title">Timer Controls</label>
              <a href="#" class="button start" id="button-timer-start"><i class="fas fa-play"></i> start</a>
              <a href="#" class="button stop" id="button-timer-stop"><i class="fas fa-stop"></i> stop</a>
              <div class="title">App Controls</div>
              <a href="#" class="button reset confirmLink" id="button-data-reset"><i class="fas fa-redo-alt"></i> reset data</a>
            </div>
            <div id="user-items-manager">
              <label class="title">User Items</label>
              <input id="text-user-items-add-name" type="text" placeholder="name" />
              <input id="text-user-items-add-affl" type="text" placeholder="affiliation" />
              <a href="#" class="button disabled" id="button-user-items-add" disabled><i class="fas fa-plus"></i> add</a>
              <a href="#" class="button disabled" id="button-user-items-clear" disabled><i class="fas fa-minus-circle"></i> clear</a>
              <div id="user-items-display"><ul></ul></div>
            </div>

            <div class="title title-with-checkbox">
              <label for="check-option-show-debug">debug options?</label>
              <input type="checkbox" id="check-option-show-debug" onclick="changeSetting('debug-options')" />
            </div>
            <div id="debug-options">
              <div id="debug-values">
                <div class="title">Debug Values</div>
                <div class="values" id="stage-value">
                  <label>Stage:</label> <span></span>
                </div>
                <div class="values" id="interval-value">
                  <label>Interval:</label> <span></span>
                  <input type="range" min="1" max="359" step="1" value="25" />
                </div>
                <div class="values" id="multiply-value">
                  <label>Multiply:</label> <span></span>
                </div>
                <div class="values" id="timesrun-value">
                  <label>Times Run:</label> <span></span>
                </div>
                <div class="checkbox">
                  <label for="check-option-show-graph">show graph</label>
                  <input type="checkbox" id="check-option-show-graph" />
                </div>
              </div>
              <div id="test-notify">
                <div class="title">Test Notifications</div>
                <div class="checkbox">
                  <label for="check-option-allow-notifications">allow notifications</label>
                  <input type="checkbox" id="check-option-allow-notifications" />
                </div>
                <a href="#" class="button test notice" id="button-test-notice" title="notice">
                  <i class="fas fa-info-circle"></i>
                </a>
                <a href="#" class="button test success" id="button-test-success" title="success">
                  <i class="fas fa-smile"></i>
                </a>
                <a href="#" class="button test warning" id="button-test-warning" title="warning">
                  <i class="fas fa-exclamation-triangle"></i>
                </a>
                <a href="#" class="button test error" id="button-test-error" title="error">
                  <i class="fas fa-times-circle"></i>
                </a>
              </div>
              <div id="items-available">
                <div class="title">Available Items <span></span></div>
                <textarea readonly></textarea>
              </div>
              <div id="items-chosen">
                <div class="title">Chosen Items <span></span></div>
                <textarea readonly></textarea>
              </div>
            </div>
          </nav>
        `,
        null,
        null
      )
      break

    case 'data-reset':
      this.myModal = new Modal('confirm', 'Are you sure you want to reset Raffler?',
        'Note: all chosen and user items will be lost.',
        'Yes',
        'No'
      )
      break

    case 'user-items-reset':
      this.myModal = new Modal('confirm', 'Are you sure you want to clear user-entered items?',
        'DANGER!',
        'Yes',
        'No'
      )
      break
  }
}

async function changeSetting(setting, event = null) {
  switch (setting) {

  }
}

// handle both clicks and touches outside of modals
Raffler.handleClickTouch = function(event) {
  var dialog = document.getElementsByClassName('modal-dialog')[0]

  if (dialog) {
    var isConfirm = dialog.classList.contains('modal-confirm')

    // only close if not a confirmation!
    if (event.target == dialog && !isConfirm) {
      dialog.remove()
    }
  }

  if (event.target == Raffler.dom.navOverlay) {
    Raffler.dom.navOverlay.classList.toggle('show')
  }
}

// attach event handlers to buttons and such
Raffler.attachEventListeners = function () {
  // {} header icons to open modals
  Raffler.dom.interactive.btnNav.click(() => {
    Raffler.dom.navOverlay.toggleClass('show')
  })
  Raffler.dom.interactive.btnNavClose.click(() => {
    Raffler.dom.navOverlay.toggleClass('show')
  })
  Raffler.dom.interactive.btnHelp.click(() => modalOpen('help'))
  Raffler.dom.interactive.btnSettings.click(() => modalOpen('settings'))

  // main raffling events
  Raffler.dom.itemsCycle.click(function () {
    Raffler._notify('starting the cycle')
    Raffler._enableRaffle()
    Raffler.timerStart()
  })
  Raffler.dom.interactive.btnRaffle.click(function (e) {
    e.preventDefault()
    if (!Raffler.dom.interactive.btnRaffle.prop('disabled')) {
      Raffler.raffleButtonSmash()
    }
  })
  Raffler.dom.interactive.btnChosenConfirmYes.click(function () {
    Raffler.lastItemChosenConfirmed = true
    Raffler.continueRaffling()
  })
  Raffler.dom.interactive.btnChosenConfirmNo.click(function () {
    Raffler.lastItemChosenConfirmed = false
    Raffler.continueRaffling()
  })
  Raffler.dom.interactive.btnExportResults.click(function (e) {
    e.preventDefault()
    Raffler._notify('exporting results', 'notice')

    var plainText = $('div#results-wrapper div ul')
      .html()
      .replace(/<li>/g, '')
      .replace(/<\/li>/g, `\r\n`)

    var Blob = window.Blob
    var plainTextBlob = new Blob(
      [plainText],
      {type: 'text/plain;charset=' + document.characterSet}
    )

    var today = new Date()

    var yr = today.getFullYear()
    var mo = today.getMonth() + 1
    mo = (mo < 10) ? `0${mo}` : `${mo}`
    var dy = today.getDate()
    dy = (dy < 10) ? `0${dy}` : `${dy}`
    var ymd = `${yr}${mo}${dy}`

    var hr = today.getHours()
    hr = (hr < 10) ? `0${hr}` : `${hr}`
    var mi = today.getMinutes()
    mi = (mi < 10) ? `0${mi}` : `${mi}`
    var sc = today.getSeconds()
    sc = (sc < 10) ? `0${sc}` : `${sc}`
    var hms = hr + ':' + mi + ':' + sc

    var filename = `raffler-export_${ymd}_${hms}.txt`

    window.saveAs(plainTextBlob, filename)
  })

  // admin settings events
  // TODO: these elements don't exist until settings modal is triggered
  Raffler.dom.admin.intervalRange.on('change', function (e) {
    e.preventDefault()
    Raffler.dom.admin.intervalValue.text($(this).val())
    window.countdownTimer.interval = parseInt($(this).val())
  })
  Raffler.dom.admin.ckOptShowGraph.on('change', function () {
    Raffler.dom.itemsGraph.toggle()
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.showGraph = !curObj.showGraph
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)
  })
  Raffler.dom.admin.ckOptAllowNotifications.on('change', function () {
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.notifierEnabled = !curObj.notifierEnabled
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)

    Raffler.options.notifierEnabled = curObj.notifierEnabled
    Raffler._toggleTestNotices()
  })
  Raffler.dom.admin.ckOptResize.on('change', function () {
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.boxResize = !curObj.boxResize
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)
  })
  Raffler.dom.admin.ckOptSoundCountdown.on('change', function () {
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.soundCountdown = !curObj.soundCountdown
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)
  })
  Raffler.dom.admin.ckOptSoundVictory.on('change', function () {
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.soundVictory = !curObj.soundVictory
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)
  })
  Raffler.dom.admin.ckOptSoundName.on('change', function () {
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.soundName = !curObj.soundName
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)
  })
  Raffler.dom.admin.ckOptShowDebug.on('change', function () {
    var curObj = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
    curObj.showDebug = !curObj.showDebug
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, curObj)

    Raffler.dom.admin.debugOptions.toggleClass('show')
  })
  Raffler.dom.admin.btnTestSuccess.click(function (e) {
    e.preventDefault()
    Raffler._notify('test success msg that is long enough to actually go onto a second line because of width and such and thus.', 'success', true)
  })
  Raffler.dom.admin.btnTestNotice.click(function (e) {
    e.preventDefault()
    Raffler._notify('test notice msg that is long enough to actually go onto a second line because of width and such and thus.', 'notice', true)
  })
  Raffler.dom.admin.btnTestWarning.click(function (e) {
    e.preventDefault()
    Raffler._notify('test warning msg that is long enough to actually go onto a second line because of width and such and thus.', 'warning', true)
  })
  Raffler.dom.admin.btnTestError.click(function (e) {
    e.preventDefault()
    Raffler._notify('test error msg that is long enough to actually go onto a second line because of width and such and thus.', 'error', true)
  })
  Raffler.dom.admin.btnTimerStart.click(function (e) {
    e.preventDefault()
    if (Raffler.dom.admin.btnTimerStart.prop('disabled', false)) {
      Raffler.timerStart()
    }
  })
  Raffler.dom.admin.btnTimerStop.click(function (e) {
    e.preventDefault()
    if (Raffler.dom.admin.btnTimerStop.prop('disabled', false)) {
      Raffler.timerStop()
    }
  })
  Raffler.dom.admin.btnDataReset.click(function (e) {
    e.preventDefault()
    Raffler.dom.dataResetDialog.dialog({
      autoOpen: false,
      modal: true,
      resizeable: false,
      height: 'auto',
      buttons: {
        'Reset it!': function () {
          Raffler.resetCountdown()
          $(this).dialog('close')
        },
        'Nevermind.': function () {
          $(this).dialog('close')
        }
      }
    })

    Raffler.dom.dataResetDialog.dialog('open')
  })
  Raffler.dom.admin.inputUserItemsAddName.keyup(function (e) {
    var code = e.which
    if (code === 13) {
      e.preventDefault()
      Raffler.dom.admin.btnUserItemsAdd.click()
    }

    if ($(this).val().length > 0 && Raffler.dom.admin.inputUserItemsAddAffl.val().length > 0) {
      Raffler.dom.admin.btnUserItemsAdd.prop('disabled', false)
      Raffler.dom.admin.btnUserItemsAdd.removeClass('disabled')
    } else {
      Raffler.dom.admin.btnUserItemsAdd.prop('disabled', true)
      Raffler.dom.admin.btnUserItemsAdd.addClass('disabled')
    }
  })
  Raffler.dom.admin.inputUserItemsAddAffl.keyup(function (e) {
    var code = e.which
    if (code === 13) {
      e.preventDefault()
      Raffler.dom.admin.btnUserItemsAdd.click()
    }

    if ($(this).val().length > 0 && Raffler.dom.admin.inputUserItemsAddName.val().length > 0) {
      Raffler.dom.admin.btnUserItemsAdd.prop('disabled', false)
      Raffler.dom.admin.btnUserItemsAdd.removeClass('disabled')
    } else {
      Raffler.dom.admin.btnUserItemsAdd.prop('disabled', true)
      Raffler.dom.admin.btnUserItemsAdd.addClass('disabled')
    }
  })
  Raffler.dom.admin.btnUserItemsAdd.click(function () {
    if (Raffler.dom.admin.inputUserItemsAddName.val() !== '' && Raffler.dom.admin.inputUserItemsAddAffl.val() !== '') {
      var newUserItem = {
        'name': Raffler.dom.admin.inputUserItemsAddName.val().trim(),
        'affl': Raffler.dom.admin.inputUserItemsAddAffl.val().trim()
      }

      if (newUserItem !== undefined) {
        var tempUserItemObj = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)

        if (!Raffler._isDuplicateValue(newUserItem)) {
          tempUserItemObj.push(Raffler._sanitize(newUserItem))
          Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
          Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')
          // update localStorage with temp tempUserItemObj
          Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, tempUserItemObj)
          // show status bubble
          Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" added!', 'success', true)
          Raffler.clearUserItemsInput()
          Raffler.syncUserItemsWithItemsArr()
        } else {
          Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" not added: duplicate.', 'error', true)
        }
      }
    }
  })
  Raffler.dom.admin.btnUserItemsClear.click(function (e) {
    e.preventDefault()
    try {
      if (Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY).length > 0) {
        Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
        Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')

        Raffler.dom.userItemsClearDialog.dialog({
          autoOpen: false,
          modal: true,
          resizeable: false,
          height: 'auto',
          buttons: {
            'Clear them!': function () {
              Raffler.resetUserItems()

              Raffler.clearUserItemsInput()

              Raffler.dom.admin.btnUserItemsClear.prop('disabled', true)
              Raffler.dom.admin.btnUserItemsClear.addClass('disabled')

              $(this).dialog('close')
            },
            'Nevermind.': function () {
              $(this).dialog('close')
            }
          }
        })

        Raffler.dom.userItemsClearDialog.dialog('open')
      }
    } catch (err) {
      Raffler._notify('btnUserItemsClear: ' + err, 'error')
    }
  })

  // When the user clicks or touches anywhere outside of the modal, close it
  window.addEventListener('click', Raffler.handleClickTouch)
  window.addEventListener('touchend', Raffler.handleClickTouch)
}
// check for LS - notify if not found
Raffler.checkForLocalStorage = function () {
  // if we got LS or SS, then set up the user items UI
  try {
    var LSsupport = (typeof window.localStorage !== 'undefined')
    var SSsupport = (typeof window.sessionStorage !== 'undefined')

    if (!LSsupport && !SSsupport) {
      Raffler.hasLocalStorage = false
      Raffler.dom.userItemsManager.hide()
      Raffler._notify('No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
    } else {
      // if our specific keys don't exist, then init
      if (!window.localStorage.getItem(RAFFLER_SETTINGS_KEY)) {
        Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, Raffler.defaults)
        Raffler._notify('checkForLocalStorage: raffler-settings created', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: raffler-settings already exists', 'notice')
      }

      Raffler.syncOptionsToUI()

      if (!window.localStorage.getItem(RAFFLER_USER_ITEMS_KEY)) {
        Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, Raffler.initItemsObj)
        Raffler._notify('checkForLocalStorage: raffler-user-items created', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: raffler-user-items already exists', 'notice')
      }
      if (!window.localStorage.getItem(RAFFLER_CHOSEN_ITEMS_KEY)) {
        Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, Raffler.initItemsObj)
        Raffler._notify('checkForLocalStorage: raffler-chosen-items created!', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: raffler-chosen-items already exists', 'notice')
      }
    }
  } catch (e) {
    Raffler.hasLocalStorage = false
    Raffler.dom.userItemsManager.hide()
    Raffler._notify('No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
  }
}

// handy combo shortcut of methods to reset application
Raffler.resetApp = function () {
  Raffler.initItemsArr()

  Raffler.lastItemChosen = ''
  Raffler.timesRun = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY).length
  Raffler.dom.admin.intervalRange.val(Raffler.initInterval)

  Raffler.refreshAvailableItemsDisplay()
  Raffler.refreshResultsCount()
  Raffler.refreshDebugValues()

  Raffler._notify('Raffler reset', 'notice')
}
// you hit the 'reset data' button
// puts everyone back in raffle
// resets stuff, as if you reloaded page
Raffler.resetCountdown = function () {
  if (Raffler.dom.admin.ckOptResize.is(':checked')) {
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  Raffler.resetApp()
  Raffler.resetChosenItems()
  Raffler.resetUserItems()

  Raffler.dom.resultsContent.text('')
  Raffler.clearUserItemsInput()
  Raffler.dom.admin.textAvailableItems.text('')
  Raffler.dom.admin.textChosenItems.text('')
  Raffler.dom.resultsWrapper.hide()
  Raffler._enableRaffle()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.interval = Raffler.initInterval
  window.countdownTimer.mult = Raffler.initMult
  window.countdownTimer.stage = Raffler.stages.INIT
  window.countdownTimer.start()

  Raffler.timesRun = 0

  Raffler.refreshDebugValues()
}
// reset raffler-chosen-items localStorage to nothing and update displays
Raffler.resetChosenItems = function () {
  try {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, Raffler.initItemsObj)
    Raffler.refreshChosenItemsDisplay()

    Raffler._notify('resetChosenItems: reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}
// reset raffler-user-items localStorage to nothing and update displays
Raffler.resetUserItems = function () {
  try {
    var lsUserItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)
    var itemsSpliced = [] // eslint-disable-line

    for (var i = 0; i < Raffler.itemsArr.length; i++) {
      for (var j = 0; j < lsUserItems.length; j++) {
        if (Raffler.itemsArr[i].name === lsUserItems[j].name &&
            Raffler.itemsArr[i].affl === lsUserItems[j].affl) {
          itemsSpliced = Raffler.itemsArr.splice(i, 1)[0]
        }
      }
    }

    Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, Raffler.initItemsObj)
    Raffler.refreshUserItemsDisplay()
    Raffler.refreshAvailableItemsDisplay()

    Raffler._notify('User items reset', 'success', true)
  } catch (e) {
    Raffler._notify('resetUserItems: ' + e, 'error')
  }
}
Raffler.clearUserItemsInput = function () {
  Raffler.dom.admin.inputUserItemsAddName.val('')
  Raffler.dom.admin.inputUserItemsAddAffl.val('')
}

// fill in-memory itemsArr with server JSON
Raffler.initItemsArr = function () {
  $.getJSON(Raffler.options.dataFilePath, function () {})
    .done(function (data) {
      while (Raffler.itemsArr.length) {
        Raffler.itemsArr.pop()
      }
      Raffler.itemsArr.length = 0

      if (Raffler.itemsArr) {
        $.each(data, function (key, val) {
          Raffler.itemsArr.push(val)
        })
        Raffler._shuffleArray(Raffler.itemsArr)
        Raffler.itemsLeftArr = Raffler.itemsArr
        Raffler.refreshItemsGraph(Raffler.itemsLeftArr)
        Raffler.syncChosenItemsWithItemsArr()
        Raffler.syncUserItemsWithItemsArr()
      }
    })
    .fail(function (jqxhr, textStatus, e) {
      Raffler._notify('Failed initial data load: ' + e, 'error', true)
    })
}

// sync localStorage options to admin UI
Raffler.syncOptionsToUI = function () {
  var lsVals = Raffler._getLocalStorageItem(RAFFLER_SETTINGS_KEY)
  if (lsVals.showGraph) {
    Raffler.dom.admin.ckOptShowGraph.prop('checked', true)
    Raffler.dom.itemsGraph.show()
  } else {
    Raffler.dom.admin.ckOptShowGraph.prop('checked', false)
    Raffler.dom.itemsGraph.hide()
  }
  if (lsVals.allowNotifications) {
    Raffler.dom.admin.ckOptAllowNotifications.prop('checked', true)
  } else {
    Raffler.dom.admin.ckOptAllowNotifications.prop('checked', false)
  }
  if (lsVals.boxResize) {
    Raffler.dom.admin.ckOptResize.prop('checked', true)
  } else {
    Raffler.dom.admin.ckOptResize.prop('checked', false)
  }
  if (lsVals.soundCountdown) {
    Raffler.dom.admin.ckOptSoundCountdown.prop('checked', true)
  } else {
    Raffler.dom.admin.ckOptSoundCountdown.prop('checked', false)
  }
  if (lsVals.soundVictory) {
    Raffler.dom.admin.ckOptSoundVictory.prop('checked', true)
  } else {
    Raffler.dom.admin.ckOptSoundVictory.prop('checked', false)
  }
}
// remove previously chosen items from in-memory itemsArr
Raffler.syncChosenItemsWithItemsArr = function () {
  try {
    var items = Raffler.itemsArr
    var itemsSpliced = [] // eslint-disable-line
    var chosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (chosenItems && chosenItems.length > 0) {
      for (var i = 0; i < chosenItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (chosenItems[i].name === items[j].name &&
              chosenItems[i].affl === items[j].affl) {
            itemsSpliced = items.splice(j, 1)[0]
          }
        }
      }
      Raffler.itemsLeftArr = items
      Raffler.refreshItemsGraph(Raffler.itemsLeftArr)

      Raffler._notify('syncChosenItemsWithItemsArr: synced', 'notice')
    } else {
      Raffler._notify('syncChosenItemsWithItemsArr: none to sync', 'notice')
    }

    // all items have been chosen on reload
    if (items.length === 0) {
      window.countdownTimer.stop()
      Raffler._disableRaffle()
      Raffler.dom.itemsCycle.html('<div>:\'(<br /><br />Nothing to raffle!</div>')
      Raffler.dom.body.addClass('level4')
      Raffler._notify('syncChosenItemsWithItemsArr: all items chosen', 'warning')
    }
  } catch (e) {
    Raffler._notify('syncChosenItemsWithItemsArr: ' + e, 'error')
  }
}
// add user items to in-memory itemsArr
Raffler.syncUserItemsWithItemsArr = function () {
  try {
    var items = Raffler.itemsArr
    var userItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)
    var userItemWillBeAdded = true

    // if we've previously added user items
    if (userItems && userItems.length > 0) {
      Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
      Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')

      for (var i = 0; i < userItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (userItems[i].name === items[j].name &&
              userItems[i].affl === items[j].affl) {
            userItemWillBeAdded = false
          }
        }
        if (userItemWillBeAdded) {
          Raffler.itemsArr.push(userItems[i])
        }
      }
      Raffler.refreshUserItemsDisplay()

      Raffler._notify('syncUserItemsWithItemsArr: synced', 'notice')
    } else {
      Raffler._notify('syncUserItemsWithItemsArr: none to sync', 'notice')
    }

    Raffler.refreshAvailableItemsDisplay()
  } catch (e) {
    Raffler._notify('syncUserItemsWithItemsArr: ' + e, 'error')
  }
}

// refresh items graph
Raffler.refreshItemsGraph = function (items) {
  var index = 0
  Raffler.dom.itemsGraph.html('')
  items.forEach(function () {
    Raffler.dom.itemsGraph
      .append('<span id=' + (index++) + '></span>')
  })
}
// refresh dem debug values in the admin menu
Raffler.refreshDebugValues = function () {
  Raffler.dom.admin.stageValue.text(window.countdownTimer.stage)
  Raffler.dom.admin.intervalValue.text(window.countdownTimer.interval)
  Raffler.dom.admin.intervalRange.val(window.countdownTimer.interval)
  Raffler.dom.admin.multiplyValue.text(window.countdownTimer.mult)
  Raffler.dom.admin.timesRunValue.text(Raffler.timesRun)
}
// refresh number of raffle results with localStorage values
Raffler.refreshResultsCount = function () {
  Raffler.dom.resultsCount.text(Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY).length)
}
// refresh chosen items with localStorage values
Raffler.refreshChosenItemsDisplay = function () {
  try {
    var lsChosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)
    if (lsChosenItems && lsChosenItems.length > 0) {
      var ordinal = 1

      Raffler.dom.admin.textChosenItems.text('')
      Raffler.dom.resultsContent.text('')
      Raffler.dom.resultsWrapper.show()

      $.each(lsChosenItems, function (key, val) {
        Raffler.dom.resultsContent.prepend('<li>' + ordinal++ + '. ' + val.name + ' (' + val.affl + ')</li>')
        Raffler.dom.admin.textChosenItems.prepend(val.name + ' (' + val.affl + `)\n`)
      })
      Raffler.dom.admin.textChosenItemsCount.text(`(${lsChosenItems.length})`)

      Raffler._notify('refreshChosenItemsDisplay: display updated')
    } else {
      Raffler.dom.admin.textChosenItems.text('')
      Raffler._notify('refreshChosenItemsDisplay: none to display', 'warning')
    }
  } catch (e) {
    Raffler._notify('refreshChosenItemsDisplay: ' + e, 'error')
  }
}
// refresh user items with localStorage values
Raffler.refreshUserItemsDisplay = function () {
  try {
    var lsUserItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)
    if (lsUserItems && lsUserItems.length > 0) {
      $.each(lsUserItems, function (key, val) {
        Raffler.dom.userItemsDisplay.children().append('<li>' + val.name + ' (' + val.affl + ')</li>')
      })

      Raffler._notify('refreshUserItemsDisplay: display updated', 'notice')
    } else {
      Raffler.dom.userItemsDisplay.html('')
      Raffler._notify('refreshUserItemsDisplay: none to display')
    }
  } catch (e) {
    Raffler._notify('refreshUserItemsDisplay: ' + e, 'error')
  }
}
// re-display available items from in-memory itemsArr
Raffler.refreshAvailableItemsDisplay = function () {
  Raffler.dom.admin.textAvailableItems.text('')
  Raffler.itemsArr.forEach(function (item) {
    Raffler.dom.admin.textAvailableItems.prepend(item.name + ' (' + item.affl + `)\n`)
  })
  Raffler.dom.admin.textAvailableItemsCount.text(`(${Raffler.itemsArr.length})`)

  Raffler._notify('refreshAvailableItems: display updated', 'notice')
}

// add last chosen item to localStorage
Raffler.addChosenItemToLocalStorage = function (lastChosenItem) {
  try {
    var localChosenItemsObj = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)
    localChosenItemsObj.push(lastChosenItem)
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, localChosenItemsObj)
    Raffler.refreshAvailableItemsDisplay()
    Raffler._notify('addChosenItemToLocalStorage: ' + lastChosenItem.name + ' added to LS', 'notice')
  } catch (e) {
    Raffler._notify('addChosenItemToLocalStorage: ' + e, 'error')
  }
}

// timer object to keep track of countdown
Raffler.timer = function (callbackFunc, timing) {
  if (Raffler.itemsArr) {
    var variableInterval = {
      items: Raffler.itemsArr,
      mult: Raffler.initMult,
      stage: 0,
      interval: timing,
      callback: callbackFunc,
      stopped: false,
      startCountdown: false,
      index: Math.floor(Math.random() * Raffler.itemsArr.length),
      runLoop: function () {
        if (variableInterval.stopped) return
        // check to see if the time interval is at the end of a raffle
        var result = variableInterval.callback(variableInterval)

        if (typeof result === 'number') {
          if (result === 0) { return }
          variableInterval.interval = result
        }
        Raffler.dom.admin.intervalValue.text(result)
        // switch to next item if countdown not done
        if (variableInterval.stage !== 4 && variableInterval.items.length) {
          var curIndex = variableInterval.items[variableInterval.index]

          // check for valid data
          if (curIndex.name && curIndex.affl) {
            var chosenItemHTML = ''
            chosenItemHTML += `<div class='item-name'>${curIndex.name}</div>\n`
            chosenItemHTML += `<div class='item-affl'>${curIndex.affl}</div>`

            Raffler.dom.itemsCycle.html(chosenItemHTML)

            $('div#items-graph span').each(function () {
              if (variableInterval.index === parseInt($(this)[0].id)) {
                $(this).addClass('chosen')
              } else {
                $(this).removeClass('chosen')
              }
            })

            variableInterval.index++
          } else {
            variableInterval.index = 0
          }
        }
        // reached the end of items array? back to beginning
        if (variableInterval.index === variableInterval.items.length) {
          variableInterval.index = 0
        }
        // loop
        if (variableInterval.stage !== 4) {
          variableInterval.loop()
        }
      },
      stop: function () {
        this.stopped = true
        window.clearTimeout(this.timeout)
      },
      start: function () {
        this.stopped = false
        return this.loop()
      },
      loop: function () {
        this.timeout = window.setTimeout(this.runLoop, this.interval)
        return this
      }
    }

    return variableInterval.start()
    // return variableInterval
  }
}

// main timer instance for raffler cycler
window.countdownTimer = Raffler.timer(function () {
  // this is the variableInterval - so we can change/get the interval here:
  var interval = this.interval

  if (this.startCountdown) {
    // slow down at a certain point
    if (this.interval > 150 && this.interval <= 250) {
      this.stage = Raffler.stages.SLOWED
      Raffler.dom.admin.stageValue.text(this.stage)

      if (Raffler.dom.admin.ckOptResize.is(':checked')) {
        Raffler.dom.itemsCycle.removeClass()
        Raffler.dom.itemsCycle.addClass('level2')
        Raffler.dom.body.removeClass()
        Raffler.dom.body.addClass('level2')
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 && this.interval <= 325) {
      this.stage = Raffler.stages.SLOWEST
      Raffler.dom.admin.stageValue.text(this.stage)

      if (Raffler.dom.admin.ckOptResize.is(':checked')) {
        Raffler.dom.itemsCycle.removeClass()
        Raffler.dom.itemsCycle.addClass('level3')
        Raffler.dom.body.removeClass()
        Raffler.dom.body.addClass('level3')
      }
    }

    // finally, stop and pick an item!
    if (this.interval > 325) {
      this.mult = Raffler.initMult
      if (this.interval > 350) {
        this.mult = this.mult++
      }

      // adjust for odd time drift
      // if (Raffler.timesRun > 0) Raffler.lastInterval = 349

      // WINNER WINNER CHICKEN DINNER
      if (this.interval >= Raffler.lastInterval) {
        this.stage = Raffler.stages.DONE
        Raffler.dom.admin.stageValue.text(this.stage)
        this.startCountdown = false
        this.stop()

        if (Raffler.dom.admin.ckOptResize.is(':checked')) {
          Raffler.dom.itemsCycle.removeClass()
        }

        Raffler.dom.itemsCycle.addClass('level-win')
        Raffler.dom.body.addClass('level4')
        Raffler._playSound('victory')

        Raffler.lastItemChosen = {
          'name': $('div.item-name').text(),
          'affl': $('div.item-affl').text()
        }

        Raffler._readName(Raffler.lastItemChosen)

        // confirm winner
        Raffler._enableChosenConfirm()

        // increment counter of times run
        Raffler.timesRun++
        Raffler.dom.admin.timesRunValue.text(Raffler.timesRun)
      } else {
        var intervalMult = interval + this.mult
        Raffler.dom.admin.intervalRange.val(intervalMult)
        return intervalMult
      }
    }
  }

  // start countdown!
  if (this.startCountdown && (this.stage === Raffler.stages.INIT || this.stage === Raffler.stages.BEGUN)) {
    this.stage = Raffler.stages.BEGUN
    Raffler.dom.admin.stageValue.text(this.stage)
    if (!Raffler.dom.itemsCycle.hasClass('level1')) {
      Raffler.dom.itemsCycle.addClass('level1')
    }
    Raffler._playSound('countdown')
  }
  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > Raffler.stages.INIT && this.stage !== Raffler.stages.DONE) {
    var newInterval = interval + (1.75 ^ this.mult++)
    Raffler.dom.admin.multiplyValue.text(this.mult)
    Raffler.dom.admin.intervalRange.val(newInterval)
    return newInterval
  }
}, Raffler.initInterval)

Raffler.timerStart = function() {
  window.countdownTimer.start()
  Raffler.dom.itemsCycle.removeClass('stopped')
  Raffler._disableTimerStart()
  Raffler._enableTimerStop()
  Raffler._notify('window.countdownTimer started', 'notice')
}

Raffler.timerStop = function() {
  window.countdownTimer.stop()
  Raffler.dom.itemsCycle.addClass('stopped')
  Raffler._disableTimerStop()
  Raffler._enableTimerStart()
  Raffler._notify('window.countdownTimer stopped', 'notice')
}

// you hit the big raffle button
Raffler.raffleButtonSmash = function () {
  Raffler._notify('BUTTON SMASH', 'notice')
  Raffler._disableRaffle()

  if (Raffler.dom.admin.ckOptResize.is(':checked')) {
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.itemsArr.length > 1) {
    window.countdownTimer.interval = Raffler.initInterval
    window.countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)
    window.countdownTimer.stage = Raffler.stages.INIT
    Raffler.dom.admin.stageValue.text(this.stage)
    window.countdownTimer.startCountdown = true
    window.countdownTimer.mult = 1
    window.countdownTimer.start()
  }
  // we got 1 choice, so no choice, really
  // no countdown
  if (Raffler.itemsArr.length === 1) {
    Raffler._notify('Only one item to raffle!<br /><strong>instant winner!</strong>', 'warning', true)

    // add lone item to items-cycle
    var loneItemHTML = ''
    loneItemHTML += '<div class=\'item-name\'>' + Raffler.itemsArr[0].name + `</div>\n`
    loneItemHTML += '<div class=\'item-affl\'>' + Raffler.itemsArr[0].affl + '</div>'

    Raffler.dom.itemsCycle.html(loneItemHTML)
    Raffler.dom.itemsCycle.addClass('level4')

    // grab lone item
    Raffler.lastItemChosen = {
      'name': $('div.item-name').text(),
      'affl': $('div.item-affl').text()
    }

    if (Raffler.dom.admin.ckOptResize.is(':checked')) {
      Raffler.dom.itemsCycle.removeClass()
    }

    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level-win')
    Raffler.dom.body.addClass('level4')
    Raffler._playSound('victory')
    Raffler._readName(Raffler.lastItemChosen)

    // remove last chosen item from Raffler.itemsArr if anything picked
    if (Raffler.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler.addChosenItemToLocalStorage(Raffler.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler.refreshChosenItemsDisplay()
      // update results count
      Raffler.refreshResultsCount()

      var item = Raffler.lastItemChosen
      var items = Raffler.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].name === item.name && items[i].affl === item.affl) {
          items.splice(i, 1)
          Raffler.itemsLeftArr = items
          Raffler.refreshItemsGraph(Raffler.itemsLeftArr)
          Raffler.refreshAvailableItemsDisplay()
          break
        }
      }
    }
    Raffler._notify('Raffled successfully! ' + Raffler.lastItemChosen.name + ' chosen!', 'success')

    // increment counter of times run
    Raffler.timesRun++
    Raffler.dom.admin.timesRunValue.text(Raffler.timesRun)
  }

  Raffler.refreshDebugValues()
}

// after confirming a winner or not, go back to raffling
Raffler.continueRaffling = function () {
  // if we have confirmed, then take out of raffle
  if (Raffler.lastItemChosenConfirmed) {
    Raffler.lastItemChosen = {
      'name': $('div.item-name').text(),
      'affl': $('div.item-affl').text()
    }

    if (Raffler.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler.addChosenItemToLocalStorage(Raffler.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler.refreshChosenItemsDisplay()
      // update results count
      Raffler.refreshResultsCount()

      var item = Raffler.lastItemChosen
      var items = Raffler.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].name === item.name && items[i].affl === item.affl) {
          items.splice(i, 1)
          Raffler.itemsLeftArr = items
          Raffler.refreshItemsGraph(Raffler.itemsLeftArr)
          Raffler.refreshAvailableItemsDisplay()
          break
        }
      }

      Raffler._notify('Raffled successfully! ' + Raffler.lastItemChosen.name + ' chosen!', 'success')
    } else {
      Raffler._notify('Choice could not be made. Pool of choices unchanged.', 'warning')
    }
  } else {
    Raffler._notify('Choice rejected. Pool of choices unchanged.', 'notice')
  }

  // either way, disable confirm buttons
  // and re-enable raffler
  Raffler._disableChosenConfirm()
  Raffler._enableRaffle()

  // start an infinite cycle
  window.countdownTimer.interval = Raffler.initInterval
  window.countdownTimer.mult = 1
  window.countdownTimer.stage = Raffler.stages.INIT
  window.countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)

  Raffler.dom.admin.intervalRange.val(parseInt(Raffler.initInterval))
  Raffler.dom.admin.intervalValue.text(Raffler.dom.admin.intervalRange.val())
  Raffler.dom.admin.stageValue.text(this.stage)

  if (Raffler.dom.admin.ckOptResize.is(':checked')) {
    Raffler.dom.body.removeClass()
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.body.addClass('level4')
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  Raffler.refreshDebugValues()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.start()
}

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// get the whole show going!
Raffler.initApp()
