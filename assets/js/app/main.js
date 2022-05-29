/* main */
/* app entry point and main functions */
/* global $, Raffler, talkify */

Raffler.audioContext = new (window.AudioContext || window.webkitAudioContext)()

// main app settings
// feel free to change to suit particular usage
Raffler.settings = {
  "boxResize": true,
  "dataFilePath": './assets/json/raffler_data.json',
  "logoFileLink": '',
  "logoFilePath": '',
  "notifierEnabled": false,
  "showDebug": false,
  "showGraph": false,
  "soundCountdown": false,
  "soundVictory": false,
  "soundName": false,
  "talkifyKey": ""
}
Raffler.settings.debug = {
  "allowNotifications": true,
  "intervalRange": RAFFLER_SETTINGS_INTERVAL_DEFAULT,
  "multiply": RAFFLER_SETTINGS_MULTIPLY_DEFAULT,
  "stage": 0,
  "textAvailableItems": [],
  "textChosenItems": [],
  "timesRun": 0
}

// Raffler properties
Raffler.hasLocalStorage = true
Raffler.itemsArr = []
Raffler.itemsLeftArr = []
Raffler.initItemsObj = []
Raffler.lastItemChosen = ''
Raffler.lastItemChosenConfirmed = false
Raffler.lastInterval = 361

