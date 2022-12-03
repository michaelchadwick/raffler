/* main */
/* app entry point and main functions */
/* eslint-disable no-undef */
/* global $, Raffler */

// settings: saved in LOCAL STORAGE
Raffler.settings = RAFFLER_DEFAULTS.settings

// config: only saved while game is loaded
Raffler.config = RAFFLER_DEFAULTS.config

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
            <!--
            <div class="setting-row">
              <div class="text">
                <div class="title">Sound: Name</div>
                <div class="description">Read choice out loud when chosen (requires <code>talkifyKey</code>.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-sound-name" data-status="" class="switch" onclick="Raffler._changeSetting('soundName')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            -->

            <!-- user items -->
            <!--
            <div class="setting-row">
              <div class="text">
                <div class="title">User Items</div>
                <div class="description">Additional items to raffle.</div>
              </div>
              <div class="control">
                <div class="container">
                  <input id="text-user-items-add-name" type="text" placeholder="name" />
                  <input id="text-user-items-add-affl" type="text" placeholder="affiliation" />

                  <div class="buttons">
                    <button class="icon" id="button-user-items-add" onclick="Raffler._addUserItem()">
                      <i class="fas fa-plus"></i>
                    </button>
                    <button class="icon" id="button-user-items-clear" onclick="Raffler._removeUserItem()">
                      <i class="fas fa-minus-circle"></i>
                    </button>
                  </div>

                  <div id="user-items-display">
                    <ul></ul>
                  </div>
                </div>
              </div>
            </div>
            -->

            <!-- show debug -->
            <!--
            <div class="setting-row">
              <div class="text">
                <div class="title">Debug Settings</div>
                <div class="description">Show additional debugging settings.</div>
              </div>
              <div class="control">
                <div class="container">
                  <div id="button-setting-show-debug" data-status="" class="switch" onclick="Raffler._changeSetting('showDebug')">
                    <span class="knob"></span>
                  </div>
                </div>
              </div>
            </div>
            -->

            <!-- DEBUG DEBUG DEBUG -->
            <div id="settings-debug">

              <!-- timer: start -->
              <div class="setting-row">
                <div class="text">
                  <div class="title">Timer: Start</div>
                  <div class="description">Start the cycling timer.</div>
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
                  <div class="description">Stop the cycling timer.</div>
                </div>
                <div class="control">
                  <div class="container">
                    <a href="#" class="button stop" id="button-timer-stop"><i class="fas fa-play"></i> stop</a>
                  </div>
                </div>
              </div>
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
                  <div class="description">Show a graph of items being cycled over.</div>
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
                  <div class="title">Available Items <span id="debug-items-available-count"></span></div>
                  <div class="description">Items currently in the pool to be chosen during a countdown.</div>
                </div>
                <div class="control">
                  <div class="container">
                    <textarea readonly id="debug-items-available"></textarea>
                  </div>
                </div>
              </div>

              <div class="setting-row">
                <div class="text">
                  <div class="title">Chosen Items</div>
                  <div class="description">Items in the pool that have been chosen.</div>
                </div>
                <div class="control">
                  <div class="container">
                    <textarea readonly id="debug-items-chosen"></textarea>
                  </div>
                </div>
              </div>
            </div>

          </div>
        `,
        null,
        null
      )

      Raffler._loadSettings()

      break

    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Raffler.config',
        Raffler._displayAppConfig(),
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
  Raffler.env = RAFFLER_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

  // if local dev, show debug stuff
  if (Raffler.env == 'local') {
    Raffler._initDebug()

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
  Raffler._refreshItemsGraph(Raffler.config.itemsLeftArr)

  // we have previously-chosen items
  // add them to in-memory list
  if (Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY).length) {
    Raffler._refreshChosenItemsDisplay()
    Raffler.dom.resultsWrapper.show()
  }

  // Raffler.__disableTimerStart()

  Raffler.__initCycleText()

  Raffler._timerStop()
  Raffler.dom.interactive.btnRaffle.focus()

  Raffler._notify('Raffler init', 'notice')
}

// handy combo shortcut of methods to reset application
Raffler.resetApp = function () {
  Raffler._initItemsArr()

  Raffler.config.lastItemChosen = ''
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
  Raffler.dom.resultsWrapper.hide()

  Raffler.__enableRaffle()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL
  window.countdownTimer.mult = RAFFLER_DEFAULT_MULTIPLY
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.start()

  Raffler.timesRun = 0

  Raffler._refreshDebugValues()
}

/*************************************************************************
 * _private methods *
 *************************************************************************/

Raffler._initDebug = function() {
  if (Raffler.dom.interactive.debug.all) {
    // show debug buttons
    Raffler.dom.interactive.debug.all.css('display', 'flex')

    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll('button.icon').forEach((btn) => {
      btn.style.fontSize = '16px'
    })
  }
}
// fill in-memory itemsArr with server JSON
Raffler._initItemsArr = function () {
  $.getJSON(Raffler.settings.dataFilePath, function () {})
    .done(function (data) {
      while (Raffler.config.itemsArr.length) {
        Raffler.config.itemsArr.pop()
      }

      Raffler.config.itemsArr.length = 0

      if (Raffler.config.itemsArr) {
        $.each(data, function (key, val) {
          Raffler.config.itemsArr.push(val)
        })

        Raffler.__shuffleArray(Raffler.config.itemsArr)
        Raffler.config.itemsLeftArr = Raffler.config.itemsArr
        Raffler._refreshItemsGraph(Raffler.config.itemsLeftArr)
        Raffler._syncChosenItemsWithItemsArr()
        Raffler._syncUserItemsWithItemsArr()
      }
    })
    .fail(function (jqxhr, textStatus, e) {
      Raffler._notify('Failed initial data load: ' + e, 'error', true)
    })
}

Raffler._loadSettings = function() {
  if (localStorage.getItem(RAFFLER_SETTINGS_KEY)) {
    var setting = null;
    var lsSettings = JSON.parse(localStorage.getItem(RAFFLER_SETTINGS_KEY))

    if (lsSettings) {
      if (lsSettings.boxResize) {
        Raffler.settings.boxResize = lsSettings.boxResize

        setting = document.getElementById('button-setting-box-resize')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.soundCountdown) {
        Raffler.settings.soundCountdown = lsSettings.soundCountdown

        setting = document.getElementById('button-setting-sound-countdown')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.soundVictory) {
        Raffler.settings.soundVictory = lsSettings.soundVictory

        setting = document.getElementById('button-setting-sound-victory')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.soundName) {
        Raffler.settings.soundName = lsSettings.soundName

        setting = document.getElementById('button-setting-sound-name')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      /* DEBUG */

      if (lsSettings.showGraph) {
        Raffler.settings.showGraph = lsSettings.showGraph

        setting = document.getElementById('button-setting-show-graph')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.allowNotifications) {
        Raffler.settings.allowNotifications = lsSettings.allowNotifications

        setting = document.getElementById('button-setting-allow-notifications')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (Raffler.config.itemsArr) {
        const items = Raffler.config.itemsArr

        var itemsDisplay = document.getElementById('debug-items-available')
        var itemsCount = document.getElementById('debug-items-available-count')

        if (itemsDisplay) {
          itemsDisplay.value = JSON.stringify(items)
        }
        if (itemsCount) {
          itemsCount.innerText = `(${items.length})`
        }
      }
    }
  } else {
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, Raffler.settings)
  }

  if (localStorage.getItem(RAFFLER_USER_ITEMS_KEY)) {
    Raffler._notify('raffler-user-items already exists', 'notice')
  } else {
    Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, [])
    Raffler._notify('raffler-user-items created', 'notice')
  }

  if (localStorage.getItem(RAFFLER_CHOSEN_ITEMS_KEY)) {
    Raffler._notify('raffler-chosen-items already exists', 'notice')
  } else {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, [])
    Raffler._notify('raffler-chosen-items created!', 'notice')
  }
}
Raffler._changeSetting = function(setting, event = null) {
  let st = null;

  switch (setting) {
    case 'boxResize': {
      st = document.getElementById('button-setting-box-resize').dataset.status

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
    }
    case 'soundCountdown': {
      st = document.getElementById('button-setting-sound-countdown').dataset.status

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
    }
    case 'soundVictory': {
      st = document.getElementById('button-setting-sound-victory').dataset.status

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
    }
    case 'soundName': {
      st = document.getElementById('button-setting-sound-name').dataset.status

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
    }
    case 'showDebug': {
      st = document.getElementById('button-setting-show-debug').dataset.status

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
    }
    case 'intervalValue': {
      const val = parseInt(event.target.value)

      // update text setting DOM
      Raffler.dom.intervalValue = val

      // update timer
      window.countdownTimer.interval = val

      break
    }
    case 'showGraph': {
      st = document.getElementById('button-setting-show-graph').dataset.status

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
    }
    case 'allowNotifications': {
      st = document.getElementById('button-setting-allow-notifications').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-notifications').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('allowNotifications', true)

        Raffler.__toggleTestNotices()
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-notifications').dataset.status = 'false'

        Raffler._saveSetting('allowNotifications', false)

        Raffler.__toggleTestNotices()
      }
      break
    }
  }
}
Raffler._saveSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(RAFFLER_SETTINGS_KEY))

  if (settings) {
    // set internal code model
    Raffler.settings[setting] = value

    // set temp obj that will go to LS
    settings[setting] = value

    // save all settings to LS
    localStorage.setItem(RAFFLER_SETTINGS_KEY, JSON.stringify(settings))
  }

  // console.log('!global setting saved!', Raffler.settings)
}

// modal: debug: display Raffler.config
Raffler._displayAppConfig = function() {
  let config = Raffler.config

  var html = ''

  html += `<h4>GLOBAL (ENV: ${Raffler.env})</h4>`
  html += '<h4>----------------------------</h4>'

  html += '<dl>'

  Object.keys(config).sort().forEach(key => {
    // if value is an object, dig in
    if (
      (typeof config[key] == 'object'
        && !Array.isArray(config[key])
        && config[key] != null
      )
    ) {
      html += `<dd><code>${key}: {</code><dl>`

      Object.keys(config[key]).forEach(k => {
        var label = k
        var value = config[key][k]

        if (Object.keys(value)) {
          // console.log('found another object', key, label, value)
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
        }
      })

      html += '</dl><code>}</code></dd>'
    }
    else {
      var label = key
      var value = config[key]

      html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
    }
  })

  html += '</dl>'

  return html
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

  // local debug buttons
  if (Raffler.env == 'local') {
    if (Raffler.dom.interactive.debug.all) {
      // ⚙ show current Raffler config
      Raffler.dom.interactive.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })
    }
  }

  // main raffling events
  Raffler.dom.itemsCycle.click(function () {
    Raffler._notify('starting the cycle')
    Raffler.__enableRaffle()
    Raffler._timerStart()
  })
  Raffler.dom.interactive.btnRaffle.click(function (e) {
    e.preventDefault()
    if (!Raffler.dom.interactive.btnRaffle.prop('disabled')) {
      Raffler._raffleButtonSmash()
    }
  })
  Raffler.dom.interactive.btnChosenConfirmYes.click(function () {
    Raffler.config.lastItemChosenConfirmed = true
    Raffler._continueRaffling()
  })
  Raffler.dom.interactive.btnChosenConfirmNo.click(function () {
    Raffler.config.lastItemChosenConfirmed = false
    Raffler._continueRaffling()
  })
  Raffler.dom.interactive.btnExportResults.click(function (e) {
    e.preventDefault()
    Raffler._notify('exporting results', 'notice')

    var plainText = $('div#results-wrapper div ul')
      .html()
      .replace(/<li>/g, '')
      .replace(/<\/li>/g, '\r\n')

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

  //       if (!Raffler.__isDuplicateValue(newUserItem)) {
  //         tempUserItemObj.push(Raffler.__sanitize(newUserItem))
  //         Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
  //         Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')
  //         // update localStorage with temp tempUserItemObj
  //         Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, tempUserItemObj)
  //         // show status bubble
  //         Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" added!', 'success', true)
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
    Raffler.config.hasLocalStorage = false
    Raffler.dom.userItemsManager.hide()
    Raffler._notify('No localStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
  }
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler._resetChosenItems = function () {
  try {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, [])
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

    for (var i = 0; i < Raffler.config.itemsArr.length; i++) {
      for (var j = 0; j < lsUserItems.length; j++) {
        if (Raffler.config.itemsArr[i].name === lsUserItems[j].name &&
            Raffler.config.itemsArr[i].affl === lsUserItems[j].affl) {
          itemsSpliced = Raffler.config.itemsArr.splice(i, 1)[0] // eslint-disable-line
        }
      }
    }

    Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, [])
    Raffler._refreshUserItemsDisplay()
    Raffler._refreshAvailableItemsDisplay()

    Raffler._notify('User items reset', 'success', true)
  } catch (e) {
    Raffler._notify('resetUserItems: ' + e, 'error')
  }
}

// TODO
Raffler._addUserItem = function() {
  const name = document.getElementById('text-user-items-add-name').value
  const affl = document.getElementById('text-user-items-add-affl').value

  if (name != '' && affl != '') {
    $('#user-items-display ul').append(`<li>${name} - ${affl}</li>`)
  }
}
// TODO
Raffler._removeUserItem = function() {

}

// remove previously chosen items from in-memory itemsArr
Raffler._syncChosenItemsWithItemsArr = function () {
  try {
    var items = Raffler.config.itemsArr
    var itemsSpliced = [] // eslint-disable-line
    var chosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (chosenItems && chosenItems.length > 0) {
      for (var i = 0; i < chosenItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (chosenItems[i].name === items[j].name &&
              chosenItems[i].affl === items[j].affl) {
            itemsSpliced = items.splice(j, 1)[0] // eslint-disable-line
          }
        }
      }
      Raffler.config.itemsLeftArr = items
      Raffler._refreshItemsGraph(Raffler.config.itemsLeftArr)

      Raffler._notify('syncChosenItemsWithItemsArr: synced', 'notice')
    } else {
      Raffler._notify('syncChosenItemsWithItemsArr: none to sync', 'notice')
    }

    // all items have been chosen on reload
    if (items.length === 0) {
      window.countdownTimer.stop()
      Raffler.__disableRaffle()
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
    var items = Raffler.config.itemsArr
    var userItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)
    var userItemWillBeAdded = true

    // if we've previously added user items
    if (userItems && userItems.length > 0) {
      // Raffler.dom.admin.btnUserItemsClear.prop('disabled', false)
      // Raffler.dom.admin.btnUserItemsClear.removeClass('disabled')

      for (var i = 0; i < userItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (userItems[i].name === items[j].name &&
              userItems[i].affl === items[j].affl) {
            userItemWillBeAdded = false
          }
        }
        if (userItemWillBeAdded) {
          Raffler.config.itemsArr.push(userItems[i])
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
  Raffler.settings.intervalRange = RAFFLER_DEFAULT_INTERVAL
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

      Raffler.dom.resultsContent.text('')
      Raffler.dom.resultsWrapper.show()

      $.each(lsChosenItems, function (key, val) {
        Raffler.dom.resultsContent.prepend('<li>' + ordinal++ + '. ' + val.name + ' (' + val.affl + ')</li>')
      })

      Raffler._notify('refreshChosenItemsDisplay: display updated')
    } else {
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
  Raffler.config.itemsArr.forEach(function (item) {
    Raffler.config.itemsAvailable.push(item.name + ' (' + item.affl + ')')
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

  // Raffler.__disableTimerStart()
  // Raffler.__enableTimerStop()

  Raffler._notify('window.countdownTimer started', 'notice')
}

Raffler._timerStop = function() {
  window.countdownTimer.stop()
  Raffler.dom.itemsCycle.addClass('stopped')

  // Raffler.__disableTimerStop()
  // Raffler.__enableTimerStart()

  Raffler._notify('window.countdownTimer stopped', 'notice')
}

// you hit the big raffle button
Raffler._raffleButtonSmash = function () {
  Raffler._notify('BUTTON SMASH', 'notice')
  Raffler.__disableRaffle()

  if (Raffler.settings.boxResize) {
    Raffler.dom.itemsCycle.removeClass()
  } else {
    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.config.itemsArr.length > 1) {
    window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL
    window.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)
    window.countdownTimer.stage = RAFFLER_STAGES.INIT

    // Raffler.dom.admin.stageValue.text(this.stage)

    window.countdownTimer.startCountdown = true
    window.countdownTimer.mult = 1
    window.countdownTimer.start()
  }
  // we got 1 choice, so no choice, really
  // no countdown
  if (Raffler.config.itemsArr.length === 1) {
    Raffler._notify('Only one item to raffle!<br /><strong>instant winner!</strong>', 'warning', true)

    // add lone item to items-cycle
    let loneItemHTML = ''
    loneItemHTML += '<div class=\'item-name\'>' + Raffler.config.itemsArr[0].name + '</div>\n'
    loneItemHTML += '<div class=\'item-affl\'>' + Raffler.config.itemsArr[0].affl + '</div>'

    Raffler.dom.itemsCycle.html(loneItemHTML)
    Raffler.dom.itemsCycle.addClass('level4')

    // grab lone item
    Raffler.config.lastItemChosen = {
      'name': $('div.item-name').text(),
      'affl': $('div.item-affl').text()
    }

    if (Raffler.settings.boxResize) {
      Raffler.dom.itemsCycle.removeClass()
    }

    Raffler.dom.itemsCycle.removeClass()
    Raffler.dom.itemsCycle.addClass('level-win')
    Raffler.dom.body.addClass('level4')
    Raffler._audioPlay('victory')
    Raffler._readName(Raffler.config.lastItemChosen)

    // remove last chosen item from Raffler.config.itemsArr if anything picked
    if (Raffler.config.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler._addChosenItemToLocalStorage(Raffler.config.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshChosenItemsDisplay()
      // update results count
      Raffler._refreshResultsCount()

      var item = Raffler.config.lastItemChosen
      var items = Raffler.config.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].name === item.name && items[i].affl === item.affl) {
          items.splice(i, 1)
          Raffler.config.itemsLeftArr = items
          Raffler._refreshItemsGraph(Raffler.config.itemsLeftArr)
          Raffler._refreshAvailableItemsDisplay()
          break
        }
      }
    }

    Raffler._notify('Raffled successfully! ' + Raffler.config.lastItemChosen.name + ' chosen!', 'success')

    // increment counter of times run
    Raffler.config.timesRun++
  }

  Raffler._refreshDebugValues()
}

// after confirming a winner or not, go back to raffling
Raffler._continueRaffling = function () {
  // if we have confirmed, then take out of raffle
  if (Raffler.config.lastItemChosenConfirmed) {
    Raffler.config.lastItemChosen = {
      'name': $('div.item-name').text(),
      'affl': $('div.item-affl').text()
    }

    if (Raffler.config.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler._addChosenItemToLocalStorage(Raffler.config.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshChosenItemsDisplay()
      // update results count
      Raffler._refreshResultsCount()

      var item = Raffler.config.lastItemChosen
      var items = Raffler.config.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].name === item.name && items[i].affl === item.affl) {
          items.splice(i, 1)
          Raffler.config.itemsLeftArr = items
          Raffler._refreshItemsGraph(Raffler.config.itemsLeftArr)
          Raffler._refreshAvailableItemsDisplay()
          break
        }
      }

      Raffler._notify('Raffled successfully! ' + Raffler.config.lastItemChosen.name + ' chosen!', 'success')
    } else {
      Raffler._notify('Choice could not be made. Pool of choices unchanged.', 'warning')
    }
  } else {
    Raffler._notify('Choice rejected. Pool of choices unchanged.', 'notice')
  }

  // either way, disable confirm buttons
  // and re-enable raffler
  Raffler.__disableChosenConfirm()
  Raffler.__enableRaffle()

  // start an infinite cycle
  window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL
  window.countdownTimer.mult = 1
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)

  Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL
  // Raffler.dom.config.intervalValue.text(Raffler.dom.config.intervalRange.val())

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
  if (Raffler.config.itemsArr) {
    var variableInterval = {
      items: Raffler.config.itemsArr,
      mult: RAFFLER_DEFAULT_MULTIPLY,
      stage: 0,
      interval: timing,
      callback: callbackFunc,
      stopped: false,
      startCountdown: false,
      index: Math.floor(Math.random() * Raffler.config.itemsArr.length),
      runLoop: function () {
        if (variableInterval.stopped) return
        // check to see if the time interval is at the end of a raffle
        var result = variableInterval.callback(variableInterval)

        if (typeof result === 'number') {
          if (result === 0) { return }
          variableInterval.interval = result
        }

        // Raffler.dom.config.intervalValue.text(result)

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
      this.mult = RAFFLER_DEFAULT_MULTIPLY
      if (this.interval > 350) {
        this.mult = this.mult++
      }

      // adjust for odd time drift
      // if (Raffler.timesRun > 0) Raffler.config.lastInterval = 349

      // WINNER WINNER CHICKEN DINNER
      if (this.interval >= Raffler.config.lastInterval) {
        this.stage = RAFFLER_STAGES.DONE

        // Raffler.dom.admin.stageValue.text(this.stage)

        this.startCountdown = false
        this.stop()

        if (Raffler.settings.boxResize) {
          Raffler.dom.itemsCycle.removeClass()
        }

        Raffler.dom.itemsCycle.addClass('level-win')
        Raffler.dom.body.addClass('level4')
        Raffler._audioPlay('victory')

        Raffler.config.lastItemChosen = {
          'name': $('div.item-name').text(),
          'affl': $('div.item-affl').text()
        }

        Raffler._readName(Raffler.config.lastItemChosen)

        // confirm winner
        Raffler.__enableChosenConfirm()

        // increment counter of times run
        Raffler.timesRun++
        Raffler.config.timesRunValue = Raffler.timesRun
      } else {
        var intervalMult = interval + this.mult

        Raffler.config.intervalRange = intervalMult

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

    Raffler._audioPlay('countdown')
  }
  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > RAFFLER_STAGES.INIT && this.stage !== RAFFLER_STAGES.DONE) {
    var newInterval = interval + (1.75 ^ this.mult++)

    Raffler.config.multiplyValue = this.mult
    Raffler.config.intervalRange = newInterval

    return newInterval
  }
}, RAFFLER_DEFAULT_INTERVAL)

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

Raffler.__initCycleText = function () {
  Raffler.dom.itemsCycle.html('<section id="init-raffler-cycle"><a href="#">BEGIN RAFFLE!</a></section>')
  Raffler.__disableRaffle()
}

// encode user entries html
Raffler.__sanitize = function (newEntry) {
  $.each(newEntry, function (key, val) {
    newEntry.val = val.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/""/g, '&quot;')
  })

  return newEntry
}

// check for duplicate user entries
Raffler.__isDuplicateValue = function (newUserItem) {
  $.each(Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY), function (key, val) {
    if (newUserItem.name === val.name && newUserItem.affl === val.affl) {
      return true
    }
  })

  return false
}

Raffler.__shuffleArray = function (array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

Raffler.__disableRaffle = function () {
  Raffler.dom.body.removeClass()
  Raffler.dom.interactive.btnRaffle.prop('disabled', true).addClass('disabled')
}
Raffler.__enableRaffle = function () {
  Raffler.dom.interactive.btnRaffle.prop('disabled', false).removeClass('disabled')
}
Raffler.__disableChosenConfirm = function () {
  Raffler.dom.chosenConfirm.hide()
  Raffler.dom.interactive.btnChosenConfirmYes.prop('disabled', true).addClass('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.prop('disabled', true).addClass('disabled')

  // Raffler.__enableTimerStop()
}
Raffler.__enableChosenConfirm = function () {
  Raffler.dom.chosenConfirm.show()
  Raffler.dom.interactive.btnChosenConfirmYes.prop('disabled', false).removeClass('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.prop('disabled', false).removeClass('disabled')

  // Raffler.__disableTimerStart()
  // Raffler.__disableTimerStop()
}
// Raffler.__disableTimerStart = function () {
//   Raffler.dom.admin.btnTimerStart.prop('disabled', true).addClass('disabled')
// }
// Raffler.__enableTimerStart = function () {
//   Raffler.dom.admin.btnTimerStart.prop('disabled', false).removeClass('disabled')
// }
// Raffler.__disableTimerStop = function () {
//   Raffler.dom.admin.btnTimerStop.prop('disabled', true).addClass('disabled')
// }
// Raffler.__enableTimerStop = function () {
//   Raffler.dom.admin.btnTimerStop.prop('disabled', false).removeClass('disabled')
// }

Raffler.__toggleTestNotices = function () {
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

/************************************************************************
 * START THE ENGINE *
 ************************************************************************/

window.onload = Raffler.initApp()
