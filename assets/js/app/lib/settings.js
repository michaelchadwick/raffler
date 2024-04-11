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
