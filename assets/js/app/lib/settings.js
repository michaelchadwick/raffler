/* settings */
/* localStorage and GUI settings functions */
/* global Raffler */

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

// load configuration flags from URL query string
Raffler._loadQueryString = function () {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  // Raffler._notify(`_loadQueryString(${JSON.stringify(window.location.search)})`, 'notice')

  if (params) {
    Raffler.config.enableLocalConfig = params.local_config ? true : false
  }
}
// load config from local json file, if querystring flag is true
Raffler._loadLocalConfig = async function () {
  Raffler._notify(`_loadLocalConfig()`, 'notice')

  const config = await fetch(RAFFLER_LOCAL_CONFIG_FILE)

  if (config) {
    const data = await config.json()

    if (data.logoFileLink !== '') {
      Raffler.settings.logoFileLink = data.logoFileLink
    }
    if (data.logoFilePath !== '') {
      Raffler.settings.logoFilePath = data.logoFilePath

      const span = document.createElement('span')
      span.innerText = 'at'

      const link = document.createElement('a')
      link.href = Raffler.settings.logoFileLink
      link.target = '_blank'

      const img = document.createElement('img')
      img.id = 'logo'
      img.src = Raffler.settings.logoFilePath

      link.appendChild(img)

      Raffler.dom.header.title.appendChild(span)
      Raffler.dom.header.title.appendChild(link)
    }
  } else {
    Raffler._notify(
      `Local config not found at <code>${Raffler.config.configFilePath}</code>`,
      'error',
      true
    )
  }
}

// localStorage Items Chosen count -> UI -> Results Count
Raffler._setResultsCountFromLocalStorage = function () {
  const lsItemsChosen = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

  if (lsItemsChosen) {
    Raffler.dom.resultsCount.innerText = lsItemsChosen.length
  }
}
// localStorage ? localStorage -> Raffler.config.itemsArr : []
// 1. [localStorage] - previous data; if empty, skip
// 2. [] - no previous data
Raffler._setItemsArrFromLocalStorage = async function () {
  Raffler._notify('_setItemsArrFromLocalStorage()', 'notice')

  const lsItemsAvail = Raffler._getLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY)

  if (lsItemsAvail?.length) {
    // console.log('-- resetting itemsArr...')
    Raffler.config.itemsArr = []

    // update settings UI
    Raffler.dom.settings.itemsAvailable.value = ''

    lsItemsAvail.forEach((item) => {
      // set in-memory
      Raffler.config.itemsArr.push(item)

      // set settings UI
      Raffler.dom.settings.itemsAvailable.value += `${item}\n`
    })

    // add Items Available to internal countdownTimer
    Raffler._countdownTimer.items = Raffler.config.itemsArr
    Raffler._setResultsCountFromLocalStorage()
  }
  // nothing saved, so no items, available or chosen, yet
  else {
    Raffler._notify('No localStorage data exists. Please add items in settings panel.', 'notice')

    Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, [])

    const currentVisibility = Raffler.dom.settingsPanel.style.display

    if (currentVisibility == '' || currentVisibility == 'none') {
      Raffler.dom.settingsPanel.style.display = 'block'
      Raffler.dom.mainContent.classList.add('settings-panel-enabled')

      Raffler._saveSettingToLocalStorage('showSettings', true)
    }
  }

  Raffler._initCycleText()
}
// update internal model when Items Available textarea changes
Raffler._setItemsArrFromItemsAvailable = function () {
  // Raffler._notify(`_setItemsArrFromItemsAvailable()`, 'notice')

  const items = Raffler.dom.settings.itemsAvailable.value.split('\n').filter((i) => i !== '')

  // update Settings UI count
  Raffler.dom.settings.itemsAvailableCount.innerText = `(${items.length})`

  // update internal model
  Raffler.config.itemsArr = items
  Raffler._countdownTimer.items = Raffler.config.itemsArr

  // save to local storage
  Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, Raffler.config.itemsArr)

  // update main section accordingly
  Raffler._initCycleText()
}
// internal itemsArr Items Available -> UI -> Settings Panel
Raffler._setItemsAvailableFromItemsArr = function () {
  Raffler._notify('_setItemsAvailableFromItemsArr()', 'notice')

  const items = Raffler.config.itemsArr

  Raffler.dom.settings.itemsAvailable.value = items.join('\n')
  Raffler.dom.settings.itemsAvailableCount.innerText = `(${items.length})`
}
// localStorage Chosen Items > UI -> Settings Panel
Raffler._setItemsChosenFromLocalStorage = function () {
  try {
    const lsItemsChosen = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    if (lsItemsChosen && lsItemsChosen.length > 0) {
      let ordinal = 1
      let itemsChosen = []

      Raffler.dom.resultsList.innerText = ''
      Raffler.dom.resultsWrapper.style.display = 'block'

      Object.values(lsItemsChosen).forEach((val) => {
        const li = document.createElement('li')

        li.innerHTML = ordinal++ + '. ' + val
        Raffler.dom.resultsList.prepend(li)

        itemsChosen.push(val)
      })

      Raffler.dom.settings.itemsChosenCount.innerText = `(${itemsChosen.length})`
      Raffler.dom.settings.itemsChosen.value = itemsChosen.join('\n')

      Raffler._notify('_setItemsChosenFromLocalStorage: display updated', 'notice')
    } else {
      Raffler._notify('_setItemsChosenFromLocalStorage: none to display', 'warning')
    }
  } catch (e) {
    Raffler._notify('_setItemsChosenFromLocalStorage: ' + e, 'error')
  }
}

