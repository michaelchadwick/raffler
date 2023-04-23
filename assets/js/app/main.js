/* main */
/* app entry point and main functions */
/* eslint-disable no-undef */
/* global Raffler */

// set to true if using /config/raffler_config.json
Raffler.config.enableLocalConfig = false
// set app environment
Raffler.config.env = RAFFLER_ENV_PROD_URL.includes(document.location.hostname) ? 'prod' : 'local'

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

// app entry point
Raffler.initApp = async function() {
  Raffler._notify('Raffler init', 'notice')

  // if local, show debug stuff
  if (Raffler.config.env == 'local') {
    Raffler._initDebug()

    document.title = '(LH) ' + document.title
  }

  // load flags from URL
  Raffler._loadQueryString()

  // load global settings
  Raffler._loadSettings()

  if (Raffler.config.enableLocalConfig) {
    await Raffler._loadLocalConfig()
  } else {
    Raffler._resetApp()
  }

  Raffler._refreshDebugValues()
  Raffler._updateItemsGraph()

  // if saved chosen items exist, add them to memory
  if (Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)) {
    if (Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY).length) {
      Raffler._syncItemsChosenWithItemsArr()
      Raffler._refreshItemsChosenDisplay()
      Raffler.dom.resultsWrapper.style.display = 'block'
    }
  } else {
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])
  }

  Raffler._initCycleText()
  Raffler._timerStop()

  Raffler._getNebyooApps()

  Raffler._attachEventListeners()
}

/*************************************************************************
 * _private methods (called from other functions) *
 *************************************************************************/

// initial message or link that will appear in the raffler before it is started
Raffler._initCycleText = function() {
  if (Raffler.config.itemsArr.length) {
    if (Raffler.config.itemsArr.length > 1) {
      Raffler.dom.itemsCycleEmpty.style.display = 'none'
      Raffler.dom.itemsCycleLimit.style.display = 'none'

      Raffler.dom.itemsCycleStart.style.display = 'block'
    } else {
      Raffler.dom.itemsCycleEmpty.style.display = 'none'
      Raffler.dom.itemsCycleStart.style.display = 'none'

      Raffler.dom.itemsCycleLimit.style.display = 'block'
    }
  } else {
    Raffler.dom.itemsCycleLimit.style.display = 'none'
    Raffler.dom.itemsCycleStart.style.display = 'none'

    Raffler.dom.itemsCycleEmpty.style.display = 'block'
  }
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
  Raffler._notify(`_initItemsArr(): ${Raffler.config.dataFilePath}`, 'notice')

  if (Raffler.config.dataFilePath !== '') {
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

          Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)

          Raffler.__shuffleArray(Raffler.config.itemsArr)

          Raffler._updateItemsGraph()
          Raffler._refreshItemsAvailableDisplay()
          Raffler._syncItemsChosenWithItemsArr()
        }
      } else {
        Raffler._notify('Failed to process initial data load: ' + e, 'error', true)
      }
    } else {
      Raffler._notify(`Failed initial data load from <code>${Raffler.config.dataFilePath}</code>`, 'error', true)
    }
  } else {
    // Raffler._notify('No initial data exists. Please add items in settings panel.', 'notice', true)
  }

  const lsItemsAvail = Raffler._getLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY)

  if (lsItemsAvail) {
    lsItemsAvail.forEach(item => {
      Raffler.config.itemsArr.push(item)

      Raffler.dom.itemsAvailable.value += `${item}\n`
    })
  }
}

