/* main */
/* app entry point and main functions */
/* eslint-disable no-undef */
/* global Raffler */

// set to true if using /config/raffler_config.user.json
Raffler.config.enableUserConfig = false

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
if (params.enable_user_config) {
  Raffler.config.enableUserConfig = true
}
if (params.enable_debug_settings) {
  Raffler.dom.settingsShowDebug.style.display = 'flex'
}

/*************************************************************************
 * public methods (called from UI) *
 *************************************************************************/

// modal opening functions
async function modalOpen(type) {
  switch(type) {
    case 'help':
      this.myModal = new Modal('perm', 'How to use Raffler',
        `
          <p>Pick something from a collection at random.</p>

          <ol class="help">
            <li>Press the main raffle area to get it going</li>
            <li>Press the "PICK A WINNER!" button to start slowing down the raffler</li>
            <li>Announce the winner!
              <p>If the winner is present: Press "YES", the winner is removed from the pool, and the raffler goes again. If the winner is not present: Press "NO", the winner remains in the pool, and the raffler goes again.</p>
              </p>
            </li>
            <li>Raffler will keep removing winners until it's left with one remaining item, and then it's done.</li>
          </ol>

          <hr />

          <p>Source can be found on <a href="https://github.com/michaelchadwick/raffler">Github</a>. Set up your own Raffler!</p>
        `,
        null,
        null
      )
      break

    case 'show-config':
      this.myModal = new Modal('perm-debug', 'Raffler.config / Raffler.settings',
        Raffler._displayAppConfig(),
        null,
        null
      )
      break

    case 'reset-all':
      this.myModal = new Modal('confirm', 'Are you sure you want to reset Raffler?',
        'Note: all chosen AND user items will be lost.',
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

// you hit the 'reset data' button
// puts everyone back in raffle
// resets stuff, as if you reloaded page
/*************************************************************************
 * _private methods *
 *************************************************************************/

// app entry point
Raffler._initApp = function() {
  Raffler._notify('Raffler init', 'notice')

  // set env
  Raffler.env = RAFFLER_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

  // if local, show debug stuff
  if (Raffler.env == 'local') {
    Raffler._initDebug()

    document.title = '(LH) ' + document.title

    Raffler.dom.settingsShowDebug.style.display = 'flex'
  }

  // if we aren't doing the "resize as the raffle counts down" thing
  // then fast track display to final level
  if (!Raffler.settings.boxResize) {
    Raffler.dom.body.className = ''
    Raffler.dom.body.classList.add('level4')
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  if (Raffler.config.enableUserConfig) {
    Raffler._loadUserConfig()
  } else {
    Raffler._resetApp()
  }

  Raffler._loadSettings()

  Raffler._refreshDebugValues()
  Raffler._updateItemsGraph()

  // if previously-chosen items exist
  // add them to the in-memory list
  if (Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY).length) {
    Raffler._refreshChosenItemsDisplay()
    Raffler.dom.resultsWrapper.style.display = 'block'
  }

  Raffler.__disableDebugTimerStart()

  Raffler.__initCycleText()
  Raffler._timerStop()

  Raffler.dom.interactive.btnPickWinner.focus()

  Raffler._attachEventListeners()

  Raffler._getNebyooApps()
}

Raffler._initDebug = function() {
  if (Raffler.dom.debug.container) {
    // show debug buttons
    Raffler.dom.debug.container.style.display = 'flex'

    // make header buttons smaller to fit in debug buttons
    document.querySelectorAll('button.icon').forEach((btn) => {
      btn.style.fontSize = '16px'
    })
  }
}

// fill in-memory itemsArr with server JSON
Raffler._initItemsArr = async function() {
  Raffler._notify(`initializing itemsArr from: ${Raffler.config.dataFilePath}`, 'notice')

  const response = await fetch(Raffler.config.dataFilePath)

  if (response.ok) {
    const data = await response.json()

    if (data) {
      // clear current config's itemsArr of all items
      while (Raffler.config.itemsArr.length) {
        Raffler.config.itemsArr.pop()
      }

      Raffler.config.itemsArr.length = 0

      if (Raffler.config.itemsArr) {
        // fill itemsArr back up again
        Object.values(data).forEach((val) => {
          Raffler.config.itemsArr.push(val)
        })

        Raffler.__shuffleArray(Raffler.config.itemsArr)
        Raffler.config.itemsLeftArr = Raffler.config.itemsArr

        Raffler._updateItemsGraph()
        Raffler._syncChosenItemsWithItemsArr()
        Raffler._syncUserItemsWithItemsArr()
      }
    } else {
      Raffler._notify('Failed to process initial data load: ' + e, 'error', true)
    }
  } else {
    Raffler._notify('Failed initial data load', 'error', true)
  }
}

// load user config from extra json file, if exists
Raffler._loadUserConfig = function() {
  Raffler._notify(`_loadUserConfig`, 'notice')

  fetch(RAFFLER_USER_CONFIG_FILE)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error()
      }
    })
    .then((data) => {
      if (data.dataFilePath != '') {
        Raffler.config.dataFilePath = data.dataFilePath
      }
      if (data.logoFileLink != '') {
        Raffler.settings.logoFileLink = data.logoFileLink
      }
      if (data.logoFilePath != '') {
        Raffler.settings.logoFilePath = data.logoFilePath

        Raffler.dom.title.append(`
          <span>at</span>
          <a href='${Raffler.settings.logoFileLink}' target='_blank'>
            <img id='logo' src='${Raffler.settings.logoFilePath}' />
          </a>
        `)
      }
      if (data.talkifyKey != '') {
        Raffler.config.talkifyKey = data.talkifyKey
      }

      Raffler._resetApp()
    })
    .catch(() => {
      Raffler._notify('User config not found at /config/raffler_config.user.json', 'error', true)

      Raffler._resetApp()
    })
}