// load app settings from LS
Raffler._loadSettingsFromLocalStorage = function () {
  Raffler._notify(`_loadSettingsFromLocalStorage()`, 'notice')

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

          Raffler.__debugToggleTestVisualNotices()
        }
      }

      if (lsSettings.showDebug) {
        Raffler.settings.showDebug = lsSettings.showDebug

        setting = document.getElementById('button-setting-show-debug')

        if (setting) {
          setting.dataset.status = 'true'

          Raffler._toggleSettingsDebugVisibility()
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
          Raffler._toggleSettingsPanelVisibility()
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
// change app setting
Raffler._changeAppSetting = function (setting, event = null) {
  let st = null

  switch (setting) {
    case 'allowBoxResize': {
      st = document.getElementById('button-setting-allow-box-resize').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-box-resize').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('allowBoxResize', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-box-resize').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('allowBoxResize', false)
      }
      break
    }

    case 'allowDebugNotifications': {
      st = document.getElementById('button-setting-allow-debug-notifications').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-debug-notifications').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('allowDebugNotifications', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-debug-notifications').dataset.status = 'false'

        Raffler._saveSettingToLocalStorage('allowDebugNotifications', false)
      }
      break
    }

    case 'allowVisualNotifications': {
      st = document.getElementById('button-setting-allow-visual-notifications').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-allow-visual-notifications').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('allowVisualNotifications', true)

        Raffler.__debugToggleTestVisualNotices()
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-visual-notifications').dataset.status =
          'false'

        Raffler._saveSettingToLocalStorage('allowVisualNotifications', false)

        Raffler.__debugToggleTestVisualNotices()
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
        Raffler._saveSettingToLocalStorage('showDebug', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-show-debug').dataset.status = 'false'

        document.getElementById('settings-debug-container').classList.remove('show')

        // save to code/LS
        Raffler._saveSettingToLocalStorage('showDebug', false)
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
        Raffler._saveSettingToLocalStorage('showGraph', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-show-graph').dataset.status = 'false'

        document.getElementById('items-graph').classList.remove('show')

        Raffler._saveSettingToLocalStorage('showGraph', false)
      }
      break
    }

    case 'soundCountdown': {
      st = document.getElementById('button-setting-sound-countdown').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-sound-countdown').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('soundCountdown', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-sound-countdown').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('soundCountdown', false)
      }
      break
    }
    case 'soundName': {
      st = document.getElementById('button-setting-sound-name').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-sound-name').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('soundName', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-sound-name').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('soundName', false)
      }
      break
    }
    case 'soundVictory': {
      st = document.getElementById('button-setting-sound-victory').dataset.status

      if (st == '' || st == 'false') {
        // update setting DOM
        document.getElementById('button-setting-sound-victory').dataset.status = 'true'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('soundVictory', true)
      } else {
        // update setting DOM
        document.getElementById('button-setting-sound-victory').dataset.status = 'false'

        // save to code/LS
        Raffler._saveSettingToLocalStorage('soundVictory', false)
      }
      break
    }
  }
}
// save app setting to LS
Raffler._saveSettingToLocalStorage = function (setting, value) {
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

// add last chosen item to localStorage
Raffler._addItemChosenToLocalStorage = function (lastChosenItem) {
  try {
    var localItemsChosenObj = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    localItemsChosenObj.push(lastChosenItem)

    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, localItemsChosenObj)
    Raffler._setItemsAvailableFromItemsArr()

    Raffler._notify(
      'addChosenItemToLocalStorage: ' + lastChosenItem.name + ' added to LS',
      'notice'
    )
  } catch (e) {
    Raffler._notify('addChosenItemToLocalStorage: ' + e, 'error')
  }
}