/*************************************************************************
 * public methods *
 *************************************************************************/

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
      this.myModal = new Modal('perm', 'Settings',
        `
          <div id="settings">
            <!-- box resize -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Box/Text Resize</div>
                <div class="description">Allow raffle box and inner text to grow as the raffler counts down.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-box-resize" data-status="" class="switch" onclick="Raffler._changeSetting('boxResize')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            <!-- sound: countdown -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Sound: Countdown</div>
                <div class="description">Play sound that kicks off raffler countdown.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-sound-countdown" data-status="" class="switch" onclick="Raffler._changeSetting('soundCountdown')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            <!-- sound: victory -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Sound: Victory</div>
                <div class="description">Play sound when a choice is made.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-sound-victory" data-status="" class="switch" onclick="Raffler._changeSetting('soundVictory')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            <!-- sound: name -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Sound: Name</div>
                <div class="description">Read choice out loud (using talkify) when chosen.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-sound-name" data-status="" class="switch" onclick="Raffler._changeSetting('soundName')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            <!-- timer: start -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Timer: Start</div>
                <div class="description">Start the countdown timer.</div>
              </div>
              <div class="control">
                <div class="container">
                  <a href="#" class="button start" id="button-timer-start"><i class="fas fa-play"></i> start</a>
                </div>
              </div>
            </div>
            <!-- timer: stop -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Timer: Stop</div>
                <div class="description">Stop the countdown timer.</div>
              </div>
              <div class="control">
                <div class="container">
                  <a href="#" class="button stop" id="button-timer-stop"><i class="fas fa-play"></i> stop</a>
                </div>
              </div>
            </div>
            <!-- user items -->
            <div class="setting-row">
              <div class="text">
                <div class="title">User Items</div>
                <div class="description">Additional items to raffle.</div>
              </div>
            </div>
            <div class="setting-row">
              <div class="control">
                <div class="container">
                  <input id="text-user-items-add-name" type="text" placeholder="name" />
                  <input id="text-user-items-add-affl" type="text" placeholder="affiliation" />

                  <a href="#" class="button disabled" id="button-user-items-add" disabled><i class="fas fa-plus"></i> add</a>
                  <a href="#" class="button disabled" id="button-user-items-clear" disabled><i class="fas fa-minus-circle"></i> clear</a>

                  <div id="user-items-display">
                    <ul></ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- show debug -->
            <div class="setting-row">
              <div class="text">
                <div class="title">Debug Options</div>
                <div class="description">Show additional helpful debugging settings.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-show-debug" data-status="" class="switch" onclick="Raffler._changeSetting('showDebug')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- DEBUG DEBUG DEBUG -->
            <div id="settings-debug">

              <!-- stage value -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Stage</div>
                  <div class="description"></div>
                </div>
                <div class="control">
                  <div class="container">
                    <div class="values" id="text-setting-stage-value">
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- interval value -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Interval</div>
                  <div class="description"></div>
                </div>
                <div class="control">
                  <div class="container">
                    <div class="values" id="text-setting-interval-value">
                      <span></span>
                      <input type="range" min="1" max="359" step="1" value="25" onchange="Raffler._changeSetting('intervalValue')" />
                    </div>
                  </div>
                </div>
              </div>
              <!-- multiple value -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Multiply</div>
                  <div class="description"></div>
                </div>
                <div class="control">
                  <div class="container">
                    <div class="values" id="text-setting-multiply-value">
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- timesrun value -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Times Run</div>
                  <div class="description">Number of times this instance of Raffler has been run.</div>
                </div>
                <div class="control">
                  <div class="container">
                    <div class="values" id="text-setting-timesrun-value">
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- show graph -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Show Graph</div>
                  <div class="description">Show a graph</div>
                </div>
                <div class-"control">
                  <div class="container">
                    <div id="button-setting-show-graph" data-status="" class="switch" onclick="Raffler._changeSetting('showGraph')">
                      <span class="knob"></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- allow notifications -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Allow Notifications</div>
                  <div class="description">Allow visual notifications for certain events.</div>
                </div>
                <div class="control">
                  <div class="container">
                    <div id="button-setting-allow-notifications" data-status="" class="switch" onclick="Raffler._changeSetting('allowNotifications')">
                      <span class="knob"></span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="control">
                  <div class="container buttons">
                    <button class="button test notice" id="button-test-notice" title="notice" onclick="Raffler._notify('test notice msg that is long enough to actually go onto a second line because of width and such and thus.', 'notice', true)">
                      <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="button test success" id="button-test-success" title="success" onclick="Raffler._notify('test success msg that is long enough to actually go onto a second line because of width and such and thus.', 'success', true)">
                      <i class="fas fa-smile"></i>
                    </button>
                    <button class="button test warning" id="button-test-warning" title="warning" onclick="Raffler._notify('test warning msg that is long enough to actually go onto a second line because of width and such and thus.', 'warning', true)">
                      <i class="fas fa-exclamation-triangle"></i>
                    </button>
                    <button class="button test error" id="button-test-error" title="error" onclick="Raffler._notify('test error msg that is long enough to actually go onto a second line because of width and such and thus.', 'error', true)">
                      <i class="fas fa-times-circle"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="text">
                  <div class="title">Available Items <span></span></div>
                  <div class="description"></div>
                </div>
                <div class="control">
                  <div class="container">
                    <textarea readonly></textarea>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="text">
                  <div class="title">Chosen Items</div>
                  <div class="description"></div>
                </div>
                <div class="control">
                  <div class="container">
                    <textarea readonly></textarea>
                  </div>
                </div>
              </div>
            </div>

          </div>
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

// app entry point
Raffler.initApp = function () {
  // set env
  Raffler.env = ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (Raffler.env == 'local') {
    document.title = '(LH) ' + document.title
  }

  // add logo, if exists
  if (Raffler.settings.logoFilePath !== '' && Raffler.settings.logoFileLink !== '') {
    Raffler.dom.title.append('<span>at</span>')
    Raffler.dom.title.append(`<a href='${Raffler.settings.logoFileLink}' target='_blank'>`)
    Raffler.dom.title.append(`<img id='logo' src='${Raffler.settings.logoFilePath}' />`)
    Raffler.dom.title.append('</a>')
  } else {
    Raffler._notify('raffler_options.user: no custom logo or link found')
  }

  // if we aren't doing the "resize as the raffle counts down" thing
  // then fast track display to final level
  if (!Raffler.settings.boxResize) {
    Raffler.dom.body.removeClass()
    Raffler.dom.body.addClass('level4')
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  Raffler._attachEventListeners()

  Raffler._loadSettings()

  Raffler.resetApp()
  Raffler._refreshDebugValues()
  Raffler._refreshItemsGraph(Raffler.itemsLeftArr)

  if (Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY).length) {
    Raffler._refreshChosenItemsDisplay()
    Raffler.dom.resultsWrapper.show()
  }

  // Raffler._disableTimerStart()

  Raffler._initCycleText()

  Raffler._timerStop()
  Raffler.dom.interactive.btnRaffle.focus()

  Raffler._notify('Raffler init', 'notice')
}

// handy combo shortcut of methods to reset application
Raffler.resetApp = function () {
  Raffler._initItemsArr()

  Raffler.lastItemChosen = ''
  Raffler.timesRun = 0

  Raffler._refreshAvailableItemsDisplay()
  Raffler._refreshResultsCount()
  Raffler._refreshDebugValues()

  Raffler._notify('Raffler reset', 'notice')
}
// you hit the 'reset data' button
// puts everyone back in raffle
// resets stuff, as if you reloaded page
Raffler.resetCountdown = function () {
  if (Raffler.settings.boxResize) {
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  Raffler.resetApp()
  Raffler._resetChosenItems()
  Raffler._resetUserItems()

  Raffler.dom.resultsContent.text('')
  Raffler._clearUserItemsInput()
  Raffler.dom.admin.textAvailableItems.text('')
  Raffler.dom.admin.textChosenItems.text('')
  Raffler.dom.resultsWrapper.hide()
  Raffler._enableRaffle()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.interval = RAFFLER_SETTINGS_INTERVAL_DEFAULT
  window.countdownTimer.mult = RAFFLER_SETTINGS_MULTIPLY_DEFAULT
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.start()

  Raffler.timesRun = 0

  Raffler._refreshDebugValues()
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

Raffler._loadSettings = function() {
  if (localStorage.getItem(LS_SETTINGS_KEY)) {
    var lsConfig = JSON.parse(localStorage.getItem(LS_SETTINGS_KEY))

    if (lsConfig) {
      if (lsConfig.boxResize) {
        Raffler.settings.boxResize = lsConfig.boxResize

        var setting = document.getElementById('button-setting-box-resize')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.soundCountdown) {
        Raffler.settings.soundCountdown = lsConfig.soundCountdown

        var setting = document.getElementById('button-setting-sound-countdown')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.soundVictory) {
        Raffler.settings.soundVictory = lsConfig.soundVictory

        var setting = document.getElementById('button-setting-sound-victory')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.soundName) {
        Raffler.settings.soundName = lsConfig.soundName

        var setting = document.getElementById('button-setting-sound-name')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsConfig.allowNotifications) {
        Raffler.settings.allowNotifications = lsConfig.allowNotifications

        var setting = document.getElementById('button-setting-allow-notifications')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }
    }
  } else {
    Raffler._setLocalStorageItem(LS_SETTINGS_KEY, Raffler.settings)
  }

  if (localStorage.getItem(RAFFLER_USER_ITEMS_KEY)) {
    Raffler._notify('raffler-user-items already exists', 'notice')
  } else {
    Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, Raffler.initItemsObj)
    Raffler._notify('raffler-user-items created', 'notice')
  }

  if (localStorage.getItem(RAFFLER_CHOSEN_ITEMS_KEY)) {
    Raffler._notify('raffler-chosen-items already exists', 'notice')
  } else {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, Raffler.initItemsObj)
    Raffler._notify('raffler-chosen-items created!', 'notice')
  }
}
Raffler._changeSetting = function(setting, event = null) {
  switch (setting) {
    case 'boxResize':
      var st = document.getElementById('button-setting-box-resize').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-box-resize').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('boxResize', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-box-resize').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSetting('boxResize', false)
      }
      break

    case 'soundCountdown':
      var st = document.getElementById('button-setting-sound-countdown').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-sound-countdown').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('soundCountdown', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-sound-countdown').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSetting('soundCountdown', false)
      }
      break

    case 'soundVictory':
      var st = document.getElementById('button-setting-sound-victory').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-sound-victory').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('soundVictory', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-sound-victory').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSetting('soundVictory', false)
      }
      break

    case 'soundName':
      var st = document.getElementById('button-setting-sound-name').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-sound-name').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('soundName', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-sound-name').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSetting('soundName', false)
      }
      break

    case 'showDebug':
      var st = document.getElementById('button-setting-show-debug').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-show-debug').dataset.status = 'true'

        document.getElementById('settings-debug').classList.add('show')

        // save to code/LS
        Raffler._saveSetting('showDebug', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-show-debug').dataset.status = 'false'

        document.getElementById('settings-debug').classList.remove('show')

        // save to code/LS
        Raffler._saveSetting('showDebug', false)
      }
      break

    case 'intervalValue':
      const val = parseInt(event.target.value)

      // update text setting DOM
      Raffler.dom.intervalValue = val

      // update timer
      window.countdownTimer.interval = val

      break

    case 'showGraph':
      var st = document.getElementById('button-setting-show-graph').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-show-graph').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('showGraph', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-show-graph').dataset.status = 'false'

        Raffler._saveSetting('showGraph', false)
      }
      break

    case 'allowNotifications':
      var st = document.getElementById('button-setting-allow-notifications').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-notifications').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('allowNotifications', true)

        Raffler._toggleTestNotices()
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-notifications').dataset.status = 'false'

        Raffler._saveSetting('allowNotifications', false)

        Raffler._toggleTestNotices()
      }
      break
  }
}
Raffler._saveSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(LS_SETTINGS_KEY))

  if (settings) {
    // set internal code model
    Raffler.settings[setting] = value

    // set temp obj that will go to LS
    settings[setting] = value

    // save all settings to LS
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings))
  }

  // console.log('!global setting saved!', Raffler.settings)
}

// handle both clicks and touches outside of modals
Raffler._handleClickTouch = function(event) {
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
Raffler._attachEventListeners = function () {
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
    Raffler._timerStart()
  })
  Raffler.dom.interactive.btnRaffle.click(function (e) {
    e.preventDefault()
    if (!Raffler.dom.interactive.btnRaffle.prop('disabled')) {
      Raffler._raffleButtonSmash()
    }
  })
  Raffler.dom.interactive.btnChosenConfirmYes.click(function () {
    Raffler.lastItemChosenConfirmed = true
    Raffler._continueRaffling()
  })
  Raffler.dom.interactive.btnChosenConfirmNo.click(function () {
    Raffler.lastItemChosenConfirmed = false
    Raffler._continueRaffling()
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

  // TODO: these elements don't exist until settings modal is triggered
  // Raffler.dom.admin.btnDataReset.click(function (e) {
  //   e.preventDefault()
  //   Raffler.dom.dataResetDialog.dialog({
  //     autoOpen: false,
  //     modal: true,
  //     resizeable: false,
  //     height: 'auto',
  //     buttons: {
  //       'Reset it!': function () {
  //         Raffler.resetCountdown()
  //         $(this).dialog('close')
  //       },
  //       'Nevermind.': function () {
  //         $(this).dialog('close')
  //       }
  //     }
  //   })

  //   Raffler.dom.dataResetDialog.dialog('open')
  // })
  // Raffler.dom.admin.inputUserItemsAddName.keyup(function (e) {
  //   var code = e.which
  //   if (code === 13) {
  //     e.preventDefault()
  //     Raffler.dom.admin.btnUserItemsAdd.click()
  //   }

  //   if ($(this).val().length > 0 && Raffler.dom.admin.inputUserItemsAddAffl.val().length > 0) {
  //     Raffler.dom.admin.btnUserItemsAdd.prop('disabled', false)
  //     Raffler.dom.admin.btnUserItemsAdd.removeClass('disabled')
  //   } else {
  //     Raffler.dom.admin.btnUserItemsAdd.prop('disabled', true)
  //     Raffler.dom.admin.btnUserItemsAdd.addClass('disabled')
  //   }
  // })
  // Raffler.dom.admin.inputUserItemsAddAffl.keyup(function (e) {
  //   var code = e.which
  //   if (code === 13) {
  //     e.preventDefault()
  //     Raffler.dom.admin.btnUserItemsAdd.click()
  //   }

  //   if ($(this).val().length > 0 && Raffler.dom.admin.inputUserItemsAddName.val().length > 0) {
  //     Raffler.dom.admin.btnUserItemsAdd.prop('disabled', false)
  //     Raffler.dom.admin.btnUserItemsAdd.removeClass('disabled')
  //   } else {
  //     Raffler.dom.admin.btnUserItemsAdd.prop('disabled', true)
  //     Raffler.dom.admin.btnUserItemsAdd.addClass('disabled')
  //   }
  // })
  // Raffler.dom.admin.btnUserItemsAdd.click(function () {
  //   if (Raffler.dom.admin.inputUserItemsAddName.val() !== '' && Raffler.dom.admin.inputUserItemsAddAffl.val() !== '') {
  //     var newUserItem = {
  //       'name': Raffler.dom.admin.inputUserItemsAddName.val().trim(),
  //       'affl': Raffler.dom.admin.inputUserItemsAddAffl.val().trim()
  //     }

  //     if (newUserItem !== undefined) {
  //       var tempUserItemObj = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)

  //       if (!Raffler._isDuplicateValue(newUserItem)) {
  //         tempUserItemObj.push(Raffler._sanitize(newUserItem))
  //         Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
  //         Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')
  //         // update localStorage with temp tempUserItemObj
  //         Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, tempUserItemObj)
  //         // show status bubble
  //         Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" added!', 'success', true)
  //         Raffler._clearUserItemsInput()
  //         Raffler._syncUserItemsWithItemsArr()
  //       } else {
  //         Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" not added: duplicate.', 'error', true)
  //       }
  //     }
  //   }
  // })
  // Raffler.dom.admin.btnUserItemsClear.click(function (e) {
  //   e.preventDefault()
  //   try {
  //     if (Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY).length > 0) {
  //       Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
  //       Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')

  //       Raffler.dom.userItemsClearDialog.dialog({
  //         autoOpen: false,
  //         modal: true,
  //         resizeable: false,
  //         height: 'auto',
  //         buttons: {
  //           'Clear them!': function () {
  //             Raffler._resetUserItems()

  //             Raffler._clearUserItemsInput()

  //             Raffler.dom.admin.btnUserItemsClear.prop('disabled', true)
  //             Raffler.dom.admin.btnUserItemsClear.addClass('disabled')

  //             $(this).dialog('close')
  //           },
  //           'Nevermind.': function () {
  //             $(this).dialog('close')
  //           }
  //         }
  //       })

  //       Raffler.dom.userItemsClearDialog.dialog('open')
  //     }
  //   } catch (err) {
  //     Raffler._notify('btnUserItemsClear: ' + err, 'error')
  //   }
  // })

  window.addEventListener('click', Raffler._handleClickTouch)
  window.addEventListener('touchend', Raffler._handleClickTouch)
}
// check for LS - notify if not found
Raffler._checkForLocalStorage = function () {
  // if we got LS or SS, then set up the user items UI
  var LSsupport = (typeof window.localStorage !== 'undefined')

  if (!LSsupport && !SSsupport) {
    Raffler.hasLocalStorage = false
    Raffler.dom.userItemsManager.hide()
    Raffler._notify('No localStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
  }
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler._resetChosenItems = function () {
  try {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, Raffler.initItemsObj)
    Raffler._refreshChosenItemsDisplay()

    Raffler._notify('resetChosenItems: reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}
// reset raffler-user-items localStorage to nothing and update displays
Raffler._resetUserItems = function () {
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
    Raffler._refreshUserItemsDisplay()
    Raffler._refreshAvailableItemsDisplay()

    Raffler._notify('User items reset', 'success', true)
  } catch (e) {
    Raffler._notify('resetUserItems: ' + e, 'error')
  }
}
Raffler._clearUserItemsInput = function () {
  Raffler.dom.admin.inputUserItemsAddName.val('')
  Raffler.dom.admin.inputUserItemsAddAffl.val('')
}

// fill in-memory itemsArr with server JSON
Raffler._initItemsArr = function () {
  $.getJSON(Raffler.settings.dataFilePath, function () {})
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
        Raffler._refreshItemsGraph(Raffler.itemsLeftArr)
        Raffler._syncChosenItemsWithItemsArr()
        Raffler._syncUserItemsWithItemsArr()
      }
    })
    .fail(function (jqxhr, textStatus, e) {
      Raffler._notify('Failed initial data load: ' + e, 'error', true)
    })
}

// remove previously chosen items from in-memory itemsArr
Raffler._syncChosenItemsWithItemsArr = function () {
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
      Raffler._refreshItemsGraph(Raffler.itemsLeftArr)

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
Raffler._syncUserItemsWithItemsArr = function () {
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
      Raffler._refreshUserItemsDisplay()

      Raffler._notify('syncUserItemsWithItemsArr: synced', 'notice')
    } else {
      Raffler._notify('syncUserItemsWithItemsArr: none to sync', 'notice')
    }

    Raffler._refreshAvailableItemsDisplay()
  } catch (e) {
    Raffler._notify('syncUserItemsWithItemsArr: ' + e, 'error')
  }
}

// refresh items graph
Raffler._refreshItemsGraph = function (items) {
  var index = 0

  Raffler.dom.itemsGraph.html('')

  items.forEach(function () {
    Raffler.dom.itemsGraph
      .append('<span id=' + (index++) + '></span>')
  })
}
// refresh dem debug values in the settings
Raffler._refreshDebugValues = function () {
  Raffler.settings.debug.intervalRange = RAFFLER_SETTINGS_INTERVAL_DEFAULT
}
// refresh number of raffle results with localStorage values
Raffler._refreshResultsCount = function () {
  const chosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)

  if (chosenItems) {
    Raffler.dom.resultsCount.text(chosenItems.length)
  }
}
// refresh chosen items with localStorage values
Raffler._refreshChosenItemsDisplay = function () {
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
Raffler._refreshUserItemsDisplay = function () {
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
Raffler._refreshAvailableItemsDisplay = function () {
  Raffler.itemsArr.forEach(function (item) {
    Raffler.settings.debug.textAvailableItems.prepend(item.name + ' (' + item.affl + `)\n`)
  })

  Raffler._notify('refreshAvailableItems: display updated', 'notice')
}

// add last chosen item to localStorage
Raffler._addChosenItemToLocalStorage = function (lastChosenItem) {
  try {
    var localChosenItemsObj = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)
    localChosenItemsObj.push(lastChosenItem)
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, localChosenItemsObj)
    Raffler._refreshAvailableItemsDisplay()
    Raffler._notify('addChosenItemToLocalStorage: ' + lastChosenItem.name + ' added to LS', 'notice')
  } catch (e) {
    Raffler._notify('addChosenItemToLocalStorage: ' + e, 'error')
  }
}

Raffler._timerStart = function() {
  window.countdownTimer.start()
  Raffler.dom.itemsCycle.removeClass('stopped')

  // Raffler._disableTimerStart()

  // Raffler._enableTimerStop()

  Raffler._notify('window.countdownTimer started', 'notice')
}

Raffler._timerStop = function() {
  window.countdownTimer.stop()
  Raffler.dom.itemsCycle.addClass('stopped')

  // Raffler._disableTimerStop()
  // Raffler._enableTimerStart()

  Raffler._notify('window.countdownTimer stopped', 'notice')
}

// you hit the big raffle button
Raffler._raffleButtonSmash = function () {
  Raffler._notify('BUTTON SMASH', 'notice')
  Raffler._disableRaffle()

  if (Raffler.settings.boxResize) {
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.itemsArr.length > 1) {
    window.countdownTimer.interval = RAFFLER_SETTINGS_INTERVAL_DEFAULT
    window.countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)
    window.countdownTimer.stage = RAFFLER_STAGES.INIT

    // Raffler.dom.admin.stageValue.text(this.stage)

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

    if (Raffler.settings.boxResize) {
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
      Raffler._addChosenItemToLocalStorage(Raffler.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshChosenItemsDisplay()
      // update results count
      Raffler._refreshResultsCount()

      var item = Raffler.lastItemChosen
      var items = Raffler.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].name === item.name && items[i].affl === item.affl) {
          items.splice(i, 1)
          Raffler.itemsLeftArr = items
          Raffler._refreshItemsGraph(Raffler.itemsLeftArr)
          Raffler._refreshAvailableItemsDisplay()
          break
        }
      }
    }
    Raffler._notify('Raffled successfully! ' + Raffler.lastItemChosen.name + ' chosen!', 'success')

    // increment counter of times run
    Raffler.timesRun++
    Raffler.dom.admin.timesRunValue.text(Raffler.timesRun)
  }

  Raffler._refreshDebugValues()
}

// after confirming a winner or not, go back to raffling
Raffler._continueRaffling = function () {
  // if we have confirmed, then take out of raffle
  if (Raffler.lastItemChosenConfirmed) {
    Raffler.lastItemChosen = {
      'name': $('div.item-name').text(),
      'affl': $('div.item-affl').text()
    }

    if (Raffler.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler._addChosenItemToLocalStorage(Raffler.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshChosenItemsDisplay()
      // update results count
      Raffler._refreshResultsCount()

      var item = Raffler.lastItemChosen
      var items = Raffler.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].name === item.name && items[i].affl === item.affl) {
          items.splice(i, 1)
          Raffler.itemsLeftArr = items
          Raffler._refreshItemsGraph(Raffler.itemsLeftArr)
          Raffler._refreshAvailableItemsDisplay()
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
  window.countdownTimer.interval = RAFFLER_SETTINGS_INTERVAL_DEFAULT
  window.countdownTimer.mult = 1
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)

  Raffler.settings.debug.intervalRange = RAFFLER_SETTINGS_INTERVAL_DEFAULT
  // Raffler.dom.settings.debug.intervalValue.text(Raffler.dom.settings.debug.intervalRange.val())

  // Raffler.dom.admin.stageValue.text(this.stage)

  if (Raffler.settings.boxResize) {
    Raffler.dom.body.removeClass()
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.body.addClass('level4')
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  Raffler._refreshDebugValues()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.start()
}

// helper functions
Raffler._initCycleText = function () {
  Raffler.dom.itemsCycle.html('<section id="init-raffler-cycle"><a href="#">BEGIN RAFFLE!</a></section>')
  Raffler._disableRaffle()
}
Raffler._disableRaffle = function () {
  Raffler.dom.body.removeClass()
  Raffler.dom.interactive.btnRaffle.prop('disabled', true).addClass('disabled')
}
Raffler._enableRaffle = function () {
  Raffler.dom.interactive.btnRaffle.prop('disabled', false).removeClass('disabled')
}
Raffler._toggleTestNotices = function () {
  var btns = Raffler.dom.interactive.btnTests

  $.each(btns, function (key) {
    if (!Raffler.settings.notifierEnabled) {
      $(btns[key]).attr('disabled', true)
      $(btns[key]).attr('title', 'Raffler.settings.notifierEnabled is false')
      $(btns[key]).addClass('disabled')
    } else {
      $(btns[key]).attr('disabled')
      $(btns[key]).attr('title', '')
      $(btns[key]).removeClass('disabled')
    }
  })
}
// Raffler._disableTimerStart = function () {
//   Raffler.dom.admin.btnTimerStart.prop('disabled', true).addClass('disabled')
// }
// Raffler._enableTimerStart = function () {
//   Raffler.dom.admin.btnTimerStart.prop('disabled', false).removeClass('disabled')
// }
// Raffler._disableTimerStop = function () {
//   Raffler.dom.admin.btnTimerStop.prop('disabled', true).addClass('disabled')
// }
// Raffler._enableTimerStop = function () {
//   Raffler.dom.admin.btnTimerStop.prop('disabled', false).removeClass('disabled')
// }
Raffler._disableChosenConfirm = function () {
  Raffler.dom.chosenConfirm.hide()
  Raffler.dom.interactive.btnChosenConfirmYes.prop('disabled', true).addClass('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.prop('disabled', true).addClass('disabled')

  // Raffler._enableTimerStop()
}
Raffler._enableChosenConfirm = function () {
  Raffler.dom.chosenConfirm.show()
  Raffler.dom.interactive.btnChosenConfirmYes.prop('disabled', false).removeClass('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.prop('disabled', false).removeClass('disabled')

  // Raffler._disableTimerStart()
  // Raffler._disableTimerStop()
}

// encode user entries html
Raffler._sanitize = function (newEntry) {
  $.each(newEntry, function (key, val) {
    newEntry.val = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/""/g, '&quot;')
  })
  return newEntry
}
// check for duplicate user entries
Raffler._isDuplicateValue = function (newUserItem) {
  $.each(Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY), function (key, val) {
    if (newUserItem.name === val.name && newUserItem.affl === val.affl) {
      return true
    }
  })

  return false
}
// shuffle array
Raffler._shuffleArray = function (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
// localStorage getter/setter
Raffler._getLocalStorageItem = function (lsKey) {
  try {
    return JSON.parse(localStorage.getItem(lsKey))
  } catch (e) {
    console.error('_getLocalStorageItem: ' + e)
    return false
  }
}
Raffler._setLocalStorageItem = function (lsKey, obj) {
  try {
    localStorage.setItem(lsKey, JSON.stringify(obj))
  } catch (e) {
    console.error('_setLocalStorageItem: ' + e)
    return false
  }
}
// app notifications
Raffler._notify = function (msg, type, notifyUser) {
  if (Raffler.settings.allowNotification) {
    type = (typeof type) === 'undefined' ? '' : type
    notifyUser = (typeof notifyUser) === 'undefined' ? '' : notifyUser

    var bgcolor, fgcolor, header, icon
    var speed = 1500

    switch (type) {
      case 'success':
        bgcolor = '#99c24d'
        fgcolor = '#000000'
        header = 'Success'
        speed = 4000
        icon = 'fa-smile'
        break
      case 'warning' || 'warn':
        bgcolor = '#fadf63'
        fgcolor = '#000000'
        header = 'Warning'
        speed = 6000
        icon = 'fa-exclamation-triangle'
        break
      case 'error' || 'err':
        bgcolor = '#632b30'
        fgcolor = '#ffffff'
        header = 'Error'
        speed = 0
        icon = 'fa-times-circle'
        break
      default:
        bgcolor = '#006e90'
        fgcolor = '#ffffff'
        header = 'Notice'
        speed = 4000
        icon = 'fa-info-circle'
        break
    }

    var label = function (raw) {
      var [bgcolor, fgcolor, type, ...msg] = raw.split(' ')
      return [
        `%c${type}%c ${msg.join(' ')}`,
        `background-color: ${bgcolor}; border-right: 3px solid #000; color: ${fgcolor}; padding: 0.15em 0.35em 0.15em 0.5em`,
        ''
      ]
    }

    // 1. notify admin
    console.log.apply(console, label(`${bgcolor} ${fgcolor} ${header.toUpperCase()} ${msg}`))

    // 2. also, optionally, notify user
    if (notifyUser) {
      var d = document.createElement('div')

      $(d).addClass('item-status')
        .css({
          'background-color': bgcolor,
          'color': fgcolor
        })
        .html(`<i class='fas ${icon}'></i> <strong>${header}</strong>: ${msg}`)
        .prependTo('.main-container')
        .click(function () {
          $(this).remove()
        })

      if (speed > 0) {
        $(d).hide()
          .fadeToggle(500)
          .delay(speed)
          .fadeToggle(200)
          .queue(function () {
            $(this).remove()
          })
      } else {
        $(d).hide().fadeToggle(500)
      }
    }
  }
}

