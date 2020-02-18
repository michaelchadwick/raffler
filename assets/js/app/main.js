/* main */
/* app entry point and main functions */
/* global $, Raffler */

// app entry point
Raffler.initApp = function () {
  // if admin passed, show hamburger menu
  if ((typeof $.QueryString.admin) !== 'undefined') {
    Raffler.elements.btnAdminMenuToggle.show().toggleClass('button-open')
    Raffler.elements.adminMenu.toggleClass('menu-show')
    Raffler.elements.mainContent.toggleClass('with-menu')
    Raffler.elements.footer.toggleClass('with-menu')
  }

  // add logo, if exists
  if (Raffler.options.logoFilePath !== '' && Raffler.options.logoFileLink !== '') {
    Raffler.elements.title.append('<span>at</span>')
    Raffler.elements.title.append(`<a href='${Raffler.options.logoFileLink}' target='_blank'>`)
    Raffler.elements.title.append(`<img id='logo' src='${Raffler.options.logoFilePath}' />`)
    Raffler.elements.title.append('</a>')
  }

  Raffler.setEventHandlers()
  Raffler.checkForLocalStorage()
  Raffler.resetApp()
  Raffler.refreshDebugValues()
  Raffler.refreshItemsGraph(Raffler.itemsLeftArr)

  if (Raffler._getLocalStorageItem('rafflerChosenItems').length) {
    Raffler.refreshChosenItemsDisplay()
    Raffler.elements.resultsWrapper.show()
  }
  Raffler.elements.intervalValue.text(Raffler.elements.intervalRange.val())

  Raffler._disableTimerStart()
  // set cycler to init text
  Raffler._initCycleText()
  Raffler.timerStop()
  Raffler.elements.btnRaffle.focus()

  Raffler._notify('Raffler init', 'notice')
}

