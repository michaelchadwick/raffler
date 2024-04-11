/* settings */
/* localStorage and GUI settings functions */
/* global Raffler */

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

          Raffler.__debugToggleTestVisualNotices()
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
// change app setting
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

        Raffler.__debugToggleTestVisualNotices()
      } else {
        // update setting DOM
        document.getElementById('button-setting-allow-visual-notifications').dataset.status = 'false'

        Raffler._saveSetting('allowVisualNotifications', false)

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
// save app setting to LS
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