// load app settings from LS
Raffler._loadSettings = function() {
  // Raffler._notify(`_loadSettings`, 'notice')

  const settings = localStorage.getItem(RAFFLER_SETTINGS_KEY)

  if (settings) {
    var setting = null;
    var lsSettings = JSON.parse(localStorage.getItem(RAFFLER_SETTINGS_KEY))

    // console.log('lsSettings', lsSettings)

    if (lsSettings) {
      if (lsSettings.allowDebugNotifications) {
        Raffler.settings.allowDebugNotifications = lsSettings.allowDebugNotifications

        setting = document.getElementById('button-setting-allow-debug-notifications')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.allowVisualNotifications) {
        Raffler.settings.allowVisualNotifications = lsSettings.allowVisualNotifications

        setting = document.getElementById('button-setting-allow-visual-notifications')

        if (setting) {
          setting.dataset.status = 'true'

          Raffler.__toggleTestVisualNotices()
        }
      }

      if (lsSettings.boxResize) {
        Raffler.settings.boxResize = lsSettings.boxResize

        setting = document.getElementById('button-setting-box-resize')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.showDebug) {
        Raffler.settings.showDebug = lsSettings.showDebug

        setting = document.getElementById('button-setting-show-debug')

        if (setting) {
          setting.dataset.status = 'true'

          Raffler._toggleSettingsShowDebug()
        }
      }

      if (lsSettings.showGraph) {
        Raffler.settings.showGraph = lsSettings.showGraph

        setting = document.getElementById('button-setting-show-graph')

        if (setting) {
          setting.dataset.status = 'true'

          document.getElementById('items-graph').classList.add('show')
        }
      }

      if (lsSettings.showSettingsPanel) {
        Raffler.settings.showSettingsPanel = lsSettings.showSettingsPanel

        // if true, toggle open panel
        if (lsSettings.showSettingsPanel) {
          Raffler._toggleSettingsPanel()
        }
      }

      if (lsSettings.sound.countdown) {
        Raffler.settings.sound.countdown = lsSettings.sound.countdown

        setting = document.getElementById('button-setting-sound-countdown')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.sound.victory) {
        Raffler.settings.sound.victory = lsSettings.sound.victory

        setting = document.getElementById('button-setting-sound-victory')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

      if (lsSettings.sound.name) {
        Raffler.settings.sound.name = lsSettings.sound.name

        setting = document.getElementById('button-setting-sound-name')

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
    // if no settings found in localStorage, then use already defaulted settings
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, Raffler.settings)
  }

  const userItems = localStorage.getItem(RAFFLER_USER_ITEMS_KEY)

  if (userItems) {
    Raffler._notify('[raffler-user-items] LS key already exists', 'notice')
  } else {
    Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, [])
    Raffler._notify('[raffler-user-items] LS key not found, so created', 'notice')
  }

  const chosenItems = localStorage.getItem(RAFFLER_CHOSEN_ITEMS_KEY)

  if (chosenItems) {
    Raffler._notify('[raffler-chosen-items] LS key already exists', 'notice')
  } else {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, [])
    Raffler._notify('[raffler-chosen-items] LS key not found, so created', 'notice')
  }
}
Raffler._changeSetting = function(setting, event = null) {
  let st = null;

  switch (setting) {
    case 'allowDebugNotifications': {
      st = document.getElementById('button-setting-allow-debug-notifications').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-debug-notifications').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('allowDebugNotifications', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-debug-notifications').dataset.status = 'false'

        Raffler._saveSetting('allowDebugNotifications', false)
      }
      break
    }

    case 'allowVisualNotifications': {
      st = document.getElementById('button-setting-allow-visual-notifications').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-visual-notifications').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('allowVisualNotifications', true)

        Raffler.__toggleTestVisualNotices()
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-visual-notifications').dataset.status = 'false'

        Raffler._saveSetting('allowVisualNotifications', false)

        Raffler.__toggleTestVisualNotices()
      }
      break
    }

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

    case 'intervalValue': {
      // console.log('intervalValue event', event.target.value)

      const val = parseInt(event.target.value)

      // update internal config
      Raffler.config.intervalRange = val

      // update text setting DOM
      Raffler.dom.debug.intervalValue.value = val

      // update timer
      window.countdownTimer.interval = val

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
    case 'showGraph': {
      st = document.getElementById('button-setting-show-graph').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-show-graph').dataset.status = 'true'

        document.getElementById('items-graph').classList.add('show')

        // save to code/LS
        Raffler._saveSetting('showGraph', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-show-graph').dataset.status = 'false'

        document.getElementById('items-graph').classList.remove('show')

        Raffler._saveSetting('showGraph', false)
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
  }
}
Raffler._saveSetting = function(setting, value) {
  // console.log('saving setting to LS...', setting, value)

  var settings = JSON.parse(localStorage.getItem(RAFFLER_SETTINGS_KEY))

  if (settings) {
    switch (setting) {
      case 'soundCountdown':
        Raffler.settings.sound['countdown'] = value
        settings.sound['countdown'] = value
        break
      case 'soundName':
        Raffler.settings.sound['name'] = value
        settings.sound['name'] = value
        break
      case 'soundVictory':
        Raffler.settings.sound['victory'] = value
        settings.sound['victory'] = value
        break
      default:
        Raffler.settings[setting] = value
        settings[setting] = value
        break
    }

    // save all settings to LS
    localStorage.setItem(RAFFLER_SETTINGS_KEY, JSON.stringify(settings))
  }

  // console.log('!global setting saved!', Raffler.settings)
}

// modal: debug: display Raffler.config and Raffler.settings
Raffler._displayAppConfig = function() {
  let config = Raffler.config
  let settings = Raffler.settings

  let html = ''

  html += '<a name="config"></a>';
  html += `<h4>GLOBAL (ENV: ${Raffler.env})</h4>`
  html += '<h4>----------------------------</h4>'
  html += '<h5><strong>CONFIG</strong> | <a href="#settings">SETTINGS</a></h5>'
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
          if (key == 'sound') {
            Object.entries(value).forEach((key, val) => {
              console.log('key, val', key, val)
            })
          } else {
            console.log('found another object', key, label, value)
          }
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
        }
      })

      html += '</dl><code>}</code></dd>'
    }
    else {
      var label = key
      var value = config[key]

      if (label == 'itemsArr' || label == 'itemsLeftArr') {
        html += `<dd><code>${label}:</code></dd>`
        html += `<dt>${JSON.stringify(value)}</dt>`
      } else {
        html += `<dd><code>${label}:</code></dd><dt>${value}</dt>`
      }
    }
  })

  html += '</dl>'

  html += '<h4>----------------------------</h4>'
  html += '<a name="settings"></a>';
  html += '<h5><a href="#config">CONFIG</a> | SETTINGS</h5>'
  html += '<h4>----------------------------</h4>'

  html += '<dl>'

  Object.keys(settings).sort().forEach(key => {
    // if value is an object, dig in
    if (
      (typeof settings[key] == 'object'
        && !Array.isArray(config[key])
        && settings[key] != null
      )
    ) {
      html += `<dd><code>${key}: {</code><dl>`

      Object.keys(settings[key]).forEach(k => {
        var label = k
        var value = settings[key][k]

        if (Object.keys(value)) {
          if (key == 'sound') {
            Object.entries(value).forEach((key, val) => {
              console.log('key, val', key, val)
            })
          } else {
            console.log('found another object', key, label, value)
          }
        } else {
          html += `<dd><code>${label}:</code></dd><dt>${value.join(', ')}</dt>`
        }
      })

      html += '</dl><code>}</code></dd>'
    }
    else {
      var label = key
      var value = settings[key]

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
    if (Raffler.dom.navOverlay.classList.contains('show')) {
      Raffler.dom.navOverlay.classList.remove('show')
    } else {
      Raffler.dom.navOverlay.classList.add('show')
    }
  }
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler._clearChosenItems = function() {
  try {
    Raffler._setLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY, [])
    Raffler.config.itemsLeftArr = Raffler.config.itemsArr
    Raffler.dom.debug.debugItemsChosen.value = ''
    Raffler.dom.debug.debugItemsChosen.value = ''

    Raffler._notify('_clearChosenItems(): reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}
// reset raffler-user-items localStorage to nothing and update displays
Raffler._clearUserItems = function() {
  try {
    const lsUserItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)

    for (var i = 0; i < Raffler.config.itemsArr.length; i++) {
      for (var j = 0; j < lsUserItems.length; j++) {
        if (Raffler.config.itemsArr[i].name === lsUserItems[j].name &&
            Raffler.config.itemsArr[i].affl === lsUserItems[j].affl) {
          Raffler.config.itemsArr.splice(i, 1)[0] // eslint-disable-line
        }
      }
    }

    Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, [])
    Raffler._refreshUserItemsDisplay()
    Raffler._refreshAvailableItemsDisplay()

    Raffler._notify('User items cleared', 'success', true)
  } catch (e) {
    Raffler._notify('_clearUserItems(): ' + e, 'error')
  }
}

// remove previously chosen items from in-memory itemsArr
Raffler._syncChosenItemsWithItemsArr = function() {
  try {
    const items = Raffler.config.itemsArr
    const chosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (chosenItems && chosenItems.length > 0) {
      for (var i = 0; i < chosenItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (chosenItems[i].name.toUpperCase() === items[j].name.toUpperCase() &&
              chosenItems[i].affl.toUpperCase() === items[j].affl.toUpperCase()) {
            Raffler.config.itemsArr.splice(j, 1)[0] // eslint-disable-line
          }
        }
      }
      Raffler.config.itemsLeftArr = Raffler.config.itemsArr

      Raffler._updateItemsGraph()

      // Raffler._notify('syncChosenItemsWithItemsArr: synced', 'notice')
    } else {
      // Raffler._notify('syncChosenItemsWithItemsArr: none to sync', 'notice')
    }

    // all items but one have been chosen on reload
    if (items.length === 1) {
      Raffler._notify('only one item left!', 'notice')

      window.countdownTimer.stop()
      Raffler.__disablePickWinnerButton()

      Raffler.config.lastItemChosenConfirmed = true
      Raffler._continueRaffling()
    }

    // all items have been chosen on reload
    if (items.length === 0) {
      Raffler._notify('no items left!', 'notice')

      window.countdownTimer.stop()
      Raffler.__disablePickWinnerButton()
      Raffler.__disableDebugTimerStart()
      Raffler.__disableDebugTimerStop()
      Raffler.dom.itemsCycle.classList.remove('stopped')
      Raffler.dom.itemsCycle.innerHTML = '<div>:\'(<br /><br />Nothing to raffle!</div>'
      Raffler.dom.body.classList.add('level4')

      // Raffler._notify('syncChosenItemsWithItemsArr: all items chosen', 'warning')
    }
  } catch (e) {
    Raffler._notify('syncChosenItemsWithItemsArr: ' + e, 'error')
  }
}
// add user items to in-memory itemsArr
Raffler._syncUserItemsWithItemsArr = function() {
  Raffler._notify('Syncing user items with pool of choices')

  try {
    const items = Raffler.config.itemsArr
    const userItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)
    let userItemWillBeAdded = true

    // if we've previously added user items
    if (userItems && userItems.length > 0) {
      // make sure not to add duplicate item
      for (var i = 0; i < userItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (
            userItems[i].name.toUpperCase() === items[j].name.toUpperCase() &&
            userItems[i].affl.toUpperCase() === items[j].affl.toUpperCase()
          ) {
            userItemWillBeAdded = false
          }
        }

        if (userItemWillBeAdded) {
          Raffler.config.itemsArr.push(userItems[i])
        } else {
          userItemWillBeAdded = true
        }
      }

      Raffler._refreshUserItemsDisplay()

      Raffler._notify('syncUserItemsWithItemsArr: synced')
    } else {
      Raffler._notify('syncUserItemsWithItemsArr: none to sync')
    }

    Raffler._refreshAvailableItemsDisplay()

    Raffler.dom.interactive.itemsUserCount.innerText = `(${Raffler.dom.interactive.itemsUser.value.split('\n').filter(item => item != '').length})`
  } catch (e) {
    Raffler._notify('syncUserItemsWithItemsArr: ' + e, 'error')
  }
}