// load config from local json file, if querystring flag is true
Raffler._loadLocalConfig = function() {
  Raffler._notify(`_loadLocalConfig()`, 'notice')

  fetch(RAFFLER_LOCAL_CONFIG_FILE)
    .then((response) => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error()
      }
    })
    .then(async (data) => {
      if (data.dataFilePath != '') {
        Raffler.config.dataFilePath = data.dataFilePath

        await Raffler._initItemsArr()

        Raffler._initCycleText()
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

        Raffler._initTalkifyConfig()
      }

      Raffler._resetApp()
    })
    .catch(() => {
      Raffler._notify(`Local config not found at <code>${Raffler.config.configFilePath}</code>`, 'error', true)

      Raffler._resetApp()
    })
}
// load configuration flags from URL query string
Raffler._loadQueryString = function() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  })

  Raffler._notify(`_loadQueryString(${JSON.stringify(window.location.search)})`, 'notice')

  if (params) {
    Raffler.config.enableLocalConfig = params.local_config ? true : false
  }
}
// load app settings from LS
Raffler._loadSettings = function() {
  Raffler._notify(`_loadSettings()`, 'notice')

  const settings = localStorage.getItem(RAFFLER_SETTINGS_KEY)

  if (settings) {
    let setting = null
    const lsSettings = JSON.parse(localStorage.getItem(RAFFLER_SETTINGS_KEY))

    if (lsSettings) {
      if (lsSettings.allowBoxResize) {
        Raffler.settings.allowBoxResize = lsSettings.allowBoxResize

        setting = document.getElementById('button-setting-allow-box-resize')

        if (setting) {
          setting.dataset.status = 'true'
        }
      }

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

      if (lsSettings.showSettings) {
        Raffler.settings.showSettings = lsSettings.showSettings

        // if true, toggle open panel
        if (lsSettings.showSettings) {
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
    }
  } else {
    // if no settings found in localStorage, then use already defaulted settings
    Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, Raffler.settings)
  }

  // if we aren't doing the "resize as the raffle counts down" thing
  // then fast track display to final level
  if (!Raffler.settings.allowBoxResize) {
    Raffler.dom.body.className = ''
    Raffler.dom.body.classList.add('level4')
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }
}
Raffler._changeSetting = function(setting, event = null) {
  let st = null;

  switch (setting) {
    case 'allowBoxResize': {
      st = document.getElementById('button-setting-allow-box-resize').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-box-resize').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSetting('allowBoxResize', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-box-resize').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSetting('allowBoxResize', false)
      }
      break
    }

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

    case 'showDebug': {
      st = document.getElementById('button-setting-show-debug').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-show-debug').dataset.status = 'true'

        document.getElementById('settings-debug-container').classList.add('show')

        // save to code/LS
        Raffler._saveSetting('showDebug', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-show-debug').dataset.status = 'false'

        document.getElementById('settings-debug-container').classList.remove('show')

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
  const config = Raffler.config
  const settings = Raffler.settings

  let html = ''

  html += '<a name="config"></a>';
  html += `<h4>GLOBAL (ENV: ${Raffler.config.env})</h4>`
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
              Raffler._notify(`key: ${key}, val: ${val}`)
            })
          } else {
            Raffler._notify(`found another object: key: ${key}, label: ${label}, value: ${value}`)
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

      if (label == 'itemsArr') {
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
              Raffler._notify(`key: ${key}, val: ${val}`)
            })
          } else {
            Raffler._notify(`found another object: key: ${key}, label: ${label}, value: ${value}`)
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
Raffler._handleStartButton = function() {
  Raffler._notify('clicked on the start button')

  Raffler.__showPickWinnerButton()
  Raffler.__enablePickWinnerButton()
  Raffler._timerStart()
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler._clearItemsChosen = function() {
  try {
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])

    Raffler.dom.itemsChosen.value = ''
    Raffler.dom.itemsChosen.value = ''

    Raffler._notify('_clearItemsChosen(): reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}

// remove previously chosen items from in-memory itemsArr
Raffler._syncItemsChosenWithItemsArr = function() {
  try {
    const items = Raffler.config.itemsArr
    const chosenItems = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (chosenItems && chosenItems.length > 0) {
      for (var i = 0; i < chosenItems.length; i++) {
        for (var j = 0; j < items.length; j++) {
          if (chosenItems[i].toUpperCase() === items[j].toUpperCase()) {
            Raffler.config.itemsArr.splice(j, 1)[0] // eslint-disable-line
          }
        }
      }

      Raffler._refreshItemsAvailableDisplay()
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

      Raffler.dom.body.classList.add('level4')
      Raffler.dom.itemsCycle.innerHTML = '<div>:\'(<br /><br />Nothing to raffle!</div>'
      Raffler.dom.itemsCycle.classList.remove('stopped')

      // Raffler._notify('syncChosenItemsWithItemsArr: all items chosen', 'warning')
    }
  } catch (e) {
    Raffler._notify('syncChosenItemsWithItemsArr: ' + e, 'error')
  }
}

Raffler._updateItemsAvailable = function() {
  const value = Raffler.dom.itemsAvailable.value
  const items = value.split('\n').filter(i => i !== '')

  console.log('items', items)

  // update count
  Raffler.dom.itemsAvailableCount.innerText = `(${items.length})`

  // update internal model
  Raffler.config.itemsArr = items

  // save to local storage
  Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)

  // update main section accordingly
  Raffler._initCycleText()
}
// update debug items graph with current cycle information
Raffler._updateItemsGraph = function() {
  let index = 0

  Raffler.dom.itemsGraph.innerHTML = ''

  Raffler.config.itemsArr.forEach(function() {
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
  const lsChosenItems = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

  if (lsChosenItems) {
    Raffler.dom.resultsCount.innerText = lsChosenItems.length
  }
}

Raffler._refreshItemsAvailableDisplay = function() {
  const choices = []

  Raffler.config.itemsArr.forEach(function(item) {
    choices.push(item)
  })

  Raffler.dom.itemsAvailable.value = choices.join('\n')
  Raffler.dom.itemsAvailableCount.innerText = `(${choices.length})`

  Raffler._notify('refreshAvailableItems: display updated', 'notice')
}
Raffler._refreshItemsChosenDisplay = function() {
  try {
    const lsChosenItems = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    if (lsChosenItems && lsChosenItems.length > 0) {
      let ordinal = 1
      let itemsChosen = []

      Raffler.dom.resultsContent.innerText = ''
      Raffler.dom.resultsWrapper.style.display = 'block'

      Object.values(lsChosenItems).forEach((val) => {
        const li = document.createElement('li')

        li.innerHTML = ordinal++ + '. ' + val
        Raffler.dom.resultsContent.prepend(li)

        itemsChosen.push(val)
      })

      Raffler.dom.itemsChosenCount.innerText = `(${itemsChosen.length})`
      Raffler.dom.itemsChosen.value = itemsChosen.join('\n')

      Raffler._notify('refreshChosenItemsDisplay: display updated', 'notice')
    } else {
      Raffler._notify('refreshChosenItemsDisplay: none to display', 'warning')
    }
  } catch (e) {
    Raffler._notify('refreshChosenItemsDisplay: ' + e, 'error')
  }
}

// add last chosen item to localStorage
Raffler._addItemChosenToLocalStorage = function(lastChosenItem) {
  try {
    var localChosenItemsObj = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    localChosenItemsObj.push(lastChosenItem)

    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, localChosenItemsObj)
    Raffler._refreshItemsAvailableDisplay()

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

// user interacted with the "PICK A WINNER" button
Raffler._pickAWinner = function() {
  Raffler._notify('PICKING A WINNER...', 'notice')
  Raffler.__disablePickWinnerButton()

  if (Raffler.settings.allowBoxResize) {
    Raffler.dom.itemsCycle.className = ''
  } else {
    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.config.itemsArr.length > 1) {
    Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL_RANGE

    // console.log('_pickAWinner: Raffler.config.intervalRange reset', Raffler.config.intervalRange)

    Raffler.dom.debug.stageValue.innerText = window.countdownTimer.stage

    window.countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE

    // console.log('_pickAWinner: window.countdownTimer.interval reset', window.countdownTimer.interval)

    window.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)
    window.countdownTimer.stage = RAFFLER_STAGES.INIT
    window.countdownTimer.startCountdown = true
    window.countdownTimer.mult = 1
    window.countdownTimer.start()
  }
  // we got 1 choice, so no choice, no countdown
  if (Raffler.config.itemsArr.length === 1) {
    Raffler._notify('Only one item to raffle!<br /><strong>instant winner!</strong>', 'warning', true)

    Raffler._timerStop()

    // add lone item to items-cycle
    let loneItemHTML = '<div class=\'item\'>' + Raffler.config.itemsArr[0].name + '</div>'

    Raffler.dom.itemsCycle.innerHTML = loneItemHTML
    Raffler.dom.itemsCycle.classList.add('level4')

    // grab lone item
    Raffler.config.lastItemChosen = document.querySelector('div.item').innerText

    if (Raffler.settings.allowBoxResize) {
      Raffler.dom.itemsCycle.className = ''
    }

    Raffler.dom.itemsCycle.className = ''
    Raffler.dom.itemsCycle.classList.add('level-win')
    Raffler.dom.body.classList.add('level4')

    if (Raffler.settings.sound.victory) {
      Raffler._playAudio('victory')

      // Raffler.myAudioWorker.postMessage({
      //   command: 'playAudio',
      //   data: 'victory'
      // })
    }

    if (Raffler.settings.sound.name) {
      Raffler._readName(Raffler.config.lastItemChosen)

      // Raffler.myAudioWorker.postMessage({
      //   command: 'readName',
      //   data: Raffler.config.lastItemChosen
      // })
    }

    Raffler._addItemChosenToLocalStorage(Raffler.config.lastItemChosen)
    // add to list of chosen items and update displays
    Raffler._refreshItemsChosenDisplay()
    // update results count
    Raffler._refreshResultsCount()

    Raffler.config.itemsArr = []
    Raffler._updateItemsGraph()
    Raffler._refreshItemsAvailableDisplay()

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
      Raffler._addItemChosenToLocalStorage(Raffler.config.lastItemChosen)
      // add to list of chosen items and update displays
      Raffler._refreshItemsChosenDisplay()
      // update results count
      Raffler._refreshResultsCount()

      const item = Raffler.config.lastItemChosen
      const items = Raffler.config.itemsArr

      for (var i = 0; i < items.length; i++) {
        if (items[i].toUpperCase() === item.toUpperCase()) {
          items.splice(i, 1)
          Raffler._updateItemsGraph()
          Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)
          Raffler._refreshItemsAvailableDisplay()
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

  // console.log('_continueRaffling: window.countdownTimer.interval reset', window.countdownTimer.interval)

  window.countdownTimer.mult = 1
  window.countdownTimer.stage = RAFFLER_STAGES.INIT
  window.countdownTimer.index = Math.floor(Math.random() * Raffler.config.itemsArr.length)

  Raffler.config.intervalRange = RAFFLER_DEFAULT_INTERVAL_RANGE

  // console.log('_continueRaffling: Raffler.config.intervalRange reset', Raffler.config.intervalRange)

  Raffler.dom.debug.intervalValue.value = Raffler.config.intervalRange

  Raffler.dom.debug.stageValue.innerText = window.countdownTimer.stage

  if (Raffler.settings.allowBoxResize) {
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
  } else {
    const lastItem = Raffler.config.itemsArr[0]

    Raffler._addItemChosenToLocalStorage(lastItem)
    Raffler._refreshItemsChosenDisplay()

    Raffler.config.itemsArr = []
    Raffler._refreshItemsAvailableDisplay()

    Raffler.dom.body.classList = 'level4'
    Raffler.dom.itemsCycle.classList.add('level-win')

    Raffler.dom.itemsCycle.innerHTML = `<div>Only one choice left:</div><div class='item'>${lastItem}</div>`

    Raffler.__disablePickWinnerButton()
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
Raffler._save = function() {
  Raffler._notify('_save()')

  try {
    localStorage.setItem(RAFFLER_SETTINGS_KEY, JSON.stringify(Raffler.settings))
    localStorage.setItem(RAFFLER_ITEMS_AVAIL_KEY, JSON.stringify(Raffler.config.itemsArr))
  } catch (e) {
    console.error('_save: ' + e)
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
          if (curIndex) {
            var chosenItemHTML = `<div class='item'>${curIndex}</div>\n`

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

    Raffler._saveSetting('showSettings', true)
  } else {
    // Raffler._notify('hiding settings panel', 'notice')

    // hide it
    Raffler.dom.settingsPanel.style.display = 'none'
    Raffler.dom.mainContent.classList.remove('settings-panel-enabled')

    Raffler._saveSetting('showSettings', false)
  }
}

// show/hide extra debug settings options
Raffler._toggleSettingsShowDebug = function() {
  const currentVisibility = Raffler.dom.settingsDebugContainer.style.display

  if (currentVisibility == '' || currentVisibility == 'none') {
    // show it
    Raffler.dom.settingsDebugContainer.style.display = 'block'
  } else {
    // hide it
    Raffler.dom.settingsDebugContainer.style.display = 'none'
  }
}

// handy combo shortcut of methods to reset application
Raffler._resetApp = function() {
  Raffler._initItemsArr()

  Raffler.config.lastItemChosen = ''
  Raffler.config.timesRun = 0

  Raffler._refreshItemsAvailableDisplay()
  Raffler._refreshResultsCount()
  Raffler._refreshDebugValues()

  Raffler._notify('Raffler reset', 'notice')
}
Raffler._resetCountdown = function() {
  Raffler._clearItemsChosen()

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

  Raffler.dom.btnPickWinner.focus()
}

// attach event handlers to buttons and such
Raffler._attachEventListeners = function() {
  // top-left icons to open modals
  Raffler.dom.btnNav.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.btnNavClose.addEventListener('click', () => {
    Raffler.dom.navOverlay.classList.toggle('show')
  })
  Raffler.dom.btnHelp.addEventListener('click', () => {
    modalOpen('help')
  })
  // local debug top-left icon
  if (Raffler.config.env == 'local') {
    if (Raffler.dom.debug.container) {
      // ⚙ show current Raffler config
      Raffler.dom.debug.btnShowConfig.addEventListener('click', () => {
        modalOpen('show-config')
      })
    }
  }

  // top-right settings (gear) menu
  Raffler.dom.btnSettings.addEventListener('click', () => {
    Raffler._toggleSettingsPanel()
  })

  if (Raffler.dom.btnShowDebugSettings) {
    Raffler.dom.btnShowDebugSettings.addEventListener('click', () => {
      Raffler._toggleSettingsShowDebug()
    })
  }

  Raffler.dom.itemsAvailable.addEventListener('keyup', () => {
    Raffler._updateItemsAvailable()
  })

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

  // main raffling events
  Raffler.dom.itemsCycleStart.addEventListener('click', () => {
    Raffler._handleStartButton()
  })
  Raffler.dom.btnPickWinner.addEventListener('click', (e) => {
    e.preventDefault()
    if (!Raffler.dom.btnPickWinner.hasAttribute('disabled')) {
      Raffler._pickAWinner()
    }
  })
  Raffler.dom.btnChosenConfirmYes.addEventListener('click', () => {
    Raffler.config.lastItemChosen = document.querySelector('div#items-cycle div.item').innerText

    console.log('btnChosenConfirmYes', Raffler.config.lastItemChosen)

    Raffler.config.lastItemChosenConfirmed = true

    Raffler._continueRaffling()
  })
  Raffler.dom.btnChosenConfirmNo.addEventListener('click', () => {
    Raffler.config.lastItemChosenConfirmed = false
    Raffler._continueRaffling()
  })
  Raffler.dom.btnExportResults.addEventListener('click', (e) => {
    // export.js
    Raffler._exportResults()
  })

  window.addEventListener('click', Raffler._handleClickTouch)
  window.addEventListener('touchend', Raffler._handleClickTouch)
}

/*************************************************************************
 * _private __helper methods *
 *************************************************************************/

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

// check if User Items are valid before syncing
Raffler.__userItemsValid = function(items) {
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
  Raffler.dom.btnPickWinner.setAttribute('disabled', true)
  Raffler.dom.btnPickWinner.classList.add('disabled')
}
Raffler.__enablePickWinnerButton = function() {
  Raffler.dom.btnPickWinner.removeAttribute('disabled')
  Raffler.dom.btnPickWinner.classList.remove('disabled')
}
Raffler.__showPickWinnerButton = function() {
  Raffler.dom.pickWinnerContainer.style.display = 'block'
}

Raffler.__disableChosenConfirm = function() {
  Raffler._notify('hiding confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'none'

  Raffler.dom.btnChosenConfirmYes.setAttribute('disabled', true)
  Raffler.dom.btnChosenConfirmYes.classList.add('disabled')
  Raffler.dom.btnChosenConfirmNo.setAttribute('disabled', true)
  Raffler.dom.btnChosenConfirmNo.classList.add('disabled')

  Raffler.__enableDebugTimerStop()
}
Raffler.__enableChosenConfirm = function() {
  Raffler._notify('showing confirmation question', 'notice')

  Raffler.dom.chosenConfirm.style.display = 'block'

  Raffler.dom.btnChosenConfirmYes.removeAttribute('disabled')
  Raffler.dom.btnChosenConfirmYes.classList.remove('disabled')
  Raffler.dom.btnChosenConfirmNo.removeAttribute('disabled')
  Raffler.dom.btnChosenConfirmNo.classList.remove('disabled')

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
  const btns = Raffler.dom.debug.btnTestVisual

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

      if (Raffler.settings.allowBoxResize) {
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

      if (Raffler.settings.allowBoxResize) {
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

      // WINNER WINNER CHICKEN DINNER
      if (this.interval >= Raffler.config.lastInterval) {
        this.stage = RAFFLER_STAGES.DONE

        Raffler.dom.debug.stageValue.innerText = this.stage

        this.startCountdown = false
        this.stop()

        if (Raffler.settings.allowBoxResize) {
          Raffler.dom.itemsCycle.className = ''
        }

        Raffler.dom.itemsCycle.classList.add('level-win')
        Raffler.dom.body.classList.add('level4')

        if (Raffler.settings.sound.victory) {
          Raffler._playAudio('victory')

          // Raffler.myAudioWorker.postMessage({
          //   command: 'playAudio',
          //   data: 'victory'
          // })
        }

        Raffler.config.lastItemChosen = document.querySelector('div.item').innerText

        if (Raffler.settings.sound.name) {
          Raffler._readName(Raffler.config.lastItemChosen)

          // Raffler.myAudioWorker.postMessage({
          //   command: 'readName',
          //   data: Raffler.config.lastItemChosen
          // })
        }

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

    if (Raffler.settings.sound.countdown) {
      Raffler._playAudio('countdown')

      // Raffler.myAudioWorker.postMessage({
      //   command: 'playAudio',
      //   data: 'countdown'
      // })
    }
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
window.onload = Raffler.initApp()