// timer object to keep track of countdown
Raffler._timer = function (callbackFunc, timing) {
  if (Raffler.itemsArr) {
    var variableInterval = {
      items: Raffler.itemsArr,
      mult: RAFFLER_SETTINGS_MULTIPLY_DEFAULT,
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

        // Raffler.dom.settings.debug.intervalValue.text(result)

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
window.countdownTimer = Raffler._timer(function () {
  // this is the variableInterval - so we can change/get the interval here:
  var interval = this.interval

  if (this.startCountdown) {
    // slow down at a certain point
    if (this.interval > 150 && this.interval <= 250) {
      this.stage = RAFFLER_STAGES.SLOWED

      // Raffler.dom.admin.stageValue.text(this.stage)

      if (Raffler.settings.boxResize) {
        Raffler.dom.itemsCycle.removeClass()
        Raffler.dom.itemsCycle.addClass('level2')
        Raffler.dom.body.removeClass()
        Raffler.dom.body.addClass('level2')
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 && this.interval <= 325) {
      this.stage = RAFFLER_STAGES.SLOWEST

      // Raffler.dom.admin.stageValue.text(this.stage)

      if (Raffler.settings.boxResize) {
        Raffler.dom.itemsCycle.removeClass()
        Raffler.dom.itemsCycle.addClass('level3')
        Raffler.dom.body.removeClass()
        Raffler.dom.body.addClass('level3')
      }
    }

    // finally, stop and pick an item!
    if (this.interval > 325) {
      this.mult = RAFFLER_SETTINGS_MULTIPLY_DEFAULT
      if (this.interval > 350) {
        this.mult = this.mult++
      }

      // adjust for odd time drift
      // if (Raffler.timesRun > 0) Raffler.lastInterval = 349

      // WINNER WINNER CHICKEN DINNER
      if (this.interval >= Raffler.lastInterval) {
        this.stage = RAFFLER_STAGES.DONE

        // Raffler.dom.admin.stageValue.text(this.stage)

        this.startCountdown = false
        this.stop()

        if (Raffler.settings.boxResize) {
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
        Raffler.settings.debug.timesRunValue = Raffler.timesRun
      } else {
        var intervalMult = interval + this.mult

        Raffler.settings.debug.intervalRange = intervalMult

        return intervalMult
      }
    }
  }

  // start countdown!
  if (this.startCountdown && (this.stage === RAFFLER_STAGES.INIT || this.stage === RAFFLER_STAGES.BEGUN)) {
    this.stage = RAFFLER_STAGES.BEGUN

    // Raffler.dom.admin.stageValue.text(this.stage)

    if (!Raffler.dom.itemsCycle.hasClass('level1')) {
      Raffler.dom.itemsCycle.addClass('level1')
    }

    Raffler._playSound('countdown')
  }
  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > RAFFLER_STAGES.INIT && this.stage !== RAFFLER_STAGES.DONE) {
    var newInterval = interval + (1.75 ^ this.mult++)

    Raffler.settings.debug.multiplyValue = this.mult
    Raffler.settings.debug.intervalRange = newInterval

    return newInterval
  }
}, RAFFLER_SETTINGS_INTERVAL_DEFAULT)

/************************************************************************
 * ON PAGE LOAD, DO THIS *
 ************************************************************************/

// get the whole show going!
Raffler.initApp()