// update debug items graph with current cycle information
Raffler._updateItemsGraph = function() {
  let index = 0

  Raffler.dom.itemsGraph.innerHTML = ''

  Raffler.config.itemsLeftArr.forEach(function() {
    const bar = document.createElement('span')
    bar.id = index++

    Raffler.dom.itemsGraph.appendChild(bar)
  })
}
Raffler._refreshDebugValues = function() {
  Raffler.dom.debug.intervalValue.value = Raffler.config.intervalRange
  Raffler.dom.debug.multiplyValue.innerText = Raffler.config.multiplyValue
}
Raffler._refreshResultsCount = function() {
  const chosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)

  if (chosenItems) {
    Raffler.dom.resultsCount.innerText = chosenItems.length
  }
}

Raffler._refreshAvailableItemsDisplay = function() {
  Raffler.config.itemsAvailable = []

  Raffler.config.itemsArr.forEach(function(item) {
    const choice = item.name + ' (' + item.affl + ')'

    Raffler.config.itemsAvailable.push(choice)
  })

  Raffler.dom.debug.debugItemsAvailableCount.innerText = `(${Raffler.config.itemsAvailable.length})`
  Raffler.dom.debug.debugItemsAvailable.value = Raffler.config.itemsAvailable.join('\n')

  Raffler._notify('refreshAvailableItems: display updated', 'notice')
}
Raffler._refreshChosenItemsDisplay = function() {
  try {
    const lsChosenItems = Raffler._getLocalStorageItem(RAFFLER_CHOSEN_ITEMS_KEY)

    if (lsChosenItems && lsChosenItems.length > 0) {
      let ordinal = 1
      let debugItemsChosen = []

      Raffler.dom.resultsContent.innerText = ''
      Raffler.dom.resultsWrapper.style.display = 'block'

      Object.values(lsChosenItems).forEach((val) => {
        const li = document.createElement('li')

        li.innerHTML = ordinal++ + '. ' + val.name + ' (' + val.affl + ')'
        Raffler.dom.resultsContent.prepend(li)

        debugItemsChosen.push(`${val.name} (${val.affl})`)
      })

      Raffler.dom.debug.debugItemsChosenCount.innerText = `(${debugItemsChosen.length})`
      Raffler.dom.debug.debugItemsChosen.value = debugItemsChosen.join('\n')

      Raffler._notify('refreshChosenItemsDisplay: display updated', 'notice')
    } else {
      Raffler._notify('refreshChosenItemsDisplay: none to display', 'warning')
    }
  } catch (e) {
    Raffler._notify('refreshChosenItemsDisplay: ' + e, 'error')
  }
}
Raffler._refreshUserItemsDisplay = function() {
  try {
    const lsUserItems = Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)

    if (lsUserItems && lsUserItems.length > 0) {
      Raffler.dom.interactive.itemsUser.value = ''

      Object.values(lsUserItems).forEach((val) => {
        Raffler.dom.interactive.itemsUser.value += val.name + ',' + val.affl + '\n'
      })

      Raffler._notify('refreshUserItemsDisplay: display updated', 'notice')
    } else {
      Raffler.dom.interactive.itemsUser.value = ''
      Raffler._notify('refreshUserItemsDisplay: none to display')
    }
  } catch (e) {
    Raffler._notify('refreshUserItemsDisplay: ' + e, 'error')
  }
}