// remove previously chosen items from in-memory itemsArr
Raffler._setItemsChosenFromItemsArr = function () {
  try {
    const itemsAvailable = Raffler.config.itemsArr
    const itemsChosen = Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)

    // if we've previously chosen items
    // we need to remove them from the raffle
    if (itemsChosen?.length) {
      for (var i = 0; i < itemsChosen.length; i++) {
        for (var j = 0; j < itemsAvailable.length; j++) {
          if (itemsChosen[i].toUpperCase() === itemsAvailable[j].toUpperCase()) {
            Raffler.config.itemsArr.splice(j, 1)[0] // eslint-disable-line
          }
        }
      }

      Raffler._setItemsAvailableFromItemsArr()
      Raffler._debugUpdateItemsGraph()

      // Raffler._notify('_setItemsChosenFromItemsArr: synced', 'notice')
    } else {
      // Raffler._notify('_setItemsChosenFromItemsArr: none to sync', 'notice')
    }

    // all items but one have been chosen on reload
    if (itemsAvailable.length === 1) {
      Raffler._notify('only one item left!', 'notice')

      Raffler._countdownTimer.stop()
      Raffler.__disablePickWinnerButton()

      Raffler.config.lastItemChosenConfirmed = true
      Raffler._continueRaffling()
    }

    // all items have been chosen on reload
    if (itemsAvailable.length === 0 && itemsChosen?.length) {
      Raffler._notify('no items left!', 'notice')

      Raffler._countdownTimer.stop()

      Raffler.__disablePickWinnerButton()
      Raffler.__debugDisableTimerStart()
      Raffler.__debugDisableTimerStop()

      Raffler.dom.body.classList.add('level4')
      Raffler.dom.itemsCycle.innerHTML = "<div>:'(<br /><br />Nothing to raffle!</div>"
      Raffler.dom.itemsCycle.classList.remove('stopped')

      // Raffler._notify('_setItemsChosenFromItemsArr: all items chosen', 'warning')
    }
  } catch (e) {
    Raffler._notify('_setItemsChosenFromItemsArr: ' + e, 'error')
  }
}

// show/hide settings panel
Raffler._toggleSettingsPanelVisibility = function () {
  const currentVisibility = Raffler.dom.settingsPanel.style.display

  if (currentVisibility == '' || currentVisibility == 'none') {
    // Raffler._notify('showing settings panel', 'notice')

    // show it
    Raffler.dom.settingsPanel.style.display = 'block'
    Raffler.dom.mainContent.classList.add('settings-panel-enabled')

    Raffler._saveSettingToLocalStorage('showSettings', true)
  } else {
    // Raffler._notify('hiding settings panel', 'notice')

    // hide it
    Raffler.dom.settingsPanel.style.display = 'none'
    Raffler.dom.mainContent.classList.remove('settings-panel-enabled')

    Raffler._saveSettingToLocalStorage('showSettings', false)
  }
}
// show/hide extra debug settings options
Raffler._toggleSettingsDebugVisibility = function () {
  const currentVisibility = Raffler.dom.settings.debug.container.style.display

  if (currentVisibility == '' || currentVisibility == 'none') {
    // show it
    Raffler.dom.settings.debug.container.style.display = 'block'
  } else {
    // hide it
    Raffler.dom.settings.debug.container.style.display = 'none'
  }
}

// reset countdown as if no items were ever chosen
Raffler._resetCountdown = async function () {
  Raffler._notify('Raffler resetCountdown()', 'warning')

  await Raffler.__undoItemsChosen()

  // reset countdown to default
  Raffler._countdownTimer.interval = RAFFLER_DEFAULT_INTERVAL_RANGE
  Raffler._countdownTimer.mult = RAFFLER_DEFAULT_MULTIPLY
  Raffler._countdownTimer.stage = RAFFLER_STAGES.INIT
  Raffler._countdownTimer.startCountdown = false

  // reset main UI
  Raffler.dom.body.classList = ''
  Raffler.dom.itemsCycle.classList = ''
  Raffler.dom.resultsList.innerText = ''
  Raffler.dom.resultsWrapper.style.display = 'none'

  // reset settings.debug
  Raffler._debugRefreshValues()
  // reset internal counter and GUI
  Raffler.dom.settings.debug.timesRun.value = Raffler.config.timesRun = 0

  if (!Raffler._countdownTimer.stopped) {
    Raffler.dom.btnPickWinner.focus()
    Raffler.__showPickWinnerButton()
    Raffler.__enablePickWinnerButton()
    Raffler._countdownTimer.start()
    Raffler._timerStart()
  }
}

// shortcut to put Raffler back to default state
Raffler._resetAll = async function () {
  Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, [])
  Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])
  Raffler._setLocalStorageItem(RAFFLER_SETTINGS_KEY, null)

  Raffler.config.itemsArr = []
  Raffler._countdownTimer.items = []

  Raffler._resetApp()
  Raffler._debugRefreshValues()
  Raffler._debugUpdateItemsGraph()

  Raffler._initCycleText()
  Raffler._timerStop()
}

// reset raffler-chosen-items localStorage to nothing and update displays
Raffler.__undoItemsChosen = async function () {
  Raffler._notify('__undoItemsChosen(): starting...', 'warning')

  try {
    const allItems = Raffler._getLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY).concat(
      Raffler._getLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY)
    )

    // reset localStorage to defaults
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_AVAIL_KEY, allItems)
    Raffler._setLocalStorageItem(RAFFLER_ITEMS_CHOSEN_KEY, [])

    // load inMemory config
    await Raffler._setItemsArrFromLocalStorage()

    // load settings panel
    Raffler._setItemsAvailableFromItemsArr()
    Raffler.dom.settings.itemsChosen.value = ''
    Raffler.dom.settings.itemsChosenCount.innerText = '(0)'

    Raffler._notify('__undoItemsChosen(): success', 'warning')
  } catch (e) {
    Raffler._notify('__undoItemsChosen(): ' + e, 'error')
  }
}
