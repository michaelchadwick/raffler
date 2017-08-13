/* main */
/* app entry point and main functions */
/* global $ */

if ((typeof Raffler) === 'undefined') var Raffler = {}

// app entry point
Raffler.initApp = function () {
  // if admin passed, show hamburger menu
  if ((typeof $.QueryString.admin) !== 'undefined') {
    Raffler.btnAdminMenuToggle.show()
  }

  // add logo, if exists
  if (Raffler.userOptionsMerge && (typeof Raffler.logoFilePath !== 'undefined') && (typeof Raffler.logoFileLink !== 'undefined')) {
    Raffler.title.append(`<span>at</span><a href='${Raffler.logoFileLink}' target='_blank'><img src='${Raffler.logoFilePath}' /></a>`)
  }

  Raffler.setEventHandlers()
  Raffler.checkForLocalStorage()
  Raffler.resetApp()
  Raffler.refreshDebugValues()
  Raffler.refreshItemsGraph(Raffler.itemsLeftArr)

  if (Raffler._getLocalStorageItem('rafflerChosenItems').length) {
    Raffler.refreshChosenItemsDisplay()
    Raffler.divResultsWrapper.show()
  }
  Raffler.divIntervalValue.text(Raffler.divIntervalRange.val())

  Raffler._disableTimerStart()
  Raffler.btnRaffle.focus()

  // Raffler._notify('Raffler init', 'notice')
}