// add last chosen item to localStorage
Raffler._addChosenItemToLocalStorage = function(lastChosenItem) {
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
  Raffler.dom.itemsCycle.classList.remove('stopped')

  Raffler.__disableDebugTimerStart()
  Raffler.__enableDebugTimerStop()

  Raffler._notify('window.countdownTimer started', 'notice')
}
Raffler._timerStop = function() {
  window.countdownTimer.stop()
  Raffler.dom.itemsCycle.classList.add('stopped')

  Raffler.__disableDebugTimerStop()
  Raffler.__enableDebugTimerStart()

  Raffler._notify('window.countdownTimer stopped', 'notice')
}

// you hit the big raffle button
Raffler._raffleButtonSmash = function() {
  Raffler._notify('BUTTON SMASH', 'notice')
  Raffler.__disablePickWinnerButton()

  if (Raffler.settings.boxResize) {
    Raffler.dom.itemsCycle.className = ''
  } else {
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.config.itemsArr.length > 1) {
    window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE
    window.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)
    window.countdownTimer.stage = RAFFLER_STAGES.INIT

    Raffler.dom.debug.stageValue.innerText = window.countdownTimer.stage

    window.countdownTimer.startCountdown = true
    window.countdownTimer.mult = 1
    window.countdownTimer.start()
  }
  // we got 1 choice, so no choice, no countdown
  if (Raffler.config.itemsArr.length === 1) {
    Raffler._notify('Only one item to raffle!<br /><strong>instant winner!</strong>', 'warning', true)

    Raffler._timerStop()

    // add lone item to items-cycle
    let loneItemHTML = ''
    loneItemHTML += '<div class=\'item-name\'>' + Raffler.config.itemsArr[0].name + '</div>\n'
    loneItemHTML += '<div class=\'item-affl\'>' + Raffler.config.itemsArr[0].affl + '</div>'

    Raffler.dom.itemsCycle.innerHTML = loneItemHTML
    Raffler.dom.itemsCycle.classList.add('level4')

    // grab lone item
    Raffler.config.lastItemChosen = {
      'name': document.querySelector('div.item-name').innerText,
      'affl': document.querySelector('div.item-affl').innerText
    }

    if (Raffler.settings.boxResize) {
      Raffler.dom.itemsCycle.className = ''
    }

    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level-win')
    Raffler.dom.body.classList.add('level4')
    Raffler._audioPlay('victory')
    Raffler._readName(Raffler.config.lastItemChosen)

    Raffler._addChosenItemToLocalStorage(Raffler.config.lastItemChosen)
    // add to list of chosen items and update displays
    Raffler._refreshChosenItemsDisplay()
    // update results count
    Raffler._refreshResultsCount()

    Raffler.config.itemsArr = []
    Raffler._updateItemsGraph()
    Raffler._refreshAvailableItemsDisplay()

    Raffler._notify('Raffled successfully! ' + Raffler.config.lastItemChosen.name + ' chosen!', 'success')

    // increment counter of times run
    Raffler.config.timesRun++
    Raffler.dom.debug.timesRun.innerText = Raffler.config.timesRun
  }

  Raffler._refreshDebugValues()
}