// attach event handlers to button and such
Raffler.setEventHandlers = function () {
  Raffler.elements.itemsCycle.click(function () {
    Raffler._notify('starting the cycle')
    Raffler._enableRaffle()
    Raffler.timerStart()
  })
  Raffler.elements.btnAdminMenuToggle.click(function () {
    $(this).toggleClass('button-open')
    Raffler.elements.adminMenu.toggleClass('menu-show')
    Raffler.elements.mainContent.toggleClass('with-menu')
    Raffler.elements.footer.toggleClass('with-menu')
  })
  Raffler.elements.intervalRange.on('change', function (e) {
    e.preventDefault()
    Raffler.elements.intervalValue.text($(this).val())
    window.countdownTimer.interval = parseInt($(this).val())
  })
  Raffler.elements.ckOptShowGraph.on('change', function () {
    Raffler.elements.itemsGraph.toggle()
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.showGraph = !curObj.showGraph
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.elements.ckOptResize.on('change', function () {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.boxResize = !curObj.boxResize
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.elements.ckOptSoundCountdown.on('change', function () {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.soundCountdown = !curObj.soundCountdown
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.elements.ckOptSoundVictory.on('change', function () {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.soundVictory = !curObj.soundVictory
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.elements.ckOptSoundName.on('change', function () {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.soundName = !curObj.soundName
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.elements.ckOptShowDebug.on('change', function () {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.showDebug = !curObj.showDebug
    Raffler._setLocalStorageItem('rafflerOptions', curObj)

    Raffler.elements.debugOptions.toggleClass('show')
    Raffler.elements.adminMenuInner.toggleClass('with-debug')
  })
  Raffler.elements.btnTestSuccess.click(function (e) {
    e.preventDefault()
    Raffler._notify('test success msg that is long enough to actually go onto a second line because of width and such and thus.', 'success', true)
  })
  Raffler.elements.btnTestNotice.click(function (e) {
    e.preventDefault()
    Raffler._notify('test notice msg that is long enough to actually go onto a second line because of width and such and thus.', 'notice', true)
  })
  Raffler.elements.btnTestWarning.click(function (e) {
    e.preventDefault()
    Raffler._notify('test warning msg that is long enough to actually go onto a second line because of width and such and thus.', 'warning', true)
  })
  Raffler.elements.btnTestError.click(function (e) {
    e.preventDefault()
    Raffler._notify('test error msg that is long enough to actually go onto a second line because of width and such and thus.', 'error', true)
  })
  Raffler.elements.btnTimerStart.click(function (e) {
    e.preventDefault()
    if (Raffler.elements.btnTimerStart.prop('disabled', false)) {
      Raffler.timerStart()
    }
  })
  Raffler.elements.btnTimerStop.click(function (e) {
    e.preventDefault()
    if (Raffler.elements.btnTimerStop.prop('disabled', false)) {
      Raffler.timerStop()
    }
  })
  Raffler.elements.btnDataReset.click(function (e) {
    e.preventDefault()
    Raffler.elements.dataResetDialog.dialog({
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

    Raffler.elements.dataResetDialog.dialog('open')
  })
  Raffler.elements.inputUserItemsAddName.keyup(function (e) {
    var code = e.which
    if (code === 13) {
      e.preventDefault()
      Raffler.elements.btnUserItemsAdd.click()
    }

    if ($(this).val().length > 0 && Raffler.elements.inputUserItemsAddAffl.val().length > 0) {
      Raffler.elements.btnUserItemsAdd.prop('disabled', false)
      Raffler.elements.btnUserItemsAdd.removeClass('disabled')
    } else {
      Raffler.elements.btnUserItemsAdd.prop('disabled', true)
      Raffler.elements.btnUserItemsAdd.addClass('disabled')
    }
  })
  Raffler.elements.inputUserItemsAddAffl.keyup(function (e) {
    var code = e.which
    if (code === 13) {
      e.preventDefault()
      Raffler.elements.btnUserItemsAdd.click()
    }

    if ($(this).val().length > 0 && Raffler.elements.inputUserItemsAddName.val().length > 0) {
      Raffler.elements.btnUserItemsAdd.prop('disabled', false)
      Raffler.elements.btnUserItemsAdd.removeClass('disabled')
    } else {
      Raffler.elements.btnUserItemsAdd.prop('disabled', true)
      Raffler.elements.btnUserItemsAdd.addClass('disabled')
    }
  })
  Raffler.elements.btnUserItemsAdd.click(function () {
    if (Raffler.elements.inputUserItemsAddName.val() !== '' && Raffler.elements.inputUserItemsAddAffl.val() !== '') {
      var newUserItem = {
        'name': Raffler.elements.inputUserItemsAddName.val().trim(),
        'affl': Raffler.elements.inputUserItemsAddAffl.val().trim()
      }

      if (newUserItem !== undefined) {
        var tempUserItemObj = Raffler._getLocalStorageItem('rafflerUserItems')

        if (!Raffler._isDuplicateValue(newUserItem)) {
          tempUserItemObj.push(Raffler._sanitize(newUserItem))
          Raffler.elements.btnUserItemsClear.prop('disabled', false)
          Raffler.elements.btnUserItemsClear.removeClass('disabled')
          // update localStorage with temp tempUserItemObj
          Raffler._setLocalStorageItem('rafflerUserItems', tempUserItemObj)
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
  Raffler.elements.btnUserItemsClear.click(function (e) {
    e.preventDefault()
    try {
      if (Raffler._getLocalStorageItem('rafflerUserItems').length > 0) {
        Raffler.elements.btnUserItemsClear.prop('disabled', false)
        Raffler.elements.btnUserItemsClear.removeClass('disabled')

        Raffler.elements.userItemsClearDialog.dialog({
          autoOpen: false,
          modal: true,
          resizeable: false,
          height: 'auto',
          buttons: {
            'Clear them!': function () {
              Raffler.resetUserItems()

              Raffler.clearUserItemsInput()

              Raffler.elements.btnUserItemsClear.prop('disabled', true)
              Raffler.elements.btnUserItemsClear.addClass('disabled')

              $(this).dialog('close')
            },
            'Nevermind.': function () {
              $(this).dialog('close')
            }
          }
        })

        Raffler.elements.userItemsClearDialog.dialog('open')
      }
    } catch (err) {
      Raffler._notify('btnUserItemsClear: ' + err, 'error')
    }
  })
  Raffler.elements.btnRaffle.click(function (e) {
    e.preventDefault()
    if (!Raffler.elements.btnRaffle.prop('disabled')) {
      Raffler.raffleButtonSmash()
    }
  })
  Raffler.elements.btnChosenConfirmYes.click(function () {
    Raffler.lastItemChosenConfirmed = true
    Raffler.continueRaffling()
  })
  Raffler.elements.btnChosenConfirmNo.click(function () {
    Raffler.lastItemChosenConfirmed = false
    Raffler.continueRaffling()
  })
  Raffler.elements.btnExportResults.click(function (e) {
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
}
// check for LS - notify if not found
Raffler.checkForLocalStorage = function () {
  // if we got LS or SS, then set up the user items UI
  try {
    var LSsupport = (typeof window.localStorage !== 'undefined')
    var SSsupport = (typeof window.sessionStorage !== 'undefined')
    if (!LSsupport && !SSsupport) {
      Raffler.hasLocalStorage = false
      Raffler.elements.userItemsManager.hide()
      Raffler._notify('No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
    } else {
      // if our specific keys don't exist, then init
      if (!window.localStorage.getItem('rafflerOptions')) {
        Raffler._setLocalStorageItem('rafflerOptions', Raffler.initOptionsObj)
        Raffler._notify('checkForLocalStorage: rafflerOptions created', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: rafflerOptions already exists', 'notice')
      }

      Raffler.syncOptionsToUI()

      if (!window.localStorage.getItem('rafflerUserItems')) {
        Raffler._setLocalStorageItem('rafflerUserItems', Raffler.initItemsObj)
        Raffler._notify('checkForLocalStorage: rafflerUserItems created', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: rafflerUserItems already exists', 'notice')
      }
      if (!window.localStorage.getItem('rafflerChosenItems')) {
        Raffler._setLocalStorageItem('rafflerChosenItems', Raffler.initItemsObj)
        Raffler._notify('checkForLocalStorage: rafflerChosenItems created!', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: rafflerChosenItems already exists', 'notice')
      }
    }
  } catch (e) {
    Raffler.hasLocalStorage = false
    Raffler.elements.userItemsManager.hide()
    Raffler._notify('No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
  }
}

// handy combo shortcut of methods to reset application
Raffler.resetApp = function () {
  Raffler.initItemsArr()

  Raffler.lastItemChosen = ''
  Raffler.timesRun = Raffler._getLocalStorageItem('rafflerChosenItems').length
  Raffler.elements.intervalRange.val(Raffler.initInterval)

  Raffler.refreshAvailableItemsDisplay()
  Raffler.refreshResultsCount()
  Raffler.refreshDebugValues()

  Raffler._notify('Raffler reset', 'notice')
}
// you hit the 'reset data' button
// puts everyone back in raffle
// resets stuff, as if you reloaded page
Raffler.resetCountdown = function () {
  if (Raffler.elements.ckOptResize.is(':checked')) {
    Raffler.elements.itemsCycle.removeClass()
  } else {
    Raffler.elements.itemsCycle.removeClass()
    Raffler.elements.itemsCycle.addClass('level4')
  }

  Raffler.resetApp()
  Raffler.resetChosenItems()
  Raffler.resetUserItems()

  Raffler.elements.resultsContent.text('')
  Raffler.clearUserItemsInput()
  Raffler.elements.textAvailableItems.text('')
  Raffler.elements.textChosenItems.text('')
  Raffler.elements.resultsWrapper.hide()
  Raffler._enableRaffle()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.interval = Raffler.initInterval
  window.countdownTimer.mult = Raffler.initMult
  window.countdownTimer.stage = Raffler.stages.INIT
  window.countdownTimer.start()

  Raffler.timesRun = 0

  Raffler.refreshDebugValues()
}
// reset rafflerChosenItems localStorage to nothing and update displays
Raffler.resetChosenItems = function () {
  try {
    Raffler._setLocalStorageItem('rafflerChosenItems', Raffler.initItemsObj)
    Raffler.refreshChosenItemsDisplay()

    Raffler._notify('resetChosenItems: reset', 'warning')
  } catch (e) {
    Raffler._notify('resetChosenItems: ' + e, 'error')
  }
}
// reset rafflerUserItems localStorage to nothing and update displays
Raffler.resetUserItems = function () {
  try {
    var lsUserItems = Raffler._getLocalStorageItem('rafflerUserItems')
    var itemsSpliced = [] // eslint-disable-line

    for (var i = 0; i < Raffler.itemsArr.length; i++) {
      for (var j = 0; j < lsUserItems.length; j++) {
        if (Raffler.itemsArr[i].name === lsUserItems[j].name &&
            Raffler.itemsArr[i].affl === lsUserItems[j].affl) {
          itemsSpliced = Raffler.itemsArr.splice(i, 1)[0]
        }
      }
    }

    Raffler._setLocalStorageItem('rafflerUserItems', Raffler.initItemsObj)
    Raffler.refreshUserItemsDisplay()
    Raffler.refreshAvailableItemsDisplay()

    Raffler._notify('User items reset', 'success', true)
  } catch (e) {
    Raffler._notify('resetUserItems: ' + e, 'error')
  }
}
Raffler.clearUserItemsInput = function () {
  Raffler.elements.inputUserItemsAddName.val('')
  Raffler.elements.inputUserItemsAddAffl.val('')
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
  var lsVals = Raffler._getLocalStorageItem('rafflerOptions')
  if (lsVals.showGraph) {
    Raffler.elements.ckOptShowGraph.prop('checked', true)
    Raffler.elements.itemsGraph.show()
  } else {
    Raffler.elements.ckOptShowGraph.prop('checked', false)
    Raffler.elements.itemsGraph.hide()
  }
  if (lsVals.boxResize) {
    Raffler.elements.ckOptResize.prop('checked', true)
  } else {
    Raffler.elements.ckOptResize.prop('checked', false)
  }
  if (lsVals.soundCountdown) {
    Raffler.elements.ckOptSoundCountdown.prop('checked', true)
  } else {
    Raffler.elements.ckOptSoundCountdown.prop('checked', false)
  }
  if (lsVals.soundVictory) {
    Raffler.elements.ckOptSoundVictory.prop('checked', true)
  } else {
    Raffler.elements.ckOptSoundVictory.prop('checked', false)
  }
}
// remove previously chosen items from in-memory itemsArr
Raffler.syncChosenItemsWithItemsArr = function () {
  try {
    var items = Raffler.itemsArr
    var itemsSpliced = [] // eslint-disable-line
    var chosenItems = Raffler._getLocalStorageItem('rafflerChosenItems')

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
      Raffler.elements.itemsCycle.html('<div>:\'(<br /><br />Nothing to raffle!</div>')
      Raffler.elements.body.addClass('level4')
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
    var userItems = Raffler._getLocalStorageItem('rafflerUserItems')
    var userItemWillBeAdded = true

    // if we've previously added user items
    if (userItems && userItems.length > 0) {
      Raffler.elements.btnUserItemsClear.prop('disabled', false)
      Raffler.elements.btnUserItemsClear.removeClass('disabled')

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
  Raffler.elements.itemsGraph.html('')
  items.forEach(function () {
    Raffler.elements.itemsGraph
      .append('<span id=' + (index++) + '></span>')
  })
}
// refresh dem debug values in the admin menu
Raffler.refreshDebugValues = function () {
  Raffler.elements.stageValue.text(window.countdownTimer.stage)
  Raffler.elements.intervalValue.text(window.countdownTimer.interval)
  Raffler.elements.intervalRange.val(window.countdownTimer.interval)
  Raffler.elements.multiplyValue.text(window.countdownTimer.mult)
  Raffler.elements.timesRunValue.text(Raffler.timesRun)
}
// refresh number of raffle results with localStorage values
Raffler.refreshResultsCount = function () {
  Raffler.elements.resultsCount.text(Raffler._getLocalStorageItem('rafflerChosenItems').length)
}
// refresh chosen items with localStorage values
Raffler.refreshChosenItemsDisplay = function () {
  try {
    var lsChosenItems = Raffler._getLocalStorageItem('rafflerChosenItems')
    if (lsChosenItems && lsChosenItems.length > 0) {
      var ordinal = 1

      Raffler.elements.textChosenItems.text('')
      Raffler.elements.resultsContent.text('')
      Raffler.elements.resultsWrapper.show()

      $.each(lsChosenItems, function (key, val) {
        Raffler.elements.resultsContent.prepend('<li>' + ordinal++ + '. ' + val.name + ' (' + val.affl + ')</li>')
        Raffler.elements.textChosenItems.prepend(val.name + ' (' + val.affl + `)\n`)
      })
      Raffler.elements.textChosenItemsCount.text(`(${lsChosenItems.length})`)

      Raffler._notify('refreshChosenItemsDisplay: display updated')
    } else {
      Raffler.elements.textChosenItems.text('')
      Raffler._notify('refreshChosenItemsDisplay: none to display', 'warning')
    }
  } catch (e) {
    Raffler._notify('refreshChosenItemsDisplay: ' + e, 'error')
  }
}
// refresh user items with localStorage values
Raffler.refreshUserItemsDisplay = function () {
  try {
    var lsUserItems = Raffler._getLocalStorageItem('rafflerUserItems')
    if (lsUserItems && lsUserItems.length > 0) {
      $.each(lsUserItems, function (key, val) {
        Raffler.elements.userItemsDisplay.children().append('<li>' + val.name + ' (' + val.affl + ')</li>')
      })

      Raffler._notify('refreshUserItemsDisplay: display updated', 'notice')
    } else {
      Raffler.elements.userItemsDisplay.html('')
      Raffler._notify('refreshUserItemsDisplay: none to display')
    }
  } catch (e) {
    Raffler._notify('refreshUserItemsDisplay: ' + e, 'error')
  }
}
// re-display available items from in-memory itemsArr
Raffler.refreshAvailableItemsDisplay = function () {
  Raffler.elements.textAvailableItems.text('')
  Raffler.itemsArr.forEach(function (item) {
    Raffler.elements.textAvailableItems.prepend(item.name + ' (' + item.affl + `)\n`)
  })
  Raffler.elements.textAvailableItemsCount.text(`(${Raffler.itemsArr.length})`)

  Raffler._notify('refreshAvailableItems: display updated', 'notice')
}

// add last chosen item to localStorage
Raffler.addChosenItemToLocalStorage = function (lastChosenItem) {
  try {
    var localChosenItemsObj = Raffler._getLocalStorageItem('rafflerChosenItems')
    localChosenItemsObj.push(lastChosenItem)
    Raffler._setLocalStorageItem('rafflerChosenItems', localChosenItemsObj)
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
        Raffler.elements.intervalValue.text(result)
        // switch to next item if countdown not done
        if (variableInterval.stage !== 4 && variableInterval.items.length) {
          var curIndex = variableInterval.items[variableInterval.index]

          // check for valid data
          if (curIndex.name && curIndex.affl) {
            var chosenItemHTML = ''
            chosenItemHTML += `<div class='item-name'>${curIndex.name}</div>\n`
            chosenItemHTML += `<div class='item-affl'>${curIndex.affl}</div>`

            Raffler.elements.itemsCycle.html(chosenItemHTML)

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
      Raffler.elements.stageValue.text(this.stage)

      if (Raffler.elements.ckOptResize.is(':checked')) {
        Raffler.elements.itemsCycle.removeClass()
        Raffler.elements.itemsCycle.addClass('level2')
        Raffler.elements.body.removeClass()
        Raffler.elements.body.addClass('level2')
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 && this.interval <= 325) {
      this.stage = Raffler.stages.SLOWEST
      Raffler.elements.stageValue.text(this.stage)

      if (Raffler.elements.ckOptResize.is(':checked')) {
        Raffler.elements.itemsCycle.removeClass()
        Raffler.elements.itemsCycle.addClass('level3')
        Raffler.elements.body.removeClass()
        Raffler.elements.body.addClass('level3')
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
        Raffler.elements.stageValue.text(this.stage)
        this.startCountdown = false
        this.stop()

        if (Raffler.elements.ckOptResize.is(':checked')) {
          Raffler.elements.itemsCycle.removeClass()
        }

        Raffler.elements.itemsCycle.addClass('level-win')
        Raffler.elements.body.addClass('level4')
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
        Raffler.elements.timesRunValue.text(Raffler.timesRun)
      } else {
        var intervalMult = interval + this.mult
        Raffler.elements.intervalRange.val(intervalMult)
        return intervalMult
      }
    }
  }

  // start countdown!
  if (this.startCountdown && (this.stage === Raffler.stages.INIT || this.stage === Raffler.stages.BEGUN)) {
    this.stage = Raffler.stages.BEGUN
    Raffler.elements.stageValue.text(this.stage)
    if (!Raffler.elements.itemsCycle.hasClass('level1')) {
      Raffler.elements.itemsCycle.addClass('level1')
    }
    Raffler._playSound('countdown')
  }
  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > Raffler.stages.INIT && this.stage !== Raffler.stages.DONE) {
    var newInterval = interval + (1.75 ^ this.mult++)
    Raffler.elements.multiplyValue.text(this.mult)
    Raffler.elements.intervalRange.val(newInterval)
    return newInterval
  }
}, Raffler.initInterval)

Raffler.timerStart = function() {
  window.countdownTimer.start()
  Raffler.elements.itemsCycle.removeClass('stopped')
  Raffler._disableTimerStart()
  Raffler._enableTimerStop()
  Raffler._notify('window.countdownTimer started', 'notice')
}

Raffler.timerStop = function() {
  window.countdownTimer.stop()
  Raffler.elements.itemsCycle.addClass('stopped')
  Raffler._disableTimerStop()
  Raffler._enableTimerStart()
  Raffler._notify('window.countdownTimer stopped', 'notice')
}

// you hit the big raffle button
Raffler.raffleButtonSmash = function () {
  Raffler._notify('BUTTON SMASH', 'notice')
  Raffler._disableRaffle()

  if (Raffler.elements.ckOptResize.is(':checked')) {
    Raffler.elements.itemsCycle.removeClass()
  } else {
    Raffler.elements.itemsCycle.removeClass()
    Raffler.elements.itemsCycle.addClass('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.itemsArr.length > 1) {
    window.countdownTimer.interval = Raffler.initInterval
    window.countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)
    window.countdownTimer.stage = Raffler.stages.INIT
    Raffler.elements.stageValue.text(this.stage)
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

    Raffler.elements.itemsCycle.html(loneItemHTML)
    Raffler.elements.itemsCycle.addClass('level4')

    // grab lone item
    Raffler.lastItemChosen = {
      'name': $('div.item-name').text(),
      'affl': $('div.item-affl').text()
    }

    if (Raffler.elements.ckOptResize.is(':checked')) {
      Raffler.elements.itemsCycle.removeClass()
    }

    Raffler.elements.itemsCycle.removeClass()
    Raffler.elements.itemsCycle.addClass('level-win')
    Raffler.elements.body.addClass('level4')
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
    Raffler.elements.timesRunValue.text(Raffler.timesRun)
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

  Raffler.elements.intervalRange.val(parseInt(Raffler.initInterval))
  Raffler.elements.intervalValue.text(Raffler.elements.intervalRange.val())
  Raffler.elements.stageValue.text(this.stage)

  if (Raffler.elements.ckOptResize.is(':checked')) {
    Raffler.elements.body.removeClass()
    Raffler.elements.itemsCycle.removeClass()
  } else {
    Raffler.elements.body.addClass('level4')
    Raffler.elements.itemsCycle.removeClass()
    Raffler.elements.itemsCycle.addClass('level4')
  }

  Raffler.refreshDebugValues()

  window.countdownTimer.startCountdown = false
  window.countdownTimer.start()
}

// get the whole show going!
Raffler.initApp()