// attach event handlers to button and such
Raffler.setEventHandlers = function () {
  Raffler.btnAdminMenuToggle.click(function () {
    $(this).toggleClass('button-open')
    Raffler.divAdminMenu.toggleClass('menu-show')
  })
  Raffler.divIntervalRange.on('change', function (e) {
    e.preventDefault()
    Raffler.divIntervalValue.text($(this).val())
    countdownTimer.interval = parseInt($(this).val())
  })
  Raffler.ckOptShowGraph.on('change', function (e) {
    Raffler.divItemsGraph.toggle()
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.showGraph = !curObj.showGraph
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.ckOptResize.on('change', function (e) {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.boxResize = !curObj.boxResize
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.ckOptSoundCountdown.on('change', function (e) {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.soundCountdown = !curObj.soundCountdown
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.ckOptSoundVictory.on('change', function (e) {
    var curObj = Raffler._getLocalStorageItem('rafflerOptions')
    curObj.soundVictory = !curObj.soundVictory
    Raffler._setLocalStorageItem('rafflerOptions', curObj)
  })
  Raffler.btnTestSuccess.click(function (e) {
    e.preventDefault()
    Raffler._notify('test success that is long enough to actually go onto a second line because of width and such and thus.', 'success', true)
  })
  Raffler.btnTestNotice.click(function (e) {
    e.preventDefault()
    Raffler._notify('test notice that is long enough to actually go onto a second line because of width and such and thus.', 'notice', true)
  })
  Raffler.btnTestWarning.click(function (e) {
    e.preventDefault()
    Raffler._notify('test notice that is long enough to actually go onto a second line because of width and such and thus.', 'warning', true)
  })
  Raffler.btnTestError.click(function (e) {
    e.preventDefault()
    Raffler._notify('test notice that is long enough to actually go onto a second line because of width and such and thus.', 'error', true)
  })
  Raffler.btnTimerStart.click(function (e) {
    e.preventDefault()
    if (Raffler.btnTimerStart.prop('disabled', false)) {
      countdownTimer.start()
      Raffler.divItemsCycle.removeClass('stopped')
      Raffler._disableTimerStart()
      Raffler._enableTimerStop()
      // Raffler._notify('countdownTimer started', 'notice')
    }
  })
  Raffler.btnTimerStop.click(function (e) {
    e.preventDefault()
    if (Raffler.btnTimerStop.prop('disabled', false)) {
      countdownTimer.stop()
      Raffler.divItemsCycle.addClass('stopped')
      Raffler._disableTimerStop()
      Raffler._enableTimerStart()
      // Raffler._notify('countdownTimer stopped', 'notice')
    }
  })
  Raffler.btnDataReset.click(function (e) {
    e.preventDefault()
    Raffler.divDataResetDialog.dialog({
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

    Raffler.divDataResetDialog.dialog('open')
  })
  Raffler.inputUserItemsAddName.keyup(function (e) {
    var code = e.which
    if (code === 13) {
      e.preventDefault()
      Raffler.btnUserItemsAdd.click()
    }
  })
  Raffler.inputUserItemsAddAffl.keyup(function (e) {
    var code = e.which
    if (code === 13) {
      e.preventDefault()
      Raffler.btnUserItemsAdd.click()
    }
  })
  Raffler.btnUserItemsAdd.click(function () {
    if (Raffler.inputUserItemsAddName.val() !== '' && Raffler.inputUserItemsAddAffl.val() !== '') {
      var newUserItem = {
        'name': Raffler.inputUserItemsAddName.val().trim(),
        'affl': Raffler.inputUserItemsAddAffl.val().trim()
      }

      if (newUserItem !== 'undefined') {
        var tempUserItemObj = Raffler._getLocalStorageItem('rafflerUserItems')
        var newItemAdded = false

        if (!Raffler._isDuplicateValue(newUserItem)) {
          tempUserItemObj.push(Raffler._sanitize(newUserItem))
          newItemAdded = true
          Raffler.btnUserItemsClear.prop('disabled', false)
          Raffler.btnUserItemsClear.removeClass()
        } else {
          Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" not added: duplicate.', 'error', true)
        }

        if (newItemAdded) {
          // update localStorage with temp tempUserItemObj
          Raffler._setLocalStorageItem('rafflerUserItems', tempUserItemObj)
          // show status bubble
          Raffler._notify('user item "' + newUserItem.name + ' (' + newUserItem.affl + ')" added!', 'success', true)
          Raffler.clearUserItemsInput()
          Raffler.syncUserItemsWithItemsArr()
        }
      }
    }
  })
  Raffler.btnUserItemsClear.click(function (e) {
    e.preventDefault()
    try {
      if (Raffler._getLocalStorageItem('rafflerUserItems').length > 0) {
        Raffler.btnUserItemsClear.prop('disabled', false)
        Raffler.btnUserItemsClear.removeClass()

        Raffler.divUserItemsClearDialog.dialog({
          autoOpen: false,
          modal: true,
          resizeable: false,
          height: 'auto',
          buttons: {
            'Clear them!': function () {
              Raffler.resetUserItems()

              Raffler.clearUserItemsInput()

              Raffler.btnUserItemsClear.prop('disabled', true)
              Raffler.btnUserItemsClear.addClass('disabled')

              $(this).dialog('close')
            },
            'Nevermind.': function () {
              $(this).dialog('close')
            }
          }
        })

        Raffler.divUserItemsClearDialog.dialog('open')
      }
    } catch (err) {
      Raffler._notify('btnUserItemsClear: ' + err, 'error')
    }
  })
  Raffler.btnRaffle.click(function (e) {
    e.preventDefault()
    if (!Raffler.btnRaffle.prop('disabled')) {
      Raffler.raffleButtonSmash()
    }
  })
  Raffler.btnChosenConfirmYes.click(function (e) {
    Raffler.lastItemChosenConfirmed = true
    Raffler.continueRaffling()
  })
  Raffler.btnChosenConfirmNo.click(function (e) {
    Raffler.lastItemChosenConfirmed = false
    Raffler.continueRaffling()
  })
  Raffler.btnExportResults.click(function (e) {
    e.preventDefault()
    // Raffler._notify('exporting results', 'notice')

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
      Raffler.divUserItemsManager.hide()
      Raffler._notify('No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
    } else {
      // if our specific keys don't exist, then init
      if (!window.localStorage.getItem('rafflerOptions')) {
        Raffler._setLocalStorageItem('rafflerOptions', Raffler.initOptionsObj)
        // Raffler._notify('checkForLocalStorage: rafflerOptions created', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: rafflerOptions already exists', 'warning')
      }
      Raffler.syncOptionsToUI()
      if (!window.localStorage.getItem('rafflerUserItems')) {
        Raffler._setLocalStorageItem('rafflerUserItems', Raffler.initItemsObj)
        // Raffler._notify('checkForLocalStorage: rafflerUserItems created', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: rafflerUserItems already exists', 'warning')
      }
      if (!window.localStorage.getItem('rafflerChosenItems')) {
        Raffler._setLocalStorageItem('rafflerChosenItems', Raffler.initItemsObj)
        // Raffler._notify('checkForLocalStorage: rafflerChosenItems created!', 'notice')
      } else {
        Raffler._notify('checkForLocalStorage: rafflerChosenItems already exists', 'warning')
      }
    }
  } catch (e) {
    Raffler.hasLocalStorage = false
    Raffler.divUserItemsManager.hide()
    Raffler._notify('No localStorage or sessionStorage support, so no user items or saving of chosen items. Please don\'t reload!', 'error', true)
  }
}

// handy combo shortcut of methods to reset application
Raffler.resetApp = function () {
  Raffler.initItemsArr()

  Raffler.lastItemChosen = ''
  Raffler.timesRun = Raffler._getLocalStorageItem('rafflerChosenItems').length
  Raffler.divIntervalRange.val(Raffler.initInterval)

  Raffler.refreshAvailableItemsDisplay()
  Raffler.refreshResultsCount()
  Raffler.refreshDebugValues()

  // Raffler._notify('Raffler reset', 'notice')
}
// you hit the 'reset data' button
// puts everyone back in raffle
// resets stuff, as if you reloaded page
Raffler.resetCountdown = function () {
  if (Raffler.ckOptResize.is(':checked')) {
    Raffler.divItemsCycle.removeClass()
  } else {
    Raffler.divItemsCycle.removeClass()
    Raffler.divItemsCycle.addClass('level4')
  }

  Raffler.resetApp()
  Raffler.resetChosenItems()
  Raffler.resetUserItems()

  Raffler.divResultsContent.text('')
  Raffler.clearUserItemsInput()
  Raffler.textAvailableItems.text('')
  Raffler.textChosenItems.text('')
  Raffler.divResultsWrapper.hide()
  Raffler._enableRaffle()

  countdownTimer.startCountdown = false
  countdownTimer.interval = Raffler.initInterval
  countdownTimer.mult = Raffler.initMult
  countdownTimer.stage = 0
  countdownTimer.start()

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

    for (var i = 0; i < Raffler.itemsArr.length; i++) {
      for (var j = 0; j < lsUserItems.length; j++) {
        if (Raffler.itemsArr[i].name === lsUserItems[j].name &&
            Raffler.itemsArr[i].affl === lsUserItems[j].affl) {
          Raffler.itemsArr.splice(i, 1)[0]
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
  Raffler.inputUserItemsAddName.val('')
  Raffler.inputUserItemsAddAffl.val('')
}

// fill in-memory itemsArr with server JSON
Raffler.initItemsArr = function () {
  $.getJSON(Raffler.dataFilePath, function (data) {})
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
    Raffler.ckOptShowGraph.prop('checked', true)
    Raffler.divItemsGraph.show()
  } else {
    Raffler.ckOptShowGraph.prop('checked', false)
    Raffler.divItemsGraph.hide()
  }
  lsVals.boxResize
    ? Raffler.ckOptResize.prop('checked', true)
    : Raffler.ckOptResize.prop('checked', false)
  lsVals.soundCountdown
    ? Raffler.ckOptSoundCountdown.prop('checked', true)
    : Raffler.ckOptSoundCountdown.prop('checked', false)
  lsVals.soundVictory
    ? Raffler.ckOptSoundVictory.prop('checked', true)
    : Raffler.ckOptSoundVictory.prop('checked', false)
}
// remove previously chosen items from in-memory itemsArr
Raffler.syncChosenItemsWithItemsArr = function () {
  try {
    var items = Raffler.itemsArr
    var itemsSpliced = []
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

      // Raffler._notify('syncChosenItemsWithItemsArr: synced', 'notice')
    } else {
      // Raffler._notify('syncChosenItemsWithItemsArr: none to sync', 'notice')
    }

    // all items have been chosen on reload
    if (items.length === 0) {
      countdownTimer.stop()
      Raffler._disableRaffle()
      Raffler.divItemsCycle.html('<div>:\'(<br /><br />Nothing to raffle!</div>')
      Raffler.body.addClass('level4')
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
      Raffler.btnUserItemsClear.prop('disabled', false)
      Raffler.btnUserItemsClear.removeClass()

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
      // Raffler._notify('syncUserItemsWithItemsArr: none to sync', 'warning')
    }
    Raffler.refreshAvailableItemsDisplay()
  } catch (e) {
    Raffler._notify('syncUserItemsWithItemsArr: ' + e, 'error')
  }
}

// refresh items graph
Raffler.refreshItemsGraph = function (items) {
  var index = 0
  Raffler.divItemsGraph.html('')
  items.forEach(function (elem) {
    Raffler.divItemsGraph
      .append('<span id=' + (index++) + '></span>')
  })
}
// refresh dem debug values in the admin menu
Raffler.refreshDebugValues = function () {
  Raffler.divStageValue.text(window.countdownTimer.stage)
  Raffler.divIntervalValue.text(window.countdownTimer.interval)
  Raffler.divIntervalRange.val(window.countdownTimer.interval)
  Raffler.divMultiplyValue.text(window.countdownTimer.mult)
  Raffler.divTimesRunValue.text(Raffler.timesRun)
}
// refresh number of raffle results with localStorage values
Raffler.refreshResultsCount = function () {
  Raffler.divResultsCount.text(Raffler._getLocalStorageItem('rafflerChosenItems').length)
}
// refresh chosen items with localStorage values
Raffler.refreshChosenItemsDisplay = function () {
  try {
    var lsChosenItems = Raffler._getLocalStorageItem('rafflerChosenItems')
    if (lsChosenItems && lsChosenItems.length > 0) {
      var ordinal = 1

      Raffler.textChosenItems.text('')
      Raffler.divResultsContent.text('')
      Raffler.divResultsWrapper.show()

      $.each(lsChosenItems, function (key, val) {
        Raffler.divResultsContent.prepend('<li>' + ordinal++ + '. ' + val.name + ' (' + val.affl + ')</li>')
        Raffler.textChosenItems.prepend(val.name + ' (' + val.affl + `)\n`)
      })

      Raffler._notify('refreshChosenItemsDisplay: display updated')
    } else {
      Raffler.textChosenItems.text('')
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
        Raffler.divUserItemsDisplay.children().append('<li>' + val.name + ' (' + val.affl + ')</li>')
      })

      // Raffler._notify('refreshUserItemsDisplay: display updated', 'notice')
    } else {
      Raffler.divUserItemsDisplay.html('')
      Raffler._notify('refreshUserItemsDisplay: none to display')
    }
  } catch (e) {
    Raffler._notify('refreshUserItemsDisplay: ' + e, 'error')
  }
}
// re-display available items from in-memory itemsArr
Raffler.refreshAvailableItemsDisplay = function () {
  Raffler.textAvailableItems.text('')
  Raffler.itemsArr.forEach(function (item) {
    Raffler.textAvailableItems.prepend(item.name + ' (' + item.affl + `)\n`)
  })

  // Raffler._notify('refreshAvailableItems: display updated', 'notice')
}

// add last chosen item to localStorage
Raffler.addChosenItemToLocalStorage = function (lastChosenItem) {
  try {
    var localChosenItemsObj = Raffler._getLocalStorageItem('rafflerChosenItems')
    localChosenItemsObj.push(lastChosenItem)
    Raffler._setLocalStorageItem('rafflerChosenItems', localChosenItemsObj)
    Raffler.refreshAvailableItemsDisplay()
    // Raffler._notify('addChosenItemToLocalStorage: ' + lastChosenItem.name + ' added to LS', 'notice')
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
        Raffler.divIntervalValue.text(result)
        // switch to next item if countdown not done
        if (variableInterval.stage !== 4 && variableInterval.items.length) {
          var curIndex = variableInterval.items[variableInterval.index]

          // check for valid data
          if (curIndex.name && curIndex.affl) {
            var chosenItemHTML = ''
            chosenItemHTML += `<div class='itemName'>${curIndex.name}</div>\n`
            chosenItemHTML += `<div class='itemAffl'>${curIndex.affl}</div>`

            Raffler.divItemsCycle.html(chosenItemHTML)

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
  }
}

// main timer instance for raffler cycler
var countdownTimer = Raffler.timer(function () {
  // this is the variableInterval - so we can change/get the interval here:
  var interval = this.interval

  if (this.startCountdown) {
    // slow down at a certain point
    if (this.interval > 150 && this.interval <= 250) {
      this.stage = 2
      Raffler.divStageValue.text(this.stage)

      if (Raffler.ckOptResize.is(':checked')) {
        Raffler.divItemsCycle.removeClass()
        Raffler.divItemsCycle.addClass('level2')
        Raffler.body.removeClass()
        Raffler.body.addClass('level2')
      }
    }

    // slow down more at a certain point
    if (this.interval > 250 && this.interval <= 325) {
      this.stage = 3
      Raffler.divStageValue.text(this.stage)

      if (Raffler.ckOptResize.is(':checked')) {
        Raffler.divItemsCycle.removeClass()
        Raffler.divItemsCycle.addClass('level3')
        Raffler.body.removeClass()
        Raffler.body.addClass('level3')
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
        this.stage = 4
        Raffler.divStageValue.text(this.stage)
        this.startCountdown = false
        this.stop()

        if (Raffler.ckOptResize.is(':checked')) {
          Raffler.divItemsCycle.removeClass()
        }

        Raffler.divItemsCycle.addClass('level-win')
        Raffler.body.addClass('level4')
        Raffler._playSound('victory')

        // confirm winner
        Raffler._enableChosenConfirm()

        // increment counter of times run
        Raffler.timesRun++
        Raffler.divTimesRunValue.text(Raffler.timesRun)
      } else {
        var intervalMult = interval + this.mult
        Raffler.divIntervalRange.val(intervalMult)
        return intervalMult
      }
    }
  }

  // start countdown!
  if (this.startCountdown && (this.stage === 0 || this.stage === 1)) {
    this.stage = 1
    Raffler.divStageValue.text(this.stage)
    if (!Raffler.divItemsCycle.hasClass('level1')) {
      Raffler.divItemsCycle.addClass('level1')
    }
    Raffler._playSound('beep')
  }
  // if we've started countdown and we haven't reached end
  // then keep cycling with increased multiplier
  if (this.stage > 0 && this.stage !== 4) {
    var newInterval = interval + (1.5 ^ this.mult++)
    Raffler.divMultiplyValue.text(this.mult)
    Raffler.divIntervalRange.val(newInterval)
    return newInterval
  }
}, Raffler.initInterval)

// you hit the big raffle button
Raffler.raffleButtonSmash = function () {
  // Raffler._notify('BUTTON SMASH', 'notice')
  Raffler._disableRaffle()

  if (Raffler.ckOptResize.is(':checked')) {
    Raffler.divItemsCycle.removeClass()
  } else {
    Raffler.divItemsCycle.removeClass()
    Raffler.divItemsCycle.addClass('level4')
  }

  // we got a choice
  // start a countdown
  if (Raffler.itemsArr.length > 1) {
    countdownTimer.interval = Raffler.initInterval
    countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)
    countdownTimer.stage = 0
    Raffler.divStageValue.text(this.stage)
    countdownTimer.startCountdown = true
    countdownTimer.mult = 1
    countdownTimer.start()
  }
  // we got 1 choice, so no choice, really
  // no countdown
  if (Raffler.itemsArr.length === 1) {
    Raffler._notify('Only one item to raffle!<br /><strong>instant winner!</strong>', 'warning', true)

    // don't need to play any sound
    Raffler.ignoreSound = true

    // add lone item to items-cycle
    var loneItemHTML = ''
    loneItemHTML += '<div class=\'itemName\'>' + Raffler.itemsArr[0].name + `</div>\n`
    loneItemHTML += '<div class=\'itemAffl\'>' + Raffler.itemsArr[0].affl + '</div>'

    Raffler.divItemsCycle.html(loneItemHTML)
    Raffler.divItemsCycle.addClass('level4')

    // grab lone item
    Raffler.lastItemChosen = {
      'name': $('div.itemName').text(),
      'affl': $('div.itemAffl').text()
    }

    if (Raffler.ckOptResize.is(':checked')) {
      Raffler.divItemsCycle.removeClass()
    }

    Raffler.divItemsCycle.removeClass()
    Raffler.divItemsCycle.addClass('level-win')
    Raffler.body.addClass('level4')
    Raffler._playSound('victory')

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
    Raffler.divTimesRunValue.text(Raffler.timesRun)
  }

  Raffler.refreshDebugValues()
}

// after confirming a winner or not, go back to raffling
Raffler.continueRaffling = function () {
  // if we have confirmed, then take out of raffle
  if (Raffler.lastItemChosenConfirmed) {
    Raffler.lastItemChosen = {
      'name': $('div.itemName').text(),
      'affl': $('div.itemAffl').text()
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
    // Raffler._notify('Choice rejected. Pool of choices unchanged.', 'notice')
  }

  // either way, disable confirm buttons
  // and re-enable raffler
  Raffler._disableChosenConfirm()
  Raffler._enableRaffle()

  // start an infinite cycle
  countdownTimer.interval = Raffler.initInterval
  countdownTimer.mult = 1
  countdownTimer.stage = 0
  countdownTimer.index = Math.floor(Math.random() * Raffler.itemsArr.length)

  Raffler.divIntervalRange.val(parseInt(Raffler.initInterval))
  Raffler.divIntervalValue.text(Raffler.divIntervalRange.val())
  Raffler.divStageValue.text(this.stage)

  if (Raffler.ckOptResize.is(':checked')) {
    Raffler.body.removeClass()
    Raffler.divItemsCycle.removeClass()
  } else {
    Raffler.body.addClass('level4')
    Raffler.divItemsCycle.removeClass()
    Raffler.divItemsCycle.addClass('level4')
  }

  Raffler.refreshDebugValues()

  countdownTimer.startCountdown = false
  countdownTimer.start()
}

// get the whole show going!
Raffler.initApp()