// after confirming a winner or not, go back to raffling
Raffler._continueRaffling = function() {
  // if we have confirmed, then take out of raffle
  if (Raffler.config.lastItemChosenConfirmed) {
    if (Raffler.config.lastItemChosen !== '') {
      // add chosen item to localStorage
      Raffler._addChosenItemToLocalStorage(Raffler.config.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshChosenItemsDisplay()
      // update results count
      Raffler._refreshResultsCount()

      const item = Raffler.config.lastItemChosen
      const items = Raffler.config.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (
          items[i].name.toUpperCase() == item.name.toUpperCase() &&
          items[i].affl.toUpperCase() == item.affl
        ) {
          items.splice(i, 1)
          Raffler.config.itemsLeftArr = items
          Raffler._updateItemsGraph()
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
  Raffler.__enablePickWinnerButton()

  // start an infinite cycle
  window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE
  window.countdownTimer.mult = 1
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)

  Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL_RANGE
  Raffler.dom.debug.intervalValue.value = Raffler.config.intervalRange

  Raffler.dom.debug.stageValue.innerText = window.countdownTimer.stage

  if (Raffler.settings.boxResize) {
    Raffler.dom.body.className = ''
    Raffler.dom.itemsCycle.className = ''
  } else {
    Raffler.dom.body.classList.add('level4')
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  Raffler._refreshDebugValues()

  window.countdownTimer.startCountdown = false

  if (Raffler.config.itemsArr.length > 1) {
    window.countdownTimer.start()
  }
}

// localStorage getter/setter
Raffler._getLocalStorageItem = function(lsKey) {
  try {
    return JSON.parse(localStorage.getItem(lsKey))
  } catch (e) {
    console.error('_getLocalStorageItem: ' + e)
    return false
  }
}
Raffler._setLocalStorageItem = function(lsKey, obj) {
  try {
    localStorage.setItem(lsKey, JSON.stringify(obj))
  } catch (e) {
    console.error('_setLocalStorageItem: ' + e)
    return false
  }
}

// app notifications
Raffler._notify = function(msg, type, notifyVisually, line) {
  type = (typeof type) === 'undefined' ? '' : type
  notifyVisually = (typeof notifyVisually) === 'undefined' ? '' : notifyVisually

  let bgcolor, fgcolor, header, icon

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

  const label = function(raw) {
    var [bgcolor, fgcolor, type, ...msg] = raw.split(' ')
    return [
      `%c${type}%c ${msg.join(' ')}`,
      `background-color: ${bgcolor}; border-right: 3px solid #000; color: ${fgcolor}; padding: 0.15em 0.35em 0.15em 0.5em`,
      ''
    ]
  }

  // 1. notify admin
  if (Raffler.settings.allowDebugNotifications) {
    console.log.apply(console, label(`${bgcolor} ${fgcolor} ${header.toUpperCase()} ${msg} ${line ? `(${line})` : ''}`))
  }

  // 2. also, optionally, notify user visually if allowed and specified
  if (Raffler.settings.allowVisualNotifications && notifyVisually) {
    const wrapper = document.createElement('div')
    wrapper.classList.add('item-status-wrapper')

    const notification = document.createElement('div')

      notification.classList.add('item-status')
      notification.style.backgroundColor = bgcolor
      notification.style.color = fgcolor

      notification.innerHTML  = `
        <div class="item-status-type">
          <i class='fas ${icon}'></i>
          <span>${header}:</span>
        </div>
        <div class="item-status-msg">${msg}</div>
      `

      notification.onclick = function() {
        // console.log('this', this)
        // console.log('this.parentNode', this.parentNode)
        // console.log('this.parentNode.parentNode', this.parentNode.parentNode)

        this.parentNode.removeChild(this)
      }

    wrapper.appendChild(notification)

    const mainContainer = document.querySelector('.main-container')

    mainContainer.prepend(wrapper)
  }
}

// timer object to keep track of countdown
Raffler._timer = function(callbackFunc, timing) {
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
      runLoop: function() {
        if (variableInterval.stopped) return
        // check to see if the time interval is at the end of a raffle
        var result = variableInterval.callback(variableInterval)

        if (typeof result === 'number') {
          if (result === 0) { return }
          variableInterval.interval = result
        }

        Raffler.config.intervalRange = result

        // switch to next item if countdown not done
        if (variableInterval.stage !== 4 && variableInterval.items.length) {
          var curIndex = variableInterval.items[variableInterval.index]

          // check for valid data
          if (curIndex.name && curIndex.affl) {
            var chosenItemHTML = ''
            chosenItemHTML += `<div class='item-name'>${curIndex.name}</div>\n`
            chosenItemHTML += `<div class='item-affl'>${curIndex.affl}</div>`

            Raffler.dom.itemsCycle.innerHTML = chosenItemHTML

            document.querySelectorAll('div#items-graph span').forEach((el, i) => {
              if (variableInterval.index === parseInt(el.id)) {
                el.classList.add('chosen')
              } else {
                el.classList.remove('chosen')
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
      stop: function() {
        this.stopped = true
        window.clearTimeout(this.timeout)
      },
      start: function() {
        this.stopped = false
        return this.loop()
      },
      loop: function() {
        this.timeout = window.setTimeout(this.runLoop, this.interval)
        return this
      }
    }

    return variableInterval.start()
  }
}

// get list of other existing NebyooApps for sidebar
Raffler._getNebyooApps = async function() {
  const response = await fetch(NEBYOOAPPS_SOURCE_URL)
  const json = await response.json()
  const apps = json.body
  const appList = document.querySelector('.nav-list')

  Object.values(apps).forEach(app => {
    const appLink = document.createElement('a')
    appLink.href = app.url
    appLink.innerText = app.title
    appLink.target = '_blank'
    appList.appendChild(appLink)
  })
}

// show/hide settings panel
Raffler._toggleSettingsPanel = function() {
  const currentVisibility = Raffler.dom.settingsPanel.style.display

  if (currentVisibility == '' || currentVisibility == 'none') {
    // Raffler._notify('showing settings panel', 'notice')

    // show it
    Raffler.dom.settingsPanel.style.display = 'block'
    Raffler.dom.mainContent.classList.add('settings-panel-enabled')

    Raffler._saveSetting('showSettingsPanel', true)
  } else {
    // Raffler._notify('hiding settings panel', 'notice')

    // hide it
    Raffler.dom.settingsPanel.style.display = 'none'
    Raffler.dom.mainContent.classList.remove('settings-panel-enabled')

    Raffler._saveSetting('showSettingsPanel', false)
  }
}

// show/hide extra debug settings options
Raffler._toggleSettingsShowDebug = function() {
  const currentVisibility = Raffler.dom.settingsDebug.style.display

  if (currentVisibility == '' || currentVisibility == 'none') {
    // show it
    Raffler.dom.settingsDebug.style.display = 'block'
  } else {
    // hide it
    Raffler.dom.settingsDebug.style.display = 'none'
  }
}

// handy combo shortcut of methods to reset application
Raffler._resetApp = function() {
  Raffler._initItemsArr()

  Raffler.config.lastItemChosen = ''
  Raffler.config.timesRun = 0

  Raffler._refreshAvailableItemsDisplay()
  Raffler._refreshResultsCount()
  Raffler._refreshDebugValues()

  Raffler._notify('Raffler reset', 'notice')
}
Raffler._resetCountdown = function() {
  Raffler._clearChosenItems()

  Raffler.config.timesRun = 0

  Raffler.dom.body.classList = ''
  Raffler.dom.itemsCycle.classList = ''

  Raffler.dom.resultsContent.innerText = ''
  Raffler.dom.resultsWrapper.style.display = 'none'

  window.countdownTimer.startCountdown = false
  window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE
  window.countdownTimer.mult = RAFFLER_DEFAULT_MULTIPLY
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.start()

  Raffler.__showPickWinnerButton()
  Raffler.__enablePickWinnerButton()

  Raffler._refreshDebugValues()

  Raffler._initItemsArr()

  Raffler._timerStart()

  Raffler.dom.interactive.btnPickWinner.focus()
}

Raffler._userItemsValid = function(items) {
  let userItems = items.split('\n').filter(item => item != '')

  if (userItems.length) {
    if (userItems.every(item => item.split(',').length == 2)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

// attach event handlers to buttons and such
Raffler._attachEventListeners = function() {
  // {} header icons to open modals
  Raffler.dom.interactive.btnNav.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.interactive.btnNavClose.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.interactive.btnHelp.addEventListener('click', () => {
    modalOpen('help')
  })
  Raffler.dom.interactive.btnSettings.addEventListener('click', () => {
    Raffler._toggleSettingsPanel()
  })

  if (Raffler.dom.interactive.btnShowDebugSettings) {
    Raffler.dom.interactive.btnShowDebugSettings.addEventListener('click', () => {
      Raffler._toggleSettingsShowDebug()
    })
  }

  // local debug top-left menu
  if (Raffler.env == 'local') {
    if (Raffler.dom.debug.container) {
      // ⚙ show current Raffler config
      Raffler.dom.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })
    }
  }

  // main raffling events
  Raffler.dom.itemsCycle.addEventListener('click', () => {
    Raffler._notify('clicked on the start button')

    if (Raffler.config.itemsArr.length > 0) {
      Raffler.__showPickWinnerButton()
      Raffler.__enablePickWinnerButton()
      Raffler._timerStart()
    }
  })
  Raffler.dom.interactive.btnItemsUserSync.addEventListener('click', () => {
    if (Raffler.dom.interactive.itemsUser.value !== '') {
      const items = Raffler.dom.interactive.itemsUser.value

      if (Raffler._userItemsValid(items)) {
        let itemsObjArr = []

        // add each valid item (ignoring blank items)
        items.split('\n').filter(item => item != '').map(item => {
          const temp = item.split(',')
          itemsObjArr.push({ 'name': temp[0], 'affl': temp[1] })
        })

        Raffler._setLocalStorageItem(RAFFLER_USER_ITEMS_KEY, itemsObjArr)
        Raffler._syncUserItemsWithItemsArr()
      } else {
        Raffler._notify('User items formatting invalid', 'notice')
      }
    } else {
      Raffler._notify('No user items to sync', 'notice')
    }
  })
  Raffler.dom.interactive.btnPickWinner.addEventListener('click', (e) => {
    e.preventDefault()
    if (!Raffler.dom.interactive.btnPickWinner.hasAttribute('disabled')) {
      Raffler._raffleButtonSmash()
    }
  })
  Raffler.dom.interactive.btnChosenConfirmYes.addEventListener('click', () => {
    Raffler.config.lastItemChosen = {
      'name': document.querySelector('div.item-name').innerText,
      'affl': document.querySelector('div.item-affl').innerText
    }

    Raffler.config.lastItemChosenConfirmed = true
    Raffler._continueRaffling()
  })
  Raffler.dom.interactive.btnChosenConfirmNo.addEventListener('click', () => {
    Raffler.config.lastItemChosenConfirmed = false
    Raffler._continueRaffling()
  })
  Raffler.dom.interactive.btnExportResults.addEventListener('click', (e) => {
    // export.js
    Raffler._exportResults()
  })

  if (!Raffler.dom.debug.btnResetCountdown.getAttribute('disabled')) {
    Raffler.dom.debug.btnResetCountdown.addEventListener('click', async () => {
      const resetConfirm = new Modal('confirm', 'Are you sure you want to reset choices?',
        'Note: all chosen items will be lost.',
        'Yes',
        'No'
      )

      try {
        // wait for modal confirmation
        const confirmed = await resetConfirm.question()

        if (confirmed) {
          Raffler._resetCountdown()
        }
      } catch (err) {
        console.error('countdown reset failed', err)
      }
    })
  }
  if (!Raffler.dom.debug.btnResetAll.getAttribute('disabled')) {
    Raffler.dom.debug.btnResetAll.addEventListener('click', async () => {
      const resetConfirm = new Modal('confirm', 'Are you sure you want to reset everything?',
        'Note: all chosen AND user items will be lost.',
        'Yes',
        'No'
      )

      try {
        // wait for modal confirmation
        const confirmed = await resetConfirm.question()

        if (confirmed) {
          Raffler._resetApp()
        }
      } catch (err) {
        console.error('app reset failed', err)
      }
    })
  }

  // debug settings
  Raffler.dom.debug.btnTimerStart.addEventListener('click', () => {
    if (Raffler.dom.debug.btnTimerStart.getAttribute('disabled') !== 'true') {
      Raffler._notify('starting timer', 'notice')

      Raffler.__showPickWinnerButton()
      Raffler.__enablePickWinnerButton()
      Raffler._timerStart()
    }
  })
  Raffler.dom.debug.btnTimerStop.addEventListener('click', () => {
    if (Raffler.dom.debug.btnTimerStop.getAttribute('disabled') !== 'true') {
      Raffler._notify('stopping timer', 'notice')

      Raffler._timerStop()
    }
  })

  window.addEventListener('click', Raffler._handleClickTouch)
  window.addEventListener('touchend', Raffler._handleClickTouch)
}

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

// check for localStorage - notify if not found
Raffler.__checkForLocalStorage = function() {
  // if we got LS, then set up the user items UI
  var LSsupport = (typeof window.localStorage !== 'undefined')

  if (!LSsupport) {
    Raffler.config.hasLocalStorage = false
    Raffler.dom.userItemsManager.style.display = 'none'

    Raffler._notify('No localStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
  }
}

// initial, clickable, text that will appear in the raffler before it is started
Raffler.__initCycleText = function() {
  Raffler.dom.itemsCycle.innerHTML = `
    <section id="init-raffler-cycle">
      <a href="#" class="animate__animated animate__pulse animate__slow animate__delay-5s animate__infinite">CLICK TO BEGIN RAFFLE!</a>
    </section>`

  Raffler.__disablePickWinnerButton()
}

// encode user entries html
Raffler.__sanitize = function(newEntry) {
  Object.values(newEntry).forEach((val) => {
    newEntry.val = val.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/""/g, '&quot;')
  })

  return newEntry
}

// check for duplicate user entries
Raffler.__isDuplicateValue = function(newUserItem) {
  Object.values(Raffler._getLocalStorageItem(RAFFLER_USER_ITEMS_KEY)).forEach((val) => {
    if (newUserItem.name === val.name && newUserItem.affl === val.affl) {
      return true
    }
  })

  return false
}

Raffler.__shuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

Raffler.__disablePickWinnerButton = function() {
  Raffler.dom.body.className = ''
  Raffler.dom.interactive.btnPickWinner.setAttribute('disabled', true)
  Raffler.dom.interactive.btnPickWinner.classList.add('disabled')
}
Raffler.__enablePickWinnerButton = function() {
  Raffler.dom.interactive.btnPickWinner.removeAttribute('disabled')
  Raffler.dom.interactive.btnPickWinner.classList.remove('disabled')
}
Raffler.__showPickWinnerButton = function() {
  Raffler.dom.pickWinnerContainer.style.display = 'block'
}

Raffler.__disableChosenConfirm = function() {
  Raffler._notify('hiding confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'none'

  Raffler.dom.interactive.btnChosenConfirmYes.setAttribute('disabled', true)
  Raffler.dom.interactive.btnChosenConfirmYes.classList.add('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.setAttribute('disabled', true)
  Raffler.dom.interactive.btnChosenConfirmNo.classList.add('disabled')

  Raffler.__enableDebugTimerStop()
}
Raffler.__enableChosenConfirm = function() {
  Raffler._notify('showing confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'block'

  Raffler.dom.interactive.btnChosenConfirmYes.removeAttribute('disabled')
  Raffler.dom.interactive.btnChosenConfirmYes.classList.remove('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.removeAttribute('disabled')
  Raffler.dom.interactive.btnChosenConfirmNo.classList.remove('disabled')

  Raffler.__disableDebugTimerStart()
  Raffler.__disableDebugTimerStop()
}
Raffler.__disableDebugTimerStart = function() {
  Raffler.dom.debug.btnTimerStart.setAttribute('disabled', true)
  Raffler.dom.debug.btnTimerStart.classList.add('disabled')
}
Raffler.__enableDebugTimerStart = function() {
  Raffler.dom.debug.btnTimerStart.removeAttribute('disabled')
  Raffler.dom.debug.btnTimerStart.classList.remove('disabled')
}
Raffler.__disableDebugTimerStop = function() {
  Raffler.dom.debug.btnTimerStop.setAttribute('disabled', true)
  Raffler.dom.debug.btnTimerStop.classList.add('disabled')
}
Raffler.__enableDebugTimerStop = function() {
  Raffler.dom.debug.btnTimerStop.removeAttribute('disabled')
  Raffler.dom.debug.btnTimerStop.classList.remove('disabled')
}

Raffler.__toggleTestVisualNotices = function() {
  const btns = Raffler.dom.debug.btnTests

  Object.keys(btns).forEach((key) => {
    if (!Raffler.settings.allowVisualNotifications) {
      btns[key].setAttribute('disabled', true)
      btns[key].setAttribute('title', 'Raffler.settings.allowVisualNotifications is false')
      btns[key].classList.add('disabled')
    } else {
      btns[key].removeAttribute('disabled')
      btns[key].setAttribute('title', '')
      btns[key].classList.remove('disabled')
    }
  })
}

/************************************************************************
 * START THE ENGINE *
 ************************************************************************/

// main timer instance for raffler cycler
window.countdownTimer = Raffler._timer(function() {
  // this is the variableInterval - so we can change/get the interval here:
  var interval = this.interval

  // console.log('Raffler._timer interval', interval)

  if (this.startCountdown) {
    // slow down at a certain point
    if (this.interval > 150 && this.interval <= 250) {
      this.stage = RAFFLER_STAGES.SLOWED

      Raffler.dom.debug.stageValue.innerText = this.stage

      if (Raffler.settings.boxResize) {
        Raffler.dom.itemsCycle.className = ''
        Raffler.dom.itemsCycle.classList.add('level2')
        Raffler.dom.body.className = ''
        Raffler.dom.body.classList.add('level2')
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 && this.interval <= 325) {
      this.stage = RAFFLER_STAGES.SLOWEST

      Raffler.dom.debug.stageValue.innerText = this.stage

      if (Raffler.settings.boxResize) {
        Raffler.dom.itemsCycle.className = ''
        Raffler.dom.itemsCycle.classList.add('level3')
        Raffler.dom.body.className = ''
        Raffler.dom.body.classList.add('level3')
      }
    }

    // finally, stop and pick an item!
    if (this.interval > 325) {
      this.mult = RAFFLER_DEFAULT_MULTIPLY

      if (this.interval > 350) {
        this.mult = this.mult++
      }

      // adjust for odd time drift
      if (Raffler.config.timesRun > 0) Raffler.config.lastInterval = 349

      // WINNER WINNER CHICKEN DINNER
      if (this.interval >= Raffler.config.lastInterval) {
        this.stage = RAFFLER_STAGES.DONE

        Raffler.dom.debug.stageValue.innerText = this.stage

        this.startCountdown = false
        this.stop()

        if (Raffler.settings.boxResize) {
          Raffler.dom.itemsCycle.className = ''
        }

        Raffler.dom.itemsCycle.classList.add('level-win')
        Raffler.dom.body.classList.add('level4')
        Raffler._audioPlay('victory')

        Raffler.config.lastItemChosen = {
          'name': document.querySelector('div.item-name').innerText,
          'affl': document.querySelector('div.item-affl').innerText
        }

        Raffler._readName(Raffler.config.lastItemChosen)

        // confirm winner
        Raffler.__enableChosenConfirm()

        // increment counter of times run
        Raffler.config.timesRun++
        Raffler.dom.debug.timesRun.innerText = Raffler.config.timesRun
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

    Raffler.dom.debug.stageValue.innerText = this.stage

    if (!Raffler.dom.itemsCycle.classList.contains('level1')) {
      Raffler.dom.itemsCycle.classList.add('level1')
    }

    Raffler._audioPlay('countdown')
  }
  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > RAFFLER_STAGES.INIT && this.stage !== RAFFLER_STAGES.DONE) {
    var newInterval = interval + (1.75 ^ this.mult++)

    Raffler.config.multiplyValue = this.mult
    Raffler.config.intervalRange = newInterval

    Raffler._refreshDebugValues()

    return newInterval
  }
}, RAFFLER_DEFAULT_INTERVAL_RANGE)

// get it going
window.onload = Raffler._initApp()
